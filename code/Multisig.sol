// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
import "hardhat/console.sol";


contract Multisig {
    address[] private signers;
    address immutable public  contractAddress;
    address immutable public accountAddress;
    uint public signersCountNeeded;

    struct Transaction {
        uint id;
        address to;
        uint256 value;
        bool executed;
        uint8 confirmations;
        mapping(address => bool) isConfirmed;
    }

    event NewTransaction(uint indexed transactionId, address to, uint256 value);

    Transaction[] transactions;

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

    modifier ownerOnly() {
        require(msg.sender == accountAddress);
        _;
    }

    modifier contractOnly() {
        require(msg.sender == contractAddress);
        _;
    }
    //    event NewTransaction(uint indexed transactionId, address to, uint256 value);

    function createTransaction(addres to, uint value) {
        uint transactionId = transactions.length;
        Transaction transaction;
        transaction.confirmations = 0;
        transaction.executed = false;
        transaction.isConfirmed = false;
        transaction.id = transactionId;
        transaction.to = to;
        transaction.value = value;
        transactions.push = transaction;
        emit NewTransaction(transaction.id, transaction.to, transaction.value);
    }

    function addSigner (address signer) external ownerOnly() {
        require(signer != address(0), "Missing arg");
        signers[signers.length] = signer;
    }

    function removeSigner (address signer) external ownerOnly() {
        require(signer != address(0), "Missing arg");
        for (uint i = 0; i < signers.lenght; i++)
        {
            if (signers[i] == signer)
            {
                for (uint j = i; j < signers.length - 1; j++)
                {
                    signers[j] = signers[j + 1];
                }
                signers.pop();
                break;
            }
        }
    }

    function _isSigner(address signer) view internal {
        for (uint i = 0; i < signers.length; i++) {
            if (signers[i] == signer)
                return (true);
        }
        return (false);
    }

    function _hasAlreadySigned(address signer, uint transactionId) view internal returns (bool) {
        if (transactions[transactionId].isConfirmed[signer])
            return (true);
        return (false);
    }

    function signTransaction(uint transactionId) external contractOnly() {
        address signer = msg.sender;
        require(_isSigner(signer), "SenderNotMultisigSigner");
        require(!(_hasAlreadySigned()), "SenderHasAlreadySigned");

        Transaction storage transaction = transactions[transactionId];
        require(transaction.to != address(0), "NoExistingTransactionWithId");

        transaction.confirmations++;
        transactions[transactionId].isConfirmed[signer] = true;

        if (transaction.confirmations >= signersCountNeeded)
        {
            transaction.isConfirmed  = true;
        }
    }

    function setTransactionExecuted(uint  transactionId) external {
        Transaction transaction = transactions[transactionId];
        require(transaction.to != address(0), "NoExistingTransactionWithId");
        require(!(transaction.executed), "Transaction already executed");
        transaction.executed = true;
    }


    function canTransactionBeExecuted(uint transactionId) external view {
        Transaction transaction = transactions[transactionId];
        if (transaction.to == address(0) || transaction.isConfirmed == false || transaction.executed)
            return (false);
        return (true);
    }
}