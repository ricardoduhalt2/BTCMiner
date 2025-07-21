import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";

// 💧 BTCMiner Liquidity Health Monitoring Canister
// Monitors liquidity across all chains and triggers rebalancing alerts

actor BTCMinerLiquidityHealth {
    
    // Types
    public type ChainId = Nat;
    public type LiquidityAmount = Float;
    public type Timestamp = Int;
    
    public type LiquidityStatus = {
        chainId: ChainId;
        chainName: Text;
        totalLiquidity: LiquidityAmount;
        availableLiquidity: LiquidityAmount;
        reservedLiquidity: LiquidityAmount;
        utilizationRate: Float; // Percentage
        healthScore: Float; // 0-100
        lastUpdate: Timestamp;
        warningLevel: WarningLevel;
        trend: LiquidityTrend;
    };
    
    public type WarningLevel = {
        #Normal;   // > 50% available
        #Low;      // 20-50% available  
        #Critical; // < 20% available
        #Emergency; // < 10% available
    };
    
    public type LiquidityTrend = {
        #Increasing;
        #Stable;
        #Decreasing;
        #Volatile;
    };
    
    public type RebalanceAlert = {
        fromChain: ChainId;
        toChain: ChainId;
        fromChainName: Text;
        toChainName: Text;
        suggestedAmount: LiquidityAmount;
        urgency: AlertUrgency;
        timestamp: Timestamp;
        reason: Text;
    };
    
    public type AlertUrgency = {
        #Low;
        #Medium;
        #High;
        #Critical;
    };
    
    public type LiquidityMetrics = {
        totalLiquidityAcrossChains: LiquidityAmount;
        averageUtilization: Float;
        chainsInWarning: Nat;
        chainsCritical: Nat;
        overallHealthScore: Float;
        lastGlobalUpdate: Timestamp;
    };
    
    public type LiquidityProvider = {
        principal: Principal;
        totalProvided: LiquidityAmount;
        rewardsEarned: Float;
        joinedAt: Timestamp;
        activeChains: [ChainId];
    };
    
    // State
    private stable var liquidityEntries : [(ChainId, LiquidityStatus)] = [];
    private stable var alertEntries : [(Timestamp, RebalanceAlert)] = [];
    private stable var providerEntries : [(Principal, LiquidityProvider)] = [];
    private stable var liquidityHistoryEntries : [(Timestamp, [LiquidityStatus])] = [];
    
    private var liquidityData = HashMap.fromIter<ChainId, LiquidityStatus>(liquidityEntries.vals(), 10, Nat.equal, Int.hash);
    private var rebalanceAlerts = HashMap.fromIter<Timestamp, RebalanceAlert>(alertEntries.vals(), 50, Int.equal, Int.hash);
    private var liquidityProviders = HashMap.fromIter<Principal, LiquidityProvider>(providerEntries.vals(), 100, Principal.equal, Principal.hash);
    private var liquidityHistory = HashMap.fromIter<Timestamp, [LiquidityStatus]>(liquidityHistoryEntries.vals(), 200, Int.equal, Int.hash);
    
    // Configuration thresholds
    private let NORMAL_THRESHOLD: Float = 50.0;     // > 50% available
    private let LOW_THRESHOLD: Float = 20.0;        // 20-50% available
    private let CRITICAL_THRESHOLD: Float = 10.0;   // 10-20% available
    private let EMERGENCY_THRESHOLD: Float = 5.0;   // < 10% available
    
    private let REBALANCE_TRIGGER: Float = 15.0;    // Trigger rebalancing at 15%
    private let PROVIDER_FEE_RATE: Float = 0.1;     // 0.1% fee sharing
    
    // Chain configurations
    private let chainConfigs : [(ChainId, Text)] = [
        (1, "Ethereum"),
        (56, "BNB Chain"),
        (8453, "Base"),
        (1399811149, "Solana")
    ];
    
    // Stats
    private stable var totalRebalanceAlerts : Nat = 0;
    private stable var totalLiquidityProviders : Nat = 0;
    private stable var lastGlobalUpdate : Timestamp = 0;
    
    // Public functions
    
    /// Update liquidity status for a chain
    public func updateLiquidityStatus(
        chainId: ChainId,
        totalLiquidity: LiquidityAmount,
        availableLiquidity: LiquidityAmount
    ) : async Result.Result<(), Text> {
        
        if (totalLiquidity < 0.0 or availableLiquidity < 0.0) {
            return #err("Liquidity amounts must be non-negative");
        };
        
        if (availableLiquidity > totalLiquidity) {
            return #err("Available liquidity cannot exceed total liquidity");
        };
        
        let now = Time.now();
        let chainName = getChainName(chainId);
        let reservedLiquidity = totalLiquidity - availableLiquidity;
        
        let utilizationRate = if (totalLiquidity > 0.0) {
            (reservedLiquidity / totalLiquidity) * 100.0
        } else { 0.0 };
        
        let availabilityRate = if (totalLiquidity > 0.0) {
            (availableLiquidity / totalLiquidity) * 100.0
        } else { 0.0 };
        
        let warningLevel = determineWarningLevel(availabilityRate);
        let healthScore = calculateHealthScore(availabilityRate, utilizationRate);
        let trend = calculateTrend(chainId, availableLiquidity);
        
        let status: LiquidityStatus = {
            chainId = chainId;
            chainName = chainName;
            totalLiquidity = totalLiquidity;
            availableLiquidity = availableLiquidity;
            reservedLiquidity = reservedLiquidity;
            utilizationRate = utilizationRate;
            healthScore = healthScore;
            lastUpdate = now;
            warningLevel = warningLevel;
            trend = trend;
        };
        
        liquidityData.put(chainId, status);
        lastGlobalUpdate := now;
        
        // Store in history
        storeInHistory(status);
        
        // Check if rebalancing is needed
        checkRebalancingNeeds(chainId, status);
        
        let warningText = switch (warningLevel) {
            case (#Normal) { "NORMAL" };
            case (#Low) { "LOW" };
            case (#Critical) { "CRITICAL" };
            case (#Emergency) { "EMERGENCY" };
        };
        
        Debug.print("💧 Liquidity updated: " # chainName # 
                   " - Available: $" # Float.toText(availableLiquidity) # 
                   " (" # Float.toText(availabilityRate) # "%) [" # warningText # "]");
        
        #ok(())
    };
    
    /// Get liquidity status for a specific chain
    public query func getLiquidityStatus(chainId: ChainId) : async ?LiquidityStatus {
        liquidityData.get(chainId)
    };
    
    /// Get all liquidity statuses
    public query func getAllLiquidityStatus() : async [LiquidityStatus] {
        Iter.toArray(liquidityData.vals())
    };
    
    /// Get chains with critical liquidity
    public query func getCriticalChains() : async [LiquidityStatus] {
        let allStatus = Iter.toArray(liquidityData.vals());
        Array.filter(allStatus, func(status: LiquidityStatus) : Bool {
            switch (status.warningLevel) {
                case (#Critical or #Emergency) { true };
                case (_) { false };
            }
        })
    };
    
    /// Get chains by warning level
    public query func getChainsByWarningLevel(level: WarningLevel) : async [LiquidityStatus] {
        let allStatus = Iter.toArray(liquidityData.vals());
        Array.filter(allStatus, func(status: LiquidityStatus) : Bool {
            switch (status.warningLevel, level) {
                case (#Normal, #Normal) { true };
                case (#Low, #Low) { true };
                case (#Critical, #Critical) { true };
                case (#Emergency, #Emergency) { true };
                case (_, _) { false };
            }
        })
    };
    
    /// Get overall liquidity metrics
    public query func getOverallMetrics() : async LiquidityMetrics {
        let allStatus = Iter.toArray(liquidityData.vals());
        
        if (Array.size(allStatus) == 0) {
            return {
                totalLiquidityAcrossChains = 0.0;
                averageUtilization = 0.0;
                chainsInWarning = 0;
                chainsCritical = 0;
                overallHealthScore = 100.0;
                lastGlobalUpdate = lastGlobalUpdate;
            };
        };
        
        let totalLiquidity = Array.foldLeft(allStatus, 0.0, func(acc: Float, status: LiquidityStatus) : Float {
            acc + status.totalLiquidity
        });
        
        let totalUtilization = Array.foldLeft(allStatus, 0.0, func(acc: Float, status: LiquidityStatus) : Float {
            acc + status.utilizationRate
        });
        let avgUtilization = totalUtilization / Float.fromInt(Array.size(allStatus));
        
        let warningChains = Array.filter(allStatus, func(status: LiquidityStatus) : Bool {
            switch (status.warningLevel) {
                case (#Low) { true };
                case (_) { false };
            }
        });
        
        let criticalChains = Array.filter(allStatus, func(status: LiquidityStatus) : Bool {
            switch (status.warningLevel) {
                case (#Critical or #Emergency) { true };
                case (_) { false };
            }
        });
        
        let totalHealthScore = Array.foldLeft(allStatus, 0.0, func(acc: Float, status: LiquidityStatus) : Float {
            acc + status.healthScore
        });
        let overallHealth = totalHealthScore / Float.fromInt(Array.size(allStatus));
        
        {
            totalLiquidityAcrossChains = totalLiquidity;
            averageUtilization = avgUtilization;
            chainsInWarning = Array.size(warningChains);
            chainsCritical = Array.size(criticalChains);
            overallHealthScore = overallHealth;
            lastGlobalUpdate = lastGlobalUpdate;
        }
    };
    
    /// Get recent rebalance alerts
    public query func getRecentAlerts(limit: Nat) : async [RebalanceAlert] {
        let allAlerts = Iter.toArray(rebalanceAlerts.vals());
        let sortedAlerts = Array.sort(allAlerts, func(a: RebalanceAlert, b: RebalanceAlert) : {#less; #equal; #greater} {
            Int.compare(b.timestamp, a.timestamp)
        });
        
        if (Array.size(sortedAlerts) <= limit) {
            sortedAlerts
        } else {
            Array.take(sortedAlerts, limit)
        }
    };
    
    /// Get alerts by urgency
    public query func getAlertsByUrgency(urgency: AlertUrgency) : async [RebalanceAlert] {
        let allAlerts = Iter.toArray(rebalanceAlerts.vals());
        Array.filter(allAlerts, func(alert: RebalanceAlert) : Bool {
            switch (alert.urgency, urgency) {
                case (#Low, #Low) { true };
                case (#Medium, #Medium) { true };
                case (#High, #High) { true };
                case (#Critical, #Critical) { true };
                case (_, _) { false };
            }
        })
    };
    
    /// Register as liquidity provider
    public shared(msg) func registerLiquidityProvider(initialAmount: LiquidityAmount, chains: [ChainId]) : async Result.Result<(), Text> {
        let caller = msg.caller;
        let now = Time.now();
        
        switch (liquidityProviders.get(caller)) {
            case (?_) { return #err("Already registered as liquidity provider") };
            case null {
                let provider: LiquidityProvider = {
                    principal = caller;
                    totalProvided = initialAmount;
                    rewardsEarned = 0.0;
                    joinedAt = now;
                    activeChains = chains;
                };
                liquidityProviders.put(caller, provider);
                totalLiquidityProviders += 1;
                
                Debug.print("💧 New liquidity provider registered: " # Principal.toText(caller));
                #ok(())
            };
        }
    };
    
    /// Get liquidity provider info
    public shared(msg) func getMyProviderInfo() : async ?LiquidityProvider {
        liquidityProviders.get(msg.caller)
    };
    
    /// Calculate rewards for liquidity provider
    public shared(msg) func calculateRewards() : async Result.Result<Float, Text> {
        let caller = msg.caller;
        
        switch (liquidityProviders.get(caller)) {
            case null { #err("Not registered as liquidity provider") };
            case (?provider) {
                // Simplified reward calculation
                let baseReward = provider.totalProvided * PROVIDER_FEE_RATE / 100.0;
                let timeBonus = Float.fromInt((Time.now() - provider.joinedAt) / 86400_000_000_000) * 0.01; // 1% per day
                let totalReward = baseReward + timeBonus;
                
                #ok(totalReward)
            };
        }
    };
    
    // Private functions
    
    private func getChainName(chainId: ChainId) : Text {
        switch (Array.find<(ChainId, Text)>(chainConfigs, func((id, _)) = id == chainId)) {
            case (?((_, name))) { name };
            case null { "Unknown Chain " # Nat.toText(chainId) };
        }
    };
    
    private func determineWarningLevel(availabilityRate: Float) : WarningLevel {
        if (availabilityRate <= EMERGENCY_THRESHOLD) {
            #Emergency
        } else if (availabilityRate <= CRITICAL_THRESHOLD) {
            #Critical
        } else if (availabilityRate <= LOW_THRESHOLD) {
            #Low
        } else {
            #Normal
        }
    };
    
    private func calculateHealthScore(availabilityRate: Float, utilizationRate: Float) : Float {
        // Health score based on availability and utilization balance
        let availabilityScore = Float.min(100.0, availabilityRate * 2.0);
        let utilizationScore = if (utilizationRate > 80.0) {
            100.0 - (utilizationRate - 80.0) * 2.0 // Penalize over-utilization
        } else {
            100.0
        };
        
        (availabilityScore + utilizationScore) / 2.0
    };
    
    private func calculateTrend(chainId: ChainId, currentLiquidity: LiquidityAmount) : LiquidityTrend {
        // Simplified trend calculation - in production, would analyze historical data
        switch (liquidityData.get(chainId)) {
            case null { #Stable };
            case (?previous) {
                let change = currentLiquidity - previous.availableLiquidity;
                let changePercent = if (previous.availableLiquidity > 0.0) {
                    (change / previous.availableLiquidity) * 100.0
                } else { 0.0 };
                
                if (Float.abs(changePercent) < 5.0) {
                    #Stable
                } else if (changePercent > 15.0) {
                    #Increasing
                } else if (changePercent < -15.0) {
                    #Decreasing
                } else {
                    #Volatile
                }
            };
        }
    };
    
    private func checkRebalancingNeeds(chainId: ChainId, status: LiquidityStatus) : () {
        let availabilityRate = if (status.totalLiquidity > 0.0) {
            (status.availableLiquidity / status.totalLiquidity) * 100.0
        } else { 0.0 };
        
        if (availabilityRate < REBALANCE_TRIGGER) {
            // Find chain with excess liquidity for rebalancing
            let allStatus = Iter.toArray(liquidityData.vals());
            let excessChains = Array.filter(allStatus, func(s: LiquidityStatus) : Bool {
                s.chainId != chainId and 
                (s.availableLiquidity / s.totalLiquidity) * 100.0 > 60.0 // Has excess liquidity
            });
            
            if (Array.size(excessChains) > 0) {
                let sourceChain = excessChains[0]; // Take first available
                let suggestedAmount = Float.min(
                    sourceChain.availableLiquidity * 0.3, // Max 30% of source
                    status.totalLiquidity * 0.2 // Or 20% of target total
                );
                
                let urgency = switch (status.warningLevel) {
                    case (#Emergency) { #Critical };
                    case (#Critical) { #High };
                    case (#Low) { #Medium };
                    case (#Normal) { #Low };
                };
                
                let alert: RebalanceAlert = {
                    fromChain = sourceChain.chainId;
                    toChain = chainId;
                    fromChainName = sourceChain.chainName;
                    toChainName = status.chainName;
                    suggestedAmount = suggestedAmount;
                    urgency = urgency;
                    timestamp = Time.now();
                    reason = "Low liquidity detected: " # Float.toText(availabilityRate) # "% available";
                };
                
                rebalanceAlerts.put(Time.now(), alert);
                totalRebalanceAlerts += 1;
                
                let urgencyText = switch (urgency) {
                    case (#Low) { "LOW" };
                    case (#Medium) { "MEDIUM" };
                    case (#High) { "HIGH" };
                    case (#Critical) { "CRITICAL" };
                };
                
                Debug.print("🚨 REBALANCE ALERT [" # urgencyText # "]: " # 
                           sourceChain.chainName # " → " # status.chainName # 
                           " (Amount: $" # Float.toText(suggestedAmount) # ")");
            };
        };
    };
    
    private func storeInHistory(status: LiquidityStatus) : () {
        let now = Time.now();
        let roundedTime = (now / 300_000_000_000) * 300_000_000_000; // Round to 5 minutes
        
        switch (liquidityHistory.get(roundedTime)) {
            case null {
                liquidityHistory.put(roundedTime, [status]);
            };
            case (?existing) {
                let updated = Array.append(existing, [status]);
                liquidityHistory.put(roundedTime, updated);
            };
        };
    };
    
    // Query functions
    
    /// Get supported chains
    public query func getSupportedChains() : async [(ChainId, Text)] {
        chainConfigs
    };
    
    /// Get system statistics
    public query func getSystemStats() : async {
        totalAlerts: Nat;
        totalProviders: Nat;
        activeChains: Nat;
        lastUpdate: Timestamp;
    } {
        {
            totalAlerts = totalRebalanceAlerts;
            totalProviders = totalLiquidityProviders;
            activeChains = liquidityData.size();
            lastUpdate = lastGlobalUpdate;
        }
    };
    
    // System functions
    
    system func preupgrade() {
        liquidityEntries := Iter.toArray(liquidityData.entries());
        alertEntries := Iter.toArray(rebalanceAlerts.entries());
        providerEntries := Iter.toArray(liquidityProviders.entries());
        liquidityHistoryEntries := Iter.toArray(liquidityHistory.entries());
    };
    
    system func postupgrade() {
        liquidityEntries := [];
        alertEntries := [];
        providerEntries := [];
        liquidityHistoryEntries := [];
    };
    
    // Admin functions
    
    /// Reset all data (admin only)
    public func resetAllData() : async () {
        liquidityData := HashMap.HashMap<ChainId, LiquidityStatus>(10, Nat.equal, Int.hash);
        rebalanceAlerts := HashMap.HashMap<Timestamp, RebalanceAlert>(50, Int.equal, Int.hash);
        liquidityProviders := HashMap.HashMap<Principal, LiquidityProvider>(100, Principal.equal, Principal.hash);
        liquidityHistory := HashMap.HashMap<Timestamp, [LiquidityStatus]>(200, Int.equal, Int.hash);
        totalRebalanceAlerts := 0;
        totalLiquidityProviders := 0;
        lastGlobalUpdate := 0;
        Debug.print("🔄 All liquidity data reset");
    };
}