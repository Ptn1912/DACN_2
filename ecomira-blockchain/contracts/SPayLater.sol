// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SPayLater is Ownable {
    using ECDSA for bytes32;

    struct Customer {
        uint256 creditLimit;
        uint256 availableCredit;
        uint256 usedCredit;
        uint256 totalTransactions;
        uint256 totalPaid;
        uint256 totalOverdue;
        bool isActive;
    }

    struct Transaction {
        address customer;
        uint256 amount;
        uint256 purchaseDate;
        uint256 dueDate;
        uint256 paidAmount;
        TransactionStatus status;
        string orderId;
    }

    enum TransactionStatus {
        PENDING,
        PARTIALLY_PAID,
        PAID,
        OVERDUE,
        CANCELLED
    }

    // Storage
    mapping(address => Customer) public customers;
    mapping(address => uint256[]) public customerTransactions;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256) public nonces; // For meta transactions
    
    uint256 public nextTransactionId = 1;
    uint256 public constant DEFAULT_CREDIT_LIMIT = 2000000; // 2M VND
    uint256 public constant PAYMENT_PERIOD = 30 days;
    uint256 public constant LATE_FEE_PERCENTAGE = 5;

    // Events
    event CustomerRegistered(address indexed customer, uint256 creditLimit);
    event TransactionCreated(uint256 indexed transactionId, address indexed customer, uint256 amount);
    event PaymentMade(uint256 indexed transactionId, address indexed customer, uint256 amount);
    event TransactionOverdue(uint256 indexed transactionId, uint256 lateFee);

    constructor() Ownable(msg.sender) {}

    // =================================
    // META TRANSACTION FUNCTIONS (FREE FOR USERS)
    // =================================

    /**
     * Register customer via meta transaction (FREE)
     * User signs message, admin executes
     */
    function registerCustomerMeta(
        address _customer,
        bytes memory _signature
    ) external onlyOwner {
        require(!customers[_customer].isActive, "Already registered");

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            "registerCustomer",
            address(this),
            _customer,
            nonces[_customer]
        ));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(_signature);
        
        require(signer == _customer, "Invalid signature");
        
        // Increment nonce
        nonces[_customer]++;

        // Register customer
        customers[_customer] = Customer({
            creditLimit: DEFAULT_CREDIT_LIMIT,
            availableCredit: DEFAULT_CREDIT_LIMIT,
            usedCredit: 0,
            totalTransactions: 0,
            totalPaid: 0,
            totalOverdue: 0,
            isActive: true
        });

        emit CustomerRegistered(_customer, DEFAULT_CREDIT_LIMIT);
    }

    /**
     * Create transaction via meta transaction (FREE)
     */
    function createTransactionMeta(
        address _customer,
        uint256 _amount,
        string memory _orderId,
        bytes memory _signature
    ) external onlyOwner returns (uint256) {
        Customer storage customer = customers[_customer];
        require(customer.isActive, "Customer not active");
        require(_amount > 0, "Invalid amount");
        require(_amount <= customer.availableCredit, "Insufficient credit");

        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            "createTransaction",
            address(this),
            _customer,
            _amount,
            _orderId,
            nonces[_customer]
        ));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(_signature);
        
        require(signer == _customer, "Invalid signature");
        
        // Increment nonce
        nonces[_customer]++;

        // Create transaction
        uint256 transactionId = nextTransactionId++;
        uint256 dueDate = block.timestamp + PAYMENT_PERIOD;

        transactions[transactionId] = Transaction({
            customer: _customer,
            amount: _amount,
            purchaseDate: block.timestamp,
            dueDate: dueDate,
            paidAmount: 0,
            status: TransactionStatus.PENDING,
            orderId: _orderId
        });

        // Update customer
        customer.availableCredit -= _amount;
        customer.usedCredit += _amount;
        customer.totalTransactions++;
        customerTransactions[_customer].push(transactionId);

        emit TransactionCreated(transactionId, _customer, _amount);
        return transactionId;
    }

    /**
     * Make payment via meta transaction (FREE)
     */
    function makePaymentMeta(
        uint256 _transactionId,
        uint256 _amount,
        bytes memory _signature
    ) external onlyOwner {
        Transaction storage txn = transactions[_transactionId];
        require(txn.amount > 0, "Transaction not found");
        require(
            txn.status == TransactionStatus.PENDING || 
            txn.status == TransactionStatus.PARTIALLY_PAID,
            "Invalid status"
        );

        address customer = txn.customer;
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            "makePayment",
            address(this),
            _transactionId,
            _amount,
            nonces[customer]
        ));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(_signature);
        
        require(signer == customer, "Invalid signature");
        
        // Increment nonce
        nonces[customer]++;

        uint256 remainingAmount = txn.amount - txn.paidAmount;
        require(_amount <= remainingAmount, "Amount exceeds remaining");

        // Update transaction
        txn.paidAmount += _amount;
        if (txn.paidAmount >= txn.amount) {
            txn.status = TransactionStatus.PAID;
        } else {
            txn.status = TransactionStatus.PARTIALLY_PAID;
        }

        // Update customer
        Customer storage cust = customers[customer];
        cust.availableCredit += _amount;
        cust.usedCredit -= _amount;
        cust.totalPaid += _amount;

        emit PaymentMade(_transactionId, customer, _amount);
    }

    // =================================
    // VIEW FUNCTIONS
    // =================================

    function getCustomerInfo(address _customer) 
        external 
        view 
        returns (
            uint256 creditLimit,
            uint256 availableCredit,
            uint256 usedCredit,
            uint256 totalTransactions,
            uint256 totalPaid,
            uint256 totalOverdue
        ) 
    {
        Customer memory customer = customers[_customer];
        return (
            customer.creditLimit,
            customer.availableCredit,
            customer.usedCredit,
            customer.totalTransactions,
            customer.totalPaid,
            customer.totalOverdue
        );
    }

    function getCustomerTransactions(address _customer) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return customerTransactions[_customer];
    }

    function getTransaction(uint256 _transactionId)
        external
        view
        returns (
            address customer,
            uint256 amount,
            uint256 purchaseDate,
            uint256 dueDate,
            uint256 paidAmount,
            TransactionStatus status,
            string memory orderId
        )
    {
        Transaction memory txn = transactions[_transactionId];
        return (
            txn.customer,
            txn.amount,
            txn.purchaseDate,
            txn.dueDate,
            txn.paidAmount,
            txn.status,
            txn.orderId
        );
    }

    function isOverdue(uint256 _transactionId) public view returns (bool) {
        Transaction memory txn = transactions[_transactionId];
        return block.timestamp > txn.dueDate && 
               (txn.status == TransactionStatus.PENDING || 
                txn.status == TransactionStatus.PARTIALLY_PAID);
    }

    function getNonce(address _customer) external view returns (uint256) {
        return nonces[_customer];
    }

    // =================================
    // ADMIN FUNCTIONS
    // =================================

    function markOverdue(uint256 _transactionId) external onlyOwner {
        require(isOverdue(_transactionId), "Not overdue");
        Transaction storage txn = transactions[_transactionId];
        txn.status = TransactionStatus.OVERDUE;
        
        uint256 remainingAmount = txn.amount - txn.paidAmount;
        uint256 lateFee = (remainingAmount * LATE_FEE_PERCENTAGE) / 100;
        
        customers[txn.customer].totalOverdue += remainingAmount;
        
        emit TransactionOverdue(_transactionId, lateFee);
    }

    function updateCreditLimit(address _customer, uint256 _newLimit) 
        external 
        onlyOwner 
    {
        Customer storage customer = customers[_customer];
        require(customer.isActive, "Customer not found");
        
        uint256 difference = _newLimit - customer.creditLimit;
        customer.creditLimit = _newLimit;
        customer.availableCredit += difference;
    }
}