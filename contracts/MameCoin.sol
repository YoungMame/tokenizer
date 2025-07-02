// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";





contract MameCoin is ERC20 {
    uint8 private _decimals;
    address owner;

    constructor(uint256 supply) ERC20("MameCoin", "MAM") {
        _decimals = 8;  // number of decimals
        _mint(msg.sender, supply); // init total supply and send it to the deployer account
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
    };

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
