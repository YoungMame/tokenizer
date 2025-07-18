// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
import "hardhat/console.sol";

// Multisig contract allows multiple signers to confirm transactions
// A transaction is created by the contract owner and can be signed by the signers
// Once enough signers have confirmed the transaction, it's confirmed
// and can be executed
// A multisig contract is deployed for each account that enables multisig

contract Multisig {
    // Public variables are accessible by anyone
    
    // signers is the list of addresses that can sign transactions
    address[] public signers;

    // theses variables are immutable and set at the contract creation because it restrict access to the multisig contract

    // contractAddress is the address of the contract that will use this multisig
    address immutable public  contractAddress;
    // accountAddress is the address of the account that will use this multisig
    address immutable public accountAddress;

    // signersCountNeeded is the number of signers needed to confirm a transaction
    uint public signersCountNeeded;

    struct Transaction {
        uint id;
        address to;
        uint256 value;
        bool executed;
        uint8 confirmations;
        bool isConfirmed;
    }

    // transactions is the list of transactions that have been created
    Transaction[] transactions;

    // confirmations is a mapping of the signer to keep track of which signers have confirmed which transactions
    mapping(uint => mapping(address => bool)) public confirmations;

    // Events are usefull for logging contract activity

    event NewTransaction(uint indexed transactionId, address to, uint256 value);

    event NewSigner(address signer);

    event SignerRevoked(address signer);

    event TransactionSigned(uint indexed transactionId, address signer, uint lastingConfirmations);

    event TransactionConfirmed(uint transactionId, address to, uint256 value);

    event TransactionExecuted(uint transactionId, address to, uint256 value);

    event SignerCountNeededChanged(uint count);

    // constructor initializes the contract with the contract address, account address, signers and the number of signers needed to confirm a transaction
    // contractAddress_ is the address of the contract that will use this multisig
    // accountAddress_ is the address of the account that will use this multisig
    // signers_ is the list of addresses that can sign transactions
    // signersCountNeeded_ is the number of signers needed to confirm a transaction
    constructor(address contractAddress_, address accountAddress_, address[] memory signers_, uint signersCountNeeded_)
    {
        require(contractAddress_ != address(0), "Missing contract address");
        require(accountAddress_ != address(0), "Missing account address");
        for (uint i = 0; i < signers_.length; i++)
        {
            signers.push(signers_[i]);
        }
        contractAddress = contractAddress_;
        accountAddress = accountAddress_;
        signersCountNeeded = signersCountNeeded_;
    }

    // Modifiers are used to restrict access to certain functions

    // Specifies that the function can be called by the MameCoin contract only
    modifier contractOnly() {
        require(msg.sender == contractAddress, "FunctionReservedToMameCoin");
        _;
    }

    // Specifies that the function can be called by the MameCoin contract only
    // and the sender must be the account address
    modifier ownerOnly(address sender) {
        require(msg.sender == contractAddress, "FunctionReservedToMameCoin");
        require(sender == accountAddress, "NotUserMultigsig");
        _;
    }
    
    // instance a new transaction
    // the transaction will be added to the transactions list
    function createTransaction(address to, uint value) external contractOnly() returns (uint) {
        require(to != address(0), "Missing arg");
        require(value > 0, "Missing arg");
        uint transactionId = transactions.length;
        transactions.push(); // init first empty transaction
        Transaction storage transaction = transactions[transactionId];
        transaction.executed = false;
        transaction.id = transactionId;
        transaction.to = to;
        transaction.value = value;
        transaction.isConfirmed = false;
        transactions.push(transaction);
        emit NewTransaction(transaction.id, transaction.to, transaction.value);
        return transactionId;
    }

    // Set the number of signers needed to confirm a transaction
    function setSignersCountNeeded (address sender, uint count) external ownerOnly(sender) {
        require(sender != address(0), "Missing arg");
        signersCountNeeded = count;
        emit SignerCountNeededChanged(count);
    }

    // add a signer to the list of signers
    function addSigner (address sender, address signer) external ownerOnly(sender) {
        require(signer != address(0), "Missing arg");
        require(sender != address(0), "Missing arg");
        signers.push(signer);
        emit NewSigner(signer);
    }

    // remove a signer from the list of signers
    // if the signer is not in the list, it will be ignored
    function removeSigner (address sender, address signer) external ownerOnly(sender) {
        require(signer != address(0), "Missing arg");
        require(sender != address(0), "Missing arg");
        for (uint i = 0; i < signers.length; i++)
        {
            if (signers[i] == signer)
            {
                for (uint j = i; j < signers.length - 1; j++)
                {
                    signers[j] = signers[j + 1];
                }
                emit SignerRevoked(signer);
                signers.pop();
                break;
            }
        }
    }

    // return true if the signer can sign transactions of the current multisig contract
    function _isSigner(address signer) private view returns (bool) {
        for (uint i = 0; i < signers.length; i++) {
            if (signers[i] == signer)
                return (true);
        }
        return (false);
    }

    // Check if the signer has already signed the transaction
    // returns true if the signer has already signed the transaction
    // returns false if the signer has not signed the transaction
    function _hasAlreadySigned(address signer, uint transactionId) private view returns (bool) {
        if (confirmations[transactionId][signer])
            return (true);
        return (false);
    }

    // sign the transaction with the transactionId of a given signer
    // if the transaction is confirmed by enough signers, it will be marked as confirmed
    // and the event TransactionConfirmed will be emitted
    function signTransaction(uint transactionId, address signer) external contractOnly() {
        require(transactionId < transactions.length, "NoExistingTransactionWithId");
        Transaction storage transaction = transactions[transactionId];    
        require(confirmations[transactionId][signer] == false, "TransactionAlreadyConfirmed");
        require((_isSigner(signer)), "SenderNotMultisigSigner");
        require((_hasAlreadySigned(signer, transactionId) == false), "SenderHasAlreadySigned");
        require(transaction.to != address(0), "NoExistingTransactionWithId");

        confirmations[transactionId][signer] = true;
        transaction.confirmations++;
        emit TransactionSigned(transactionId, signer, signersCountNeeded - transaction.confirmations);
        if (transaction.confirmations >= signersCountNeeded)
        {
            emit TransactionConfirmed(transactionId, transaction.to, transaction.value);
            transaction.isConfirmed  = true;
        }
    }

    // set exectued value on true and emit the event TransactionExecuted
    function setTransactionExecuted(uint  transactionId) external contractOnly() {
        Transaction memory transaction = transactions[transactionId];
        require(transaction.to != address(0), "NoExistingTransactionWithId");
        require(!(transaction.executed), "Transaction already executed");
        transaction.executed = true;
        emit TransactionExecuted(transactionId, transaction.to, transaction.value);
    }

    // return true if the transaction can be executed
    // a transaction can be executed if it has been confirmed by enough signers and has not been executed
    function canTransactionBeExecuted(uint transactionId) external view returns (bool) {
        Transaction memory transaction = transactions[transactionId];
        if (transaction.to == address(0) || transaction.isConfirmed == false || transaction.executed)
            return (false);
        return (true);
    }

    //_return the transation details by transactionId
    function getTransaction(uint transactionId) external view returns (uint, address, uint256, bool, uint8) {
        require(transactionId < transactions.length, "NoExistingTransactionWithId");
        Transaction storage transaction = transactions[transactionId];
        return (transaction.id, transaction.to, transaction.value, transaction.executed, transaction.confirmations);
    }
}