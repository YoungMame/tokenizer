import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { TOTAL_SUPPLY, DECIMALS } from "../MameCoin"
import deployFixture from "./deployFixture";

export default async function filledAccountsFxiture() {
    const { mameCoinContract, owner, bob, alice, jon } = await loadFixture(deployFixture);
    await mameCoinContract.connect(owner).mint(alice, hre.ethers.parseUnits((10000).toString(), DECIMALS));
    await mameCoinContract.connect(owner).mint(bob, hre.ethers.parseUnits((10000).toString(), DECIMALS));
    return { mameCoinContract, owner, bob, alice, jon };
}

