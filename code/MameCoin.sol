// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "./Multisig.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
// Uncomment this line to use console.log
import "hardhat/console.sol";

contract MameCoin is ERC20, ERC20Pausable, Ownable, AccessControl {
    uint8 private _decimals;
    address _owner;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");


    mapping(address sender => Multisig multisig) multisigs;

    event NewMultisigEnabled(address signer, address contractAddress);

    constructor(uint256 supply, address[] memory minters, address[] memory burners, address[] memory pausers) ERC20("MameCoin", "MAM") Ownable(msg.sender) {
        _decimals = 8;  // number of decimals
        _mint(msg.sender, supply); // init total supply and send it to the deployer account
        _owner = msg.sender;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        uint32 j = 0;
        while (j < minters.length)
        {
            _grantRole(MINTER_ROLE, minters[j]);
            j++;
        }

        j = 0;
        while (j < burners.length)
        {
            _grantRole(BURNER_ROLE, burners[j]);
            j++;
        }

        j = 0;
        while (j < pausers.length)
        {
            _grantRole(PAUSER_ROLE, pausers[j]);
            j++;
        }
    }

    function submitTransaction(address to, uint256 value) external returns (uint) {
        require(_isMultisigEnabled(msg.sender), "MultisigNotEnabled");
        Multisig multisig = getMultisgBySigner(msg.sender);
        return multisig.createTransaction(to, value);
    }

    function transfer(address to, uint256 value) public virtual override returns (bool)
    {
        require(!_isMultisigEnabled(msg.sender), "MultisigEnabled");
        super.transfer(to, value);
        return true;
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyRole(BURNER_ROLE) {
        _burn(from, amount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }

    // MULTISIG FUNCTIONS //

    function _isMultisigEnabled(address signer) private view returns (bool) {
        return (multisigs[signer] != Multisig(address(0)));
    }

    function getMultisgBySigner(address signer) public view returns (Multisig) {
        require(multisigs[signer] != Multisig(address(0)), "MultisigNotEnabled");
        return multisigs[signer];
    }

    function setMultisigSignersCountNeeded(address signer, uint signersCountNeeded) external {
        require(multisigs[signer] != Multisig(address(0)), "MultisigNotEnabled");
        address sender = msg.sender;
        multisigs[signer].setSignersCountNeeded(sender, signersCountNeeded);
    }

    function addMultisigSigner(address newSigner) external {
        address sender = msg.sender;
        require(multisigs[sender] != Multisig(address(0)), "MultisigNotEnabled");
        multisigs[sender].addSigner(sender, newSigner);
    }

    function removeMultisigSigner(address oldSigner) external {
        address sender = msg.sender;
        require(multisigs[sender] != Multisig(address(0)), "MultisigNotEnabled");
        multisigs[sender].removeSigner(sender, oldSigner);
    }

    function enableMultisig(address[] memory signers, uint signersCountNeeded) external returns (Multisig) {
        address signer = msg.sender;
        require(multisigs[signer] == Multisig(address(0)), "MultisigAlreadyEnabled");
        multisigs[signer] = new Multisig(address(this), signer, signers, signersCountNeeded);
        emit NewMultisigEnabled(signer, address(multisigs[signer]));
        return multisigs[signer];
    }

    function submitTransactionToMultisig(address to, uint256 value) external returns (uint) {
        address sender = msg.sender;
        require(multisigs[sender] != Multisig(address(0)), "MultisigNotEnabled");
        return multisigs[sender].createTransaction(to, value);
    }

    function multisigSignTransaction(uint transactionId, address account) external {
        require(multisigs[account] != Multisig(address(0)), "MultisigNotEnabled");
        address sender = msg.sender;
        multisigs[account].signTransaction(transactionId, sender);
        if (multisigs[account].canTransactionBeExecuted(transactionId)) {
            uint id;
            address to;
            uint256 value;
            bool executed;
            uint8 confirmations;

            (id, to, value, executed, confirmations) = multisigs[account].getTransaction(transactionId);
            require(to != address(0), "NoExistingTransactionWithId");
            require(!executed, "TransactionAlreadyExecuted");
            multisigs[account].setTransactionExecuted(transactionId);
            super.transfer(to, value);
        }
    }
}
