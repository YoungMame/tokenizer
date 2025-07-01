// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract MameCoin is ERC20 {
    uint8 private _decimals;

    constructor() ERC20("MameCoin", "MCN") {
        _decimals = 8;  // number of decimals
        _mint(msg.sender, 1000 * 10 ** uint256(_decimals)); // init total amount
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
