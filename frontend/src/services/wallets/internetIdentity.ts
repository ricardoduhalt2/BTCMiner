import { ConnectedWallet, WalletError } from '@types/wallet'
import { AuthClient } from '@dfinity/auth-client'
import { Identity } from '@dfinity/agent'

export class InternetIdentityAdapter {
  private authClient: AuthClient | null = null
  private identity: Identity | null = null

  async initialize(): Promise<void> {
    try {
      this.authClient = await AuthClient.create()
    } catch (error: any) {
      throw new WalletError('Failed to initialize Internet Identity', 'INITIALIZATION_FAILED', 'internet-identity')
    }
  }

  isInstalled(): boolean {
    // Internet Identity is web-based, always available
    return true
  }

  async connect(): Promise<ConnectedWallet> {
    if (!this.authClient) {
      await this.initialize()
    }

    if (!this.authClient) {
      throw new WalletError('Internet Identity client not available', 'CLIENT_NOT_AVAILABLE', 'internet-identity')
    }

    try {
      // Check if already authenticated
      const isAuthenticated = await this.authClient.isAuthenticated()
      
      if (!isAuthenticated) {
        // Start the login process
        await new Promise<void>((resolve, reject) => {
          this.authClient!.login({
            identityProvider: process.env.NODE_ENV === 'development' 
              ? `http://localhost:4943/?canisterId=${process.env.VITE_INTERNET_IDENTITY_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}`
              : 'https://identity.ic0.app',
            onSuccess: () => resolve(),
            onError: (error) => reject(new Error(error || 'Authentication failed')),
          })
        })
      }

      // Get the identity
      this.identity = this.authClient.getIdentity()
      const principal = this.identity.getPrincipal()

      if (principal.isAnonymous()) {
        throw new WalletError('Authentication failed - anonymous principal', 'AUTHENTICATION_FAILED', 'internet-identity')
      }

      return {
        id: `internet-identity-${principal.toString()}`,
        type: 'internet-identity',
        address: principal.toString(),
        chainId: 0, // ICP doesn't use traditional chain IDs
        chainName: 'Internet Computer',
        balance: '0', // ICP balance would need to be fetched separately
        isActive: true,
        connectedAt: new Date(),
        principal: principal.toString(),
      }
    } catch (error: any) {
      if (error.message?.includes('UserInterrupt')) {
        throw new WalletError('User cancelled authentication', 'USER_REJECTED', 'internet-identity')
      }
      throw new WalletError(error.message || 'Failed to authenticate', 'AUTHENTICATION_FAILED', 'internet-identity')
    }
  }

  async disconnect(): Promise<void> {
    if (this.authClient) {
      try {
        await this.authClient.logout()
        this.identity = null
      } catch (error) {
        console.warn('Error disconnecting Internet Identity:', error)
      }
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.authClient) {
      return false
    }
    return await this.authClient.isAuthenticated()
  }

  getIdentity(): Identity | null {
    return this.identity
  }

  getPrincipal(): string | null {
    if (!this.identity) {
      return null
    }
    const principal = this.identity.getPrincipal()
    return principal.isAnonymous() ? null : principal.toString()
  }

  async delegationChain(): Promise<any> {
    if (!this.authClient) {
      throw new WalletError('Internet Identity client not available', 'CLIENT_NOT_AVAILABLE', 'internet-identity')
    }

    const identity = this.authClient.getIdentity()
    return identity.getDelegation()
  }

  async getBalance(): Promise<string> {
    // In a real implementation, you would fetch the ICP balance here
    // This would require calling the ICP ledger canister
    try {
      // Mock implementation - in reality you'd call the ledger canister
      return '0'
    } catch (error) {
      console.error('Error getting ICP balance:', error)
      return '0'
    }
  }

  async registerWallet(address: string, chainId: number): Promise<void> {
    if (!this.identity) {
      throw new WalletError('Not authenticated', 'NOT_AUTHENTICATED', 'internet-identity')
    }

    try {
      // In a real implementation, you would call your identity canister here
      // to register the wallet address with the user's principal
      console.log('Registering wallet:', { address, chainId, principal: this.getPrincipal() })
      
      // Mock implementation - replace with actual canister call
      // const actor = createActor(identityCanisterId, { agentOptions: { identity: this.identity } })
      // await actor.registerWallet(address, chainId)
    } catch (error: any) {
      throw new WalletError(error.message || 'Failed to register wallet', 'REGISTRATION_FAILED', 'internet-identity')
    }
  }

  async getRegisteredWallets(): Promise<Array<{ address: string; chainId: number; verified: boolean }>> {
    if (!this.identity) {
      throw new WalletError('Not authenticated', 'NOT_AUTHENTICATED', 'internet-identity')
    }

    try {
      // In a real implementation, you would call your identity canister here
      // to get the registered wallets for the user's principal
      console.log('Getting registered wallets for principal:', this.getPrincipal())
      
      // Mock implementation - replace with actual canister call
      // const actor = createActor(identityCanisterId, { agentOptions: { identity: this.identity } })
      // return await actor.getWalletsByChain(this.identity.getPrincipal(), chainId)
      
      return []
    } catch (error: any) {
      throw new WalletError(error.message || 'Failed to get registered wallets', 'FETCH_FAILED', 'internet-identity')
    }
  }

  async verifyWalletOwnership(address: string, signature: string): Promise<boolean> {
    if (!this.identity) {
      throw new WalletError('Not authenticated', 'NOT_AUTHENTICATED', 'internet-identity')
    }

    try {
      // In a real implementation, you would verify the signature here
      // This would involve checking that the signature was created by the private key
      // corresponding to the given address
      console.log('Verifying wallet ownership:', { address, signature })
      
      // Mock implementation - replace with actual verification logic
      return true
    } catch (error: any) {
      throw new WalletError(error.message || 'Failed to verify wallet ownership', 'VERIFICATION_FAILED', 'internet-identity')
    }
  }
}

// Singleton instance
let internetIdentityAdapter: InternetIdentityAdapter | null = null

export const getInternetIdentityAdapter = (): InternetIdentityAdapter => {
  if (!internetIdentityAdapter) {
    internetIdentityAdapter = new InternetIdentityAdapter()
  }
  return internetIdentityAdapter
}