// contracts/CoinToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinToken {
    string public name = "ShopCoin";
    string public symbol = "COIN";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Mapping userId to wallet address
    mapping(uint256 => address) public userWallets;
    mapping(address => uint256) public walletToUserId;
    
    address public owner;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event UserWalletRegistered(uint256 indexed userId, address indexed wallet);
    event CoinsMinted(address indexed to, uint256 amount);
    
    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        totalSupply = _initialSupply * 10 ** uint256(decimals);
        balanceOf[owner] = totalSupply;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    // Register user wallet
    function registerUserWallet(uint256 userId, address wallet) public onlyOwner {
        require(userWallets[userId] == address(0), "User already registered");
        require(walletToUserId[wallet] == 0, "Wallet already registered");
        
        userWallets[userId] = wallet;
        walletToUserId[wallet] = userId;
        
        emit UserWalletRegistered(userId, wallet);
    }
    
    // Mint coins to user (for rewards, purchases, etc.)
    function mintCoins(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Invalid address");
        
        uint256 tokens = amount * 10 ** uint256(decimals);
        balanceOf[to] += tokens;
        totalSupply += tokens;
        
        emit CoinsMinted(to, tokens);
        emit Transfer(address(0), to, tokens);
    }
    
    // Transfer coins
    function transfer(address to, uint256 value) public returns (bool success) {
        require(to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    // Transfer by userId
    function transferByUserId(uint256 toUserId, uint256 amount) public returns (bool success) {
        address toAddress = userWallets[toUserId];
        require(toAddress != address(0), "User not registered");
        
        uint256 value = amount * 10 ** uint256(decimals);
        return transfer(toAddress, value);
    }
    
    // Approve spending
    function approve(address spender, uint256 value) public returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    // Transfer from approved address
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(value <= balanceOf[from], "Insufficient balance");
        require(value <= allowance[from][msg.sender], "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
    
    // Get balance in readable format
    function getBalance(address account) public view returns (uint256) {
        return balanceOf[account] / 10 ** uint256(decimals);
    }
    
    // Get user balance by userId
    function getUserBalance(uint256 userId) public view returns (uint256) {
        address wallet = userWallets[userId];
        if (wallet == address(0)) return 0;
        return getBalance(wallet);
    }
}