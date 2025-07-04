// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
import "hardhat/console.sol";


contract Multisig {
    address[] public signers;
    address immutable public  contractAddress;
    address immutable public accountAddress;
    uint public signersCountNeeded;

    struct Transaction {
        uint id;
        address to;
        uint256 value;
        bool executed;
        uint8 confirmations;
        bool isConfirmed;
    }

    Transaction[] transactions;
    mapping(uint => mapping(address => bool)) public confirmations;

    event NewTransaction(uint indexed transactionId, address to, uint256 value);

    event NewSigner(address signer);

    event SignerRevoked(address signer);

    event TransactionSigned(uint indexed transactionId, address signer, uint lastingConfirmations);

    event TransactionConfirmed(uint transactionId, address to, uint256 value);

    event TransactionExecuted(uint transactionId, address to, uint256 value);

    event SignerCountNeededChanged(uint count);

    constructor(address contractAddress_, address accountAddress_, address[] memory signers_, uint signersCountNeeded_)
    {
        for (uint i = 0; i < signers_.length; i++)
        {
            signers.push(signers_[i]);
        }
        contractAddress = contractAddress_;
        accountAddress = accountAddress_;
        signersCountNeeded = signersCountNeeded_;
    }



    modifier contractOnly() {
        require(msg.sender == contractAddress, "FunctionReservedToMameCoin");
        _;
    }

    modifier ownerOnly(address sender) {
        require(msg.sender == contractAddress, "FunctionReservedToMameCoin");
        require(sender == accountAddress, "NotUserMultigsig");
        _;
    }
    
    function createTransaction(address to, uint value) external contractOnly() {
        uint transactionId = transactions.length;
        Transaction storage transaction;
        transaction.executed = false;
        transaction.id = transactionId;
        transaction.to = to;
        transaction.value = value;
        transaction.isConfirmed = false;
        transactions.push(transaction);
        emit NewTransaction(transaction.id, transaction.to, transaction.value);
    }

    function setSignersCountNeeded (address sender, uint count) external ownerOnly(sender) {
        require(sender != address(0), "Missing arg");
        signersCountNeeded = count;
        emit SignerCountNeededChanged(count);
    }

    function addSigner (address sender, address signer) external ownerOnly(sender) {
        require(signer != address(0), "Missing arg");
        require(sender != address(0), "Missing arg");
        signers[signers.length] = signer;
        emit NewSigner(signer);
    }

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

    function _isSigner(address signer) internal {
        for (uint i = 0; i < signers.length; i++) {
            if (signers[i] == signer)
                return (true);
        }
        return (false);
    }

    function _hasAlreadySigned(address signer, uint transactionId) internal returns (bool) {
        if (confirmations[transactionId][signer])
            return (true);
        return (false);
    }

    function signTransaction(uint transactionId, address signer) external contractOnly() {
        Transaction storage transaction = transactions[transactionId];    
        require(confirmations[transactionId][signer] == false, "TransactionAlreadyConfirmed");
        require(_isSigner(signer), "SenderNotMultisigSigner");
        require(!(_hasAlreadySigned()), "SenderHasAlreadySigned");
        require(transaction.to != address(0), "NoExistingTransactionWithId");

        transacion.confirmations[transactionId][signer] = true;
        emit TransactionSigned(transactionId, signer, signersCountNeeded - transaction.confirmations);

        if (transaction.confirmations >= signersCountNeeded)
        {
            emit TransactionConfirmed(transactionId, transaction.to, transaction.value);
            transaction.isConfirmed  = true;
        }
    }

    function setTransactionExecuted(uint  transactionId) external contractOnly() {
        Transaction memory transaction = transactions[transactionId];
        require(transaction.to != address(0), "NoExistingTransactionWithId");
        require(!(transaction.executed), "Transaction already executed");
        transaction.executed = true;
        emit TransactionExecuted(transactionId, transaction.to, transaction.value);
    }


    function canTransactionBeExecuted(uint transactionId) external view {
        Transaction memory transaction = transactions[transactionId];
        if (transaction.to == address(0) || transaction.isConfirmed == false || transaction.executed)
            return (false);
        return (true);
    }
}