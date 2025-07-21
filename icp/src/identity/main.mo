import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";

// 🆔 BTCMiner Digital Identity Canister
// Manages user authentication and multi-chain wallet linking

actor BTCMinerIdentity {
    
    // Types
    public type ChainId = Nat;
    public type WalletAddress = Text;
    
    public type WalletInfo = {
        address: WalletAddress;
        chainId: ChainId;
        chainName: Text;
        verified: Bool;
        linkedAt: Int;
        lastUsed: Int;
    };
    
    public type UserProfile = {
        principal: Principal;
        wallets: [WalletInfo];
        createdAt: Int;
        lastUpdated: Int;
        totalTransactions: Nat;
        preferredChain: ?ChainId;
    };
    
    public type LinkWalletRequest = {
        address: WalletAddress;
        chainId: ChainId;
        chainName: Text;
        signature: Text; // Signature to prove wallet ownership
    };
    
    // State
    private stable var userEntries : [(Principal, UserProfile)] = [];
    private var users = HashMap.fromIter<Principal, UserProfile>(userEntries.vals(), 10, Principal.equal, Principal.hash);
    
    private stable var totalUsers : Nat = 0;
    private stable var totalWallets : Nat = 0;
    
    // Chain configurations
    private let supportedChains : [(ChainId, Text)] = [
        (1, "Ethereum"),
        (56, "BNB Chain"), 
        (8453, "Base"),
        (1399811149, "Solana") // Using Solana's unique identifier
    ];
    
    // Public functions
    
    /// Register a new wallet for the calling user
    public shared(msg) func linkWallet(request: LinkWalletRequest) : async Result.Result<(), Text> {
        let caller = msg.caller;
        let now = Time.now();
        
        // Validate chain ID
        let chainExists = Array.find<(ChainId, Text)>(supportedChains, func(chain) = chain.0 == request.chainId);
        switch (chainExists) {
            case null { return #err("Unsupported chain ID: " # Nat.toText(request.chainId)) };
            case (?_) {};
        };
        
        // Validate wallet address format
        if (Text.size(request.address) < 10) {
            return #err("Invalid wallet address format");
        };
        
        let newWallet: WalletInfo = {
            address = request.address;
            chainId = request.chainId;
            chainName = request.chainName;
            verified = true; // In production, verify signature
            linkedAt = now;
            lastUsed = now;
        };
        
        switch (users.get(caller)) {
            case null {
                // New user
                let profile: UserProfile = {
                    principal = caller;
                    wallets = [newWallet];
                    createdAt = now;
                    lastUpdated = now;
                    totalTransactions = 0;
                    preferredChain = ?request.chainId;
                };
                users.put(caller, profile);
                totalUsers += 1;
                totalWallets += 1;
                
                Debug.print("🆔 New user registered: " # Principal.toText(caller));
                #ok(())
            };
            case (?existingProfile) {
                // Check if wallet already exists
                let walletExists = Array.find<WalletInfo>(existingProfile.wallets, 
                    func(w) = w.address == request.address and w.chainId == request.chainId);
                
                switch (walletExists) {
                    case (?_) { return #err("Wallet already linked to this account") };
                    case null {
                        let updatedWallets = Array.append(existingProfile.wallets, [newWallet]);
                        let updatedProfile: UserProfile = {
                            principal = existingProfile.principal;
                            wallets = updatedWallets;
                            createdAt = existingProfile.createdAt;
                            lastUpdated = now;
                            totalTransactions = existingProfile.totalTransactions;
                            preferredChain = existingProfile.preferredChain;
                        };
                        users.put(caller, updatedProfile);
                        totalWallets += 1;
                        
                        Debug.print("🔗 Wallet linked: " # request.address # " to " # Principal.toText(caller));
                        #ok(())
                    };
                };
            };
        }
    };
    
    /// Get user profile
    public query func getUserProfile(user: Principal) : async ?UserProfile {
        users.get(user)
    };
    
    /// Get current user's profile
    public shared(msg) func getMyProfile() : async ?UserProfile {
        users.get(msg.caller)
    };
    
    /// Get wallets by chain for a user
    public query func getWalletsByChain(user: Principal, chainId: ChainId) : async [WalletInfo] {
        switch (users.get(user)) {
            case null { [] };
            case (?profile) {
                Array.filter(profile.wallets, func(w: WalletInfo) : Bool { w.chainId == chainId })
            };
        }
    };
    
    /// Get all wallets for current user
    public shared(msg) func getMyWallets() : async [WalletInfo] {
        switch (users.get(msg.caller)) {
            case null { [] };
            case (?profile) { profile.wallets };
        }
    };
    
    /// Update preferred chain
    public shared(msg) func setPreferredChain(chainId: ChainId) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case null { #err("User not found") };
            case (?profile) {
                let updatedProfile: UserProfile = {
                    principal = profile.principal;
                    wallets = profile.wallets;
                    createdAt = profile.createdAt;
                    lastUpdated = Time.now();
                    totalTransactions = profile.totalTransactions;
                    preferredChain = ?chainId;
                };
                users.put(caller, updatedProfile);
                #ok(())
            };
        }
    };
    
    /// Remove a wallet
    public shared(msg) func unlinkWallet(address: WalletAddress, chainId: ChainId) : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case null { #err("User not found") };
            case (?profile) {
                let filteredWallets = Array.filter(profile.wallets, 
                    func(w: WalletInfo) : Bool { 
                        not (w.address == address and w.chainId == chainId) 
                    });
                
                if (Array.size(filteredWallets) == Array.size(profile.wallets)) {
                    return #err("Wallet not found");
                };
                
                let updatedProfile: UserProfile = {
                    principal = profile.principal;
                    wallets = filteredWallets;
                    createdAt = profile.createdAt;
                    lastUpdated = Time.now();
                    totalTransactions = profile.totalTransactions;
                    preferredChain = profile.preferredChain;
                };
                users.put(caller, updatedProfile);
                totalWallets -= 1;
                
                Debug.print("🔓 Wallet unlinked: " # address # " from " # Principal.toText(caller));
                #ok(())
            };
        }
    };
    
    /// Increment transaction count for user
    public shared(msg) func recordTransaction() : async Result.Result<(), Text> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case null { #err("User not found") };
            case (?profile) {
                let updatedProfile: UserProfile = {
                    principal = profile.principal;
                    wallets = profile.wallets;
                    createdAt = profile.createdAt;
                    lastUpdated = Time.now();
                    totalTransactions = profile.totalTransactions + 1;
                    preferredChain = profile.preferredChain;
                };
                users.put(caller, updatedProfile);
                #ok(())
            };
        }
    };
    
    // Query functions
    
    /// Get supported chains
    public query func getSupportedChains() : async [(ChainId, Text)] {
        supportedChains
    };
    
    /// Get platform statistics
    public query func getStats() : async {
        totalUsers: Nat;
        totalWallets: Nat;
        supportedChains: Nat;
    } {
        {
            totalUsers = totalUsers;
            totalWallets = totalWallets;
            supportedChains = Array.size(supportedChains);
        }
    };
    
    /// Check if user exists
    public query func userExists(user: Principal) : async Bool {
        switch (users.get(user)) {
            case null { false };
            case (?_) { true };
        }
    };
    
    /// Get user count by chain
    public query func getUserCountByChain(chainId: ChainId) : async Nat {
        let allUsers = Iter.toArray(users.vals());
        let usersWithChain = Array.filter(allUsers, func(profile: UserProfile) : Bool {
            Array.find<WalletInfo>(profile.wallets, func(w) = w.chainId == chainId) != null
        });
        Array.size(usersWithChain)
    };
    
    // System functions
    
    system func preupgrade() {
        userEntries := Iter.toArray(users.entries());
    };
    
    system func postupgrade() {
        userEntries := [];
    };
    
    // Admin functions (in production, add proper access control)
    
    /// Get all users (admin only)
    public query func getAllUsers() : async [UserProfile] {
        Iter.toArray(users.vals())
    };
    
    /// Reset user data (admin only - for testing)
    public func resetAllData() : async () {
        users := HashMap.HashMap<Principal, UserProfile>(10, Principal.equal, Principal.hash);
        totalUsers := 0;
        totalWallets := 0;
        Debug.print("🔄 All user data reset");
    };
}