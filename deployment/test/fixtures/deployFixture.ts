import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { TOTAL_SUPPLY, DECIMALS } from "../MameCoin"

export default async function deployFixture() {
    const [owner, bob, alice, jon] = await hre.ethers.getSigners();
    const MameCoin = await hre.ethers.getContractFactory("MameCoin42");
    const supplyAmount = hre.ethers.parseUnits(TOTAL_SUPPLY.toString(), DECIMALS);
    const mameCoinContract = await MameCoin.deploy(supplyAmount, [bob], [alice], [jon]);
    return { mameCoinContract, owner, bob, alice, jon };
}