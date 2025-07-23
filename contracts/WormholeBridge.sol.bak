// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./BTCMiner.sol";

/**
 * @title WormholeBridge
 * @dev Bridge contract for cross-chain BTCMiner token transfers via Wormhole
 */
contract WormholeBridge is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    // Wormhole Core Bridge interface
    interface IWormhole {
        struct VM {
            uint8 version;
            uint32 timestamp;
            uint32 nonce;
            uint16 emitterChainId;
            bytes32 emitterAddress;
            uint64 sequence;
            uint8 consistencyLevel;
            bytes payload;
            uint32 guardianSetIndex;
            bytes[] signatures;
            bytes32 hash;
        }

        function publishMessage(
            uint32 nonce,
            bytes memory payload,
            uint8 consistencyLevel
        ) external payable returns (uint64 sequence);

        function parseAndVerifyVM(bytes calldata encodedVM)
            external
            view
            returns (VM memory vm, bool valid, string memory reason);

        function messageFee() external view returns (uint256);
    }

    // Cross-chain message structure
    struct CrossChainMessage {
        uint8 action; // 1 = burn, 2 = mint
        uint256 amount;
        address recipient;
        uint16 sourceChain;
        uint16 targetChain;
        uint32 nonce;
        bytes32 txHash;
    }

    // State variables
    IWormhole public immutable wormhole;
    BTCMiner public immutable btcMiner;
    uint16 public immutable chainId;
    
    mapping(bytes32 => bool) public processedMessages;
    mapping(uint16 => bytes32) public trustedEmitters;
    mapping(address => uint256) public nonces;
    
    uint256 public totalBridged;
    uint256 public totalReceived;
    
    // Events
    event MessageSent(
        uint64 indexed sequence,
        uint16 indexed targetChain,
        address indexed sender,
        uint256 amount,
        uint32 nonce
    );
    
    event MessageReceived(
        bytes32 indexed messageHash,
        uint16 indexed sourceChain,
        address indexed recipient,
        uint256 amount
    );
    
    event TrustedEmitterSet(uint16 indexed chainId, bytes32 emitter);
    
    event BridgeConfigured(address indexed btcMiner, address indexed wormhole);

    /**
     * @dev Constructor
     * @param _wormhole Wormhole core bridge address
     * @param _btcMiner BTCMiner token contract address
     * @param _chainId Wormhole chain ID for this network
     */
    constructor(
        address _wormhole,
        address _btcMiner,
        uint16 _chainId
    ) {
        require(_wormhole != address(0), "Invalid Wormhole address");
        require(_btcMiner != address(0), "Invalid BTCMiner address");
        
        wormhole = IWormhole(_wormhole);
        btcMiner = BTCMiner(_btcMiner);
        chainId = _chainId;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRIDGE_ROLE, msg.sender);
        
        emit BridgeConfigured(_btcMiner, _wormhole);
    }

    /**
     * @dev Send tokens to another chain via Wormhole
     * @param amount Amount of tokens to bridge
     * @param targetChain Target Wormhole chain ID
     * @param recipient Recipient address on target chain
     */
    function sendTokens(
        uint256 amount,
        uint16 targetChain,
        address recipient
    ) external payable whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");
        require(trustedEmitters[targetChain] != bytes32(0), "Target chain not supported");
        require(msg.value >= wormhole.messageFee(), "Insufficient fee");

        // Get user's nonce
        uint32 nonce = uint32(nonces[msg.sender]++);
        
        // Burn tokens from sender
        btcMiner.burnFrom(msg.sender, amount);
        
        // Create cross-chain message
        CrossChainMessage memory message = CrossChainMessage({
            action: 1, // Burn action
            amount: amount,
            recipient: recipient,
            sourceChain: chainId,
            targetChain: targetChain,
            nonce: nonce,
            txHash: bytes32(uint256(uint160(msg.sender))) // Simplified tx hash
        });
        
        // Encode message
        bytes memory payload = abi.encode(message);
        
        // Send via Wormhole
        uint64 sequence = wormhole.publishMessage{value: msg.value}(
            nonce,
            payload,
            200 // Finality level
        );
        
        totalBridged += amount;
        
        emit MessageSent(sequence, targetChain, msg.sender, amount, nonce);
    }

    /**
     * @dev Receive tokens from another chain via Wormhole VAA
     * @param encodedVM Encoded Wormhole VAA
     */
    function receiveTokens(bytes memory encodedVM) 
        external 
        whenNotPaused 
        nonReentrant 
        onlyRole(RELAYER_ROLE) 
    {
        // Parse and verify VAA
        (IWormhole.VM memory vm, bool valid, string memory reason) = wormhole.parseAndVerifyVM(encodedVM);
        require(valid, reason);
        
        // Check if message already processed
        require(!processedMessages[vm.hash], "Message already processed");
        
        // Verify emitter is trusted
        require(trustedEmitters[vm.emitterChainId] == vm.emitterAddress, "Untrusted emitter");
        
        // Mark as processed
        processedMessages[vm.hash] = true;
        
        // Decode message
        CrossChainMessage memory message = abi.decode(vm.payload, (CrossChainMessage));
        
        // Validate message
        require(message.action == 1, "Invalid action"); // Only process burn messages
        require(message.targetChain == chainId, "Wrong target chain");
        require(message.amount > 0, "Invalid amount");
        require(message.recipient != address(0), "Invalid recipient");
        
        // Mint tokens to recipient
        btcMiner.mint(message.recipient, message.amount);
        
        totalReceived += message.amount;
        
        emit MessageReceived(vm.hash, vm.emitterChainId, message.recipient, message.amount);
    }

    /**
     * @dev Set trusted emitter for a chain
     * @param _chainId Wormhole chain ID
     * @param _emitter Emitter address (32 bytes)
     */
    function setTrustedEmitter(uint16 _chainId, bytes32 _emitter) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_emitter != bytes32(0), "Invalid emitter");
        trustedEmitters[_chainId] = _emitter;
        emit TrustedEmitterSet(_chainId, _emitter);
    }

    /**
     * @dev Get message fee for Wormhole
     */
    function getMessageFee() external view returns (uint256) {
        return wormhole.messageFee();
    }

    /**
     * @dev Check if a VAA has been processed
     * @param vaaHash Hash of the VAA
     */
    function isMessageProcessed(bytes32 vaaHash) external view returns (bool) {
        return processedMessages[vaaHash];
    }

    /**
     * @dev Get trusted emitter for a chain
     * @param _chainId Wormhole chain ID
     */
    function getTrustedEmitter(uint16 _chainId) external view returns (bytes32) {
        return trustedEmitters[_chainId];
    }

    /**
     * @dev Get bridge statistics
     */
    function getBridgeStats() external view returns (uint256 bridged, uint256 received) {
        return (totalBridged, totalReceived);
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Emergency unpause
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Withdraw stuck ETH (emergency function)
     */
    function withdrawETH() external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }

    /**
     * @dev Receive ETH for Wormhole fees
     */
    receive() external payable {}
}