// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/OFTV2.sol";
import "@layerzerolabs/solidity-examples/contracts/token/oft/v2/BaseOFTV2.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BTCMiner
 * @dev Advanced omnichain fungible token (OFT) leveraging LayerZero's infrastructure
 * for seamless cross-chain operations with dynamic burn-to-mint mechanisms
 */
contract BTCMiner is OFTV2, AccessControl, Pausable, ReentrancyGuard {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ROUTER_ROLE = keccak256("ROUTER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Constants
    uint256 public constant MAX_DAILY_BURN = 1_000_000 * 10**18; // 1M tokens per day
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18; // 100M tokens
    
    // State variables
    mapping(address => uint256) public dailyBurnAmount;
    mapping(address => uint256) public lastBurnReset;
    uint256 public totalBurned;
    uint256 public totalMinted;

    // Events
    event CrossChainTransfer(
        address indexed from,
        uint16 indexed dstChainId,
        bytes indexed to,
        uint256 amount
    );
    event TokensBurned(
        address indexed user,
        uint256 amount,
        uint16 targetChain
    );
    event TokensMinted(
        address indexed user,
        uint256 amount,
        uint16 sourceChain
    );
    event DailyBurnLimitUpdated(uint256 newLimit);

    /**
     * @dev Constructor
     * @param _lzEndpoint LayerZero endpoint address
     * @param _name Token name
     * @param _symbol Token symbol
     */
    constructor(
        address _lzEndpoint,
        string memory _name,
        string memory _symbol
    ) OFTV2(_name, _symbol, 8, _lzEndpoint) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        // Mint initial supply to deployer
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Returns the token implementation (ERC20)
     */
    function token() public view override returns (address) {
        return address(this);
    }

    /**
     * @dev Returns the circulating supply (total supply minus burned tokens)
     */
    function circulatingSupply() public view override returns (uint) {
        return totalSupply();
    }

    /**
     * @dev Override _debitFrom for LayerZero OFT functionality
     */
    function _debitFrom(
        address _from,
        uint16 _dstChainId,
        bytes32 _toAddress,
        uint _amount
    ) internal override whenNotPaused nonReentrant returns (uint) {
        address spender = _msgSender();
        if (_from != spender) _spendAllowance(_from, spender, _amount);
        
        // Check daily burn limit for cross-chain transfers
        _checkDailyBurnLimit(_from, _amount);
        
        // Update daily burn tracking
        if (block.timestamp >= lastBurnReset[_from] + 24 hours) {
            dailyBurnAmount[_from] = 0;
            lastBurnReset[_from] = block.timestamp;
        }
        dailyBurnAmount[_from] += _amount;
        
        _burn(_from, _amount);
        totalBurned += _amount;
        
        emit TokensBurned(_from, _amount, _dstChainId);
        
        return _amount;
    }

    /**
     * @dev Override _creditTo for LayerZero OFT functionality
     */
    function _creditTo(
        uint16 _srcChainId,
        address _toAddress,
        uint _amount
    ) internal override whenNotPaused returns (uint) {
        _mint(_toAddress, _amount);
        totalMinted += _amount;
        
        emit TokensMinted(_toAddress, _amount, _srcChainId);
        
        return _amount;
    }

    /**
     * @dev Burn tokens with daily limit check
     * @param _amount Amount to burn
     */
    function burn(uint256 _amount) external whenNotPaused nonReentrant {
        _checkDailyBurnLimit(msg.sender, _amount);
        _burn(msg.sender, _amount);
        
        // Update daily burn tracking
        if (block.timestamp >= lastBurnReset[msg.sender] + 24 hours) {
            dailyBurnAmount[msg.sender] = 0;
            lastBurnReset[msg.sender] = block.timestamp;
        }
        dailyBurnAmount[msg.sender] += _amount;
        totalBurned += _amount;
    }

    /**
     * @dev Check daily burn limit for user
     */
    function _checkDailyBurnLimit(address user, uint256 amount) internal view {
        uint256 currentDayBurn = dailyBurnAmount[user];
        
        // Reset if new day
        if (block.timestamp >= lastBurnReset[user] + 24 hours) {
            currentDayBurn = 0;
        }
        
        require(
            currentDayBurn + amount <= MAX_DAILY_BURN,
            "BTCMiner: Daily burn limit exceeded"
        );
    }

    /**
     * @dev Get remaining daily burn allowance for user
     */
    function getRemainingDailyBurn(address user) external view returns (uint256) {
        uint256 currentDayBurn = dailyBurnAmount[user];
        
        // Reset if new day
        if (block.timestamp >= lastBurnReset[user] + 24 hours) {
            currentDayBurn = 0;
        }
        
        return MAX_DAILY_BURN - currentDayBurn;
    }

    /**
     * @dev Pause contract (emergency function)
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Override transfer to add pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Support for ERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl, BaseOFTV2)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Emergency withdrawal function (only admin)
     */
    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }

    /**
     * @dev Mint tokens (only for authorized contracts like bridges)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(ROUTER_ROLE) whenNotPaused {
        require(to != address(0), "BTCMiner: mint to zero address");
        require(amount > 0, "BTCMiner: mint amount must be greater than 0");
        
        _mint(to, amount);
        totalMinted += amount;
        
        emit TokensMinted(to, amount, 0); // 0 for local mint
    }

    /**
     * @dev Burn tokens from a specific address (for bridge operations)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external onlyRole(ROUTER_ROLE) whenNotPaused {
        require(from != address(0), "BTCMiner: burn from zero address");
        require(amount > 0, "BTCMiner: burn amount must be greater than 0");
        
        // Check daily burn limit
        _checkDailyBurnLimit(from, amount);
        
        // Update daily burn tracking
        if (block.timestamp >= lastBurnReset[from] + 24 hours) {
            dailyBurnAmount[from] = 0;
            lastBurnReset[from] = block.timestamp;
        }
        dailyBurnAmount[from] += amount;
        
        // Burn tokens (this will check allowance if needed)
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
        totalBurned += amount;
        
        emit TokensBurned(from, amount, 0); // 0 for local burn
    }

    /**
     * @dev Receive function to accept ETH for gas payments
     */
    receive() external payable {}
}