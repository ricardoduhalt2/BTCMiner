import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Float "mo:base/Float";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";

// 📊 BTCMiner Price Monitoring Canister
// Aggregates prices across chains and monitors deviations

actor BTCMinerPriceMonitor {
    
    // Types
    public type ChainId = Nat;
    public type Price = Float;
    public type Timestamp = Int;
    
    public type PriceData = {
        chainId: ChainId;
        chainName: Text;
        price: Price;
        timestamp: Timestamp;
        source: Text;
        confidence: Float; // 0.0 to 1.0
    };
    
    public type PriceAlert = {
        chainId: ChainId;
        chainName: Text;
        deviation: Float;
        currentPrice: Price;
        averagePrice: Price;
        timestamp: Timestamp;
        severity: AlertSeverity;
    };
    
    public type AlertSeverity = {
        #Low;    // 0.5% - 1.0%
        #Medium; // 1.0% - 2.0%
        #High;   // > 2.0%
    };
    
    public type PriceStats = {
        averagePrice: Price;
        minPrice: Price;
        maxPrice: Price;
        priceDeviation: Float;
        lastUpdate: Timestamp;
        activeChains: Nat;
    };
    
    // State
    private stable var priceEntries : [(ChainId, PriceData)] = [];
    private stable var alertEntries : [(Timestamp, PriceAlert)] = [];
    private stable var priceHistoryEntries : [(Timestamp, [PriceData])] = [];
    
    private var prices = HashMap.fromIter<ChainId, PriceData>(priceEntries.vals(), 10, Nat.equal, Int.hash);
    private var alerts = HashMap.fromIter<Timestamp, PriceAlert>(alertEntries.vals(), 50, Int.equal, Int.hash);
    private var priceHistory = HashMap.fromIter<Timestamp, [PriceData]>(priceHistoryEntries.vals(), 100, Int.equal, Int.hash);
    
    // Configuration
    private let DEVIATION_THRESHOLD_LOW: Float = 0.5;    // 0.5%
    private let DEVIATION_THRESHOLD_MEDIUM: Float = 1.0; // 1.0%
    private let DEVIATION_THRESHOLD_HIGH: Float = 2.0;   // 2.0%
    private let UPDATE_INTERVAL: Nat64 = 60_000_000_000; // 1 minute in nanoseconds
    private let MAX_PRICE_AGE: Int = 300_000_000_000;    // 5 minutes in nanoseconds
    private let HISTORY_RETENTION: Int = 86400_000_000_000; // 24 hours
    
    // Chain configurations
    private let chainConfigs : [(ChainId, Text)] = [
        (1, "Ethereum"),
        (56, "BNB Chain"),
        (8453, "Base"),
        (1399811149, "Solana")
    ];
    
    // Stable variables for stats
    private stable var totalPriceUpdates : Nat = 0;
    private stable var totalAlerts : Nat = 0;
    private stable var lastGlobalUpdate : Timestamp = 0;
    
    // Public functions
    
    /// Update price for a specific chain
    public func updatePrice(chainId: ChainId, price: Price, source: Text) : async Result.Result<(), Text> {
        let now = Time.now();
        
        // Validate inputs
        if (price <= 0.0) {
            return #err("Price must be positive");
        };
        
        let chainName = getChainName(chainId);
        
        let newPriceData: PriceData = {
            chainId = chainId;
            chainName = chainName;
            price = price;
            timestamp = now;
            source = source;
            confidence = 0.95; // Default confidence
        };
        
        // Store current price
        prices.put(chainId, newPriceData);
        totalPriceUpdates += 1;
        lastGlobalUpdate := now;
        
        // Store in history
        storeInHistory(newPriceData);
        
        // Check for price deviations
        checkPriceDeviation(chainId, price, chainName);
        
        Debug.print("📊 Price updated: " # chainName # " = $" # Float.toText(price));
        #ok(())
    };
    
    /// Batch update prices for multiple chains
    public func updatePrices(updates: [(ChainId, Price, Text)]) : async [Result.Result<(), Text>] {
        var results : [Result.Result<(), Text>] = [];
        for ((chainId, price, source) in updates.vals()) {
            let result = await updatePrice(chainId, price, source);
            results := Array.append(results, [result]);
        };
        results
    };
    
    /// Get current price for a chain
    public query func getPrice(chainId: ChainId) : async ?PriceData {
        prices.get(chainId)
    };
    
    /// Get all current prices
    public query func getAllPrices() : async [PriceData] {
        Iter.toArray(prices.vals())
    };
    
    /// Get price statistics
    public query func getPriceStats() : async PriceStats {
        let allPrices = Iter.toArray(prices.vals());
        let now = Time.now();
        
        // Filter recent prices (within last 5 minutes)
        let recentPrices = Array.filter(allPrices, func(p: PriceData) : Bool {
            (now - p.timestamp) < MAX_PRICE_AGE
        });
        
        if (Array.size(recentPrices) == 0) {
            return {
                averagePrice = 0.0;
                minPrice = 0.0;
                maxPrice = 0.0;
                priceDeviation = 0.0;
                lastUpdate = lastGlobalUpdate;
                activeChains = 0;
            };
        };
        
        let prices_only = Array.map(recentPrices, func(p: PriceData) : Price { p.price });
        let sum = Array.foldLeft(prices_only, 0.0, func(acc: Float, p: Float) : Float { acc + p });
        let avg = sum / Float.fromInt(Array.size(prices_only));
        
        let min = Array.foldLeft(prices_only, prices_only[0], func(acc: Float, p: Float) : Float { 
            if (p < acc) p else acc 
        });
        
        let max = Array.foldLeft(prices_only, prices_only[0], func(acc: Float, p: Float) : Float { 
            if (p > acc) p else acc 
        });
        
        let deviation = if (avg > 0.0) { ((max - min) / avg) * 100.0 } else { 0.0 };
        
        {
            averagePrice = avg;
            minPrice = min;
            maxPrice = max;
            priceDeviation = deviation;
            lastUpdate = lastGlobalUpdate;
            activeChains = Array.size(recentPrices);
        }
    };
    
    /// Get recent alerts
    public query func getRecentAlerts(limit: Nat) : async [PriceAlert] {
        let allAlerts = Iter.toArray(alerts.vals());
        let sortedAlerts = Array.sort(allAlerts, func(a: PriceAlert, b: PriceAlert) : {#less; #equal; #greater} {
            Int.compare(b.timestamp, a.timestamp)
        });
        
        if (Array.size(sortedAlerts) <= limit) {
            sortedAlerts
        } else {
            Array.take(sortedAlerts, limit)
        }
    };
    
    /// Get alerts by severity
    public query func getAlertsBySeverity(severity: AlertSeverity) : async [PriceAlert] {
        let allAlerts = Iter.toArray(alerts.vals());
        Array.filter(allAlerts, func(alert: PriceAlert) : Bool {
            switch (alert.severity, severity) {
                case (#Low, #Low) { true };
                case (#Medium, #Medium) { true };
                case (#High, #High) { true };
                case (_, _) { false };
            }
        })
    };
    
    /// Get price history for a time range
    public query func getPriceHistory(startTime: Timestamp, endTime: Timestamp) : async [(Timestamp, [PriceData])] {
        let allHistory = Iter.toArray(priceHistory.entries());
        Array.filter(allHistory, func((timestamp, _): (Timestamp, [PriceData])) : Bool {
            timestamp >= startTime and timestamp <= endTime
        })
    };
    
    /// Check if price deviation exists
    public query func hasActiveAlerts() : async Bool {
        let now = Time.now();
        let recentAlerts = Array.filter(Iter.toArray(alerts.vals()), func(alert: PriceAlert) : Bool {
            (now - alert.timestamp) < 3600_000_000_000 // Last hour
        });
        Array.size(recentAlerts) > 0
    };
    
    /// Get monitoring statistics
    public query func getMonitoringStats() : async {
        totalPriceUpdates: Nat;
        totalAlerts: Nat;
        activeChains: Nat;
        lastUpdate: Timestamp;
        systemUptime: Int;
    } {
        {
            totalPriceUpdates = totalPriceUpdates;
            totalAlerts = totalAlerts;
            activeChains = prices.size();
            lastUpdate = lastGlobalUpdate;
            systemUptime = Time.now(); // Simplified uptime
        }
    };
    
    // Private functions
    
    private func getChainName(chainId: ChainId) : Text {
        switch (Array.find<(ChainId, Text)>(chainConfigs, func((id, _)) = id == chainId)) {
            case (?((_, name))) { name };
            case null { "Unknown Chain " # Nat.toText(chainId) };
        }
    };
    
    private func checkPriceDeviation(chainId: ChainId, newPrice: Price, chainName: Text) : () {
        let allPrices = Iter.toArray(prices.vals());
        let otherPrices = Array.filter(allPrices, func(p: PriceData) : Bool { 
            p.chainId != chainId and (Time.now() - p.timestamp) < MAX_PRICE_AGE 
        });
        
        if (Array.size(otherPrices) == 0) {
            return; // No other prices to compare
        };
        
        let otherPricesOnly = Array.map(otherPrices, func(p: PriceData) : Price { p.price });
        let avgPrice = Array.foldLeft(otherPricesOnly, 0.0, func(acc: Float, p: Float) : Float { acc + p }) 
                      / Float.fromInt(Array.size(otherPricesOnly));
        
        let deviation = Float.abs((newPrice - avgPrice) / avgPrice) * 100.0;
        
        if (deviation > DEVIATION_THRESHOLD_LOW) {
            let severity = if (deviation > DEVIATION_THRESHOLD_HIGH) {
                #High
            } else if (deviation > DEVIATION_THRESHOLD_MEDIUM) {
                #Medium  
            } else {
                #Low
            };
            
            let alert: PriceAlert = {
                chainId = chainId;
                chainName = chainName;
                deviation = deviation;
                currentPrice = newPrice;
                averagePrice = avgPrice;
                timestamp = Time.now();
                severity = severity;
            };
            
            alerts.put(Time.now(), alert);
            totalAlerts += 1;
            
            let severityText = switch (severity) {
                case (#Low) { "LOW" };
                case (#Medium) { "MEDIUM" };
                case (#High) { "HIGH" };
            };
            
            Debug.print("🚨 PRICE ALERT [" # severityText # "]: " # chainName # 
                       " deviation: " # Float.toText(deviation) # "% " #
                       "(Current: $" # Float.toText(newPrice) # 
                       ", Average: $" # Float.toText(avgPrice) # ")");
        };
    };
    
    private func storeInHistory(priceData: PriceData) : () {
        let now = Time.now();
        let roundedTime = (now / 60_000_000_000) * 60_000_000_000; // Round to minute
        
        switch (priceHistory.get(roundedTime)) {
            case null {
                priceHistory.put(roundedTime, [priceData]);
            };
            case (?existing) {
                let updated = Array.append(existing, [priceData]);
                priceHistory.put(roundedTime, updated);
            };
        };
        
        // Clean old history
        cleanOldHistory();
    };
    
    private func cleanOldHistory() : () {
        let now = Time.now();
        let cutoff = now - HISTORY_RETENTION;
        
        let allEntries = Iter.toArray(priceHistory.entries());
        let recentEntries = Array.filter(allEntries, func((timestamp, _): (Timestamp, [PriceData])) : Bool {
            timestamp > cutoff
        });
        
        priceHistory := HashMap.fromIter<Timestamp, [PriceData]>(recentEntries.vals(), 100, Int.equal, Int.hash);
    };
    
    // Timer functions
    
    /// Start automatic price monitoring (would fetch from external APIs in production)
    public func startPriceMonitoring() : async () {
        Debug.print("📊 Starting price monitoring...");
        // In production, this would set up timers to fetch from CoinGecko, etc.
        // ignore Timer.recurringTimer(#nanoseconds(UPDATE_INTERVAL), fetchPricesFromSources);
    };
    
    /// Stop price monitoring
    public func stopPriceMonitoring() : async () {
        Debug.print("📊 Stopping price monitoring...");
        // Cancel timers
    };
    
    // System functions
    
    system func preupgrade() {
        priceEntries := Iter.toArray(prices.entries());
        alertEntries := Iter.toArray(alerts.entries());
        priceHistoryEntries := Iter.toArray(priceHistory.entries());
    };
    
    system func postupgrade() {
        priceEntries := [];
        alertEntries := [];
        priceHistoryEntries := [];
    };
    
    // Admin functions
    
    /// Reset all monitoring data (admin only)
    public func resetMonitoringData() : async () {
        prices := HashMap.HashMap<ChainId, PriceData>(10, Nat.equal, Int.hash);
        alerts := HashMap.HashMap<Timestamp, PriceAlert>(50, Int.equal, Int.hash);
        priceHistory := HashMap.HashMap<Timestamp, [PriceData]>(100, Int.equal, Int.hash);
        totalPriceUpdates := 0;
        totalAlerts := 0;
        lastGlobalUpdate := 0;
        Debug.print("🔄 All monitoring data reset");
    };
    
    /// Get supported chains
    public query func getSupportedChains() : async [(ChainId, Text)] {
        chainConfigs
    };
}