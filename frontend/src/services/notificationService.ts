import { store } from '../store';
import { addNotification, addMultipleNotifications } from '../store/slices/notificationSlice';
import type { Notification } from '../store/slices/notificationSlice';

class NotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private realtimeSubscription: any = null;
  private currentUserId: string | null = null;
  private initialized = false;

  constructor() {
    // Don't initialize immediately, wait for first method call
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      this.initialized = true;
      
      try {
        // Test import first
        const { testSupabase } = await import('../lib/supabase-test');
        testSupabase();
        
        // Dynamically import supabase to avoid initialization issues
        const { supabase, createRealtimeSubscription } = await import('../lib/supabase');
        
        // Initialize Supabase realtime
        this.initializeSupabaseRealtime(supabase, createRealtimeSubscription);
        
        // Only initialize WebSocket in production or when explicitly enabled
        if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_WEBSOCKET === 'true') {
          this.initializeWebSocket();
        } else {
          console.log('WebSocket notifications disabled in development mode');
        }
      } catch (error) {
        console.error('Failed to initialize notification service:', error);
      }
    }
  }

  private initializeSupabaseRealtime(supabase: any, createRealtimeSubscription: any) {
    // Listen for auth changes to set up user-specific subscriptions
    supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.setupUserSubscriptions(session.user.id, createRealtimeSubscription);
      } else if (event === 'SIGNED_OUT') {
        this.cleanupUserSubscriptions(supabase);
      }
    });
  }

  private setupUserSubscriptions(userId: string, createRealtimeSubscription: any) {
    this.currentUserId = userId;
    this.cleanupUserSubscriptions(); // Clean up any existing subscriptions
    
    // Subscribe to notifications for this user
    this.realtimeSubscription = createRealtimeSubscription(
      'notifications',
      (payload: any) => this.handleSupabaseNotification(payload),
      `user_id=eq.${userId}`
    );
    
    console.log('Supabase realtime notifications initialized for user:', userId);
  }

  private async cleanupUserSubscriptions(supabase?: any) {
    if (this.realtimeSubscription && supabase) {
      supabase.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
    }
    this.currentUserId = null;
  }

  private handleSupabaseNotification(payload: any) {
    console.log('Supabase notification received:', payload);
    
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'INSERT' && newRecord) {
      this.convertAndDispatchNotification(newRecord);
    }
  }

  private convertAndDispatchNotification(dbNotification: any) {
    // Convert Supabase notification to Redux notification format
    const notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'> = {
      type: dbNotification.type,
      priority: dbNotification.priority,
      title: dbNotification.title,
      message: dbNotification.message,
      actionUrl: dbNotification.action_url || undefined,
      metadata: dbNotification.metadata || undefined,
    };
    
    // Add to Redux store
    store.dispatch(addNotification(notification));
  }

  private initializeWebSocket() {
    try {
      const wsUrl = import.meta.env.PROD 
        ? 'wss://api.btcminer.com/ws/notifications'
        : 'ws://localhost:3001/ws/notifications';
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('Notification WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Send authentication if user is logged in
        const state = store.getState();
        if (state.wallet.connectedWallets.length > 0) {
          this.authenticate();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Notification WebSocket disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.handleReconnect();
    }
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'notification':
        store.dispatch(addNotification(data.payload));
        break;
      
      case 'bulk_notifications':
        store.dispatch(addMultipleNotifications(data.payload));
        break;
      
      case 'price_update':
        this.handlePriceUpdate(data.payload);
        break;
      
      case 'transaction_update':
        this.handleTransactionUpdate(data.payload);
        break;
      
      case 'security_alert':
        this.handleSecurityAlert(data.payload);
        break;
      
      default:
        console.warn('Unknown WebSocket message type:', data.type);
    }
  }

  private handlePriceUpdate(payload: any) {
    const { symbol, price, change24h, alerts } = payload;
    
    // Check if any price alerts should be triggered
    alerts?.forEach((alert: any) => {
      store.dispatch(addNotification({
        type: 'price',
        priority: 'medium',
        title: `Price Alert: ${symbol}`,
        message: `${symbol} is now ${alert.condition} ${alert.targetPrice}. Current price: ${price}`,
        metadata: { symbol, price, change24h, alert },
      }));
    });
  }

  private handleTransactionUpdate(payload: any) {
    const { txHash, status, amount, token, chainId } = payload;
    
    const statusMessages: Record<string, string> = {
      pending: 'Transaction submitted and pending confirmation',
      confirmed: 'Transaction confirmed successfully',
      failed: 'Transaction failed to execute',
    };

    const priorities: Record<string, 'low' | 'medium' | 'high'> = {
      pending: 'low',
      confirmed: 'medium',
      failed: 'high',
    };

    store.dispatch(addNotification({
      type: 'transaction',
      priority: priorities[status] || 'low',
      title: `Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: statusMessages[status] || `Transaction status: ${status}`,
      actionUrl: this.getExplorerUrl(chainId, txHash),
      metadata: { txHash, status, amount, token, chainId },
    }));
  }

  private handleSecurityAlert(payload: any) {
    const { alertType, severity, message, details } = payload;
    
    store.dispatch(addNotification({
      type: 'security',
      priority: severity === 'critical' ? 'high' : 'medium',
      title: 'Security Alert',
      message: message || 'Security event detected',
      metadata: { alertType, severity, details },
    }));
  }

  private authenticate() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const state = store.getState();
      const walletAddresses = state.wallet.connectedWallets.map(w => w.address);
      
      this.ws.send(JSON.stringify({
        type: 'authenticate',
        payload: { walletAddresses }
      }));
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect WebSocket in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.initializeWebSocket();
      }, delay);
    } else {
      console.error('Max WebSocket reconnection attempts reached');
    }
  }

  private getExplorerUrl(chainId: number, txHash: string): string {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      56: 'https://bscscan.com/tx/',
      8453: 'https://basescan.org/tx/',
      137: 'https://polygonscan.com/tx/',
    };
    
    return (explorers[chainId] || 'https://etherscan.io/tx/') + txHash;
  }

  // Public methods for manual notification creation
  public async createPriceAlert(
    symbol: string,
    currentPrice: number,
    targetPrice: number,
    condition: 'above' | 'below'
  ) {
    await this.ensureInitialized();
    store.dispatch(addNotification({
      type: 'price',
      priority: 'medium',
      title: `Price Alert Set: ${symbol}`,
      message: `You'll be notified when ${symbol} goes ${condition} ${targetPrice}`,
      metadata: { symbol, currentPrice, targetPrice, condition },
    }));
  }

  public async createTransactionNotification(
    type: 'initiated' | 'pending' | 'confirmed' | 'failed',
    txHash: string,
    amount?: string,
    token?: string,
    chainId?: number
  ) {
    await this.ensureInitialized();
    const titles = {
      initiated: 'Transaction Initiated',
      pending: 'Transaction Pending',
      confirmed: 'Transaction Confirmed',
      failed: 'Transaction Failed',
    };

    const priorities = {
      initiated: 'low' as const,
      pending: 'low' as const,
      confirmed: 'medium' as const,
      failed: 'high' as const,
    };

    store.dispatch(addNotification({
      type: 'transaction',
      priority: priorities[type],
      title: titles[type],
      message: amount && token 
        ? `${amount} ${token} transaction ${type}`
        : `Transaction ${type}`,
      actionUrl: chainId && txHash ? this.getExplorerUrl(chainId, txHash) : undefined,
      metadata: { txHash, amount, token, chainId, type },
    }));
  }

  public async createSecurityAlert(message: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    await this.ensureInitialized();
    store.dispatch(addNotification({
      type: 'security',
      priority: severity,
      title: 'Security Alert',
      message,
      metadata: { severity },
    }));
  }

  public async createLiquidityWarning(
    poolName: string,
    warningType: string,
    message: string
  ) {
    await this.ensureInitialized();
    store.dispatch(addNotification({
      type: 'liquidity',
      priority: 'medium',
      title: `Liquidity Warning: ${poolName}`,
      message,
      metadata: { poolName, warningType },
    }));
  }

  public async createSystemNotification(
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' = 'low'
  ) {
    await this.ensureInitialized();
    store.dispatch(addNotification({
      type: 'system',
      priority,
      title,
      message,
      metadata: {},
    }));
  }

  // Cleanup method
  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Method to update authentication when wallets change
  public async updateAuthentication() {
    await this.ensureInitialized();
    this.authenticate();
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Export for use in components
export default notificationService;