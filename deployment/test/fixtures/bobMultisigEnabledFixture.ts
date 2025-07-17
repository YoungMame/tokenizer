import {
 loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { TOTAL_SUPPLY, DECIMALS } from "../MameCoin42";

export default async function bobMultisigEnabledFixture() {
  const [owner, bob, alice, jon] = await hre.ethers.getSigners();
  const MameCoin = await hre.ethers.getContractFactory("MameCoin42");
  const supplyAmount = hre.ethers.parseUnits(TOTAL_SUPPLY.toString(), DECIMALS);
  const mameCoinContract = await MameCoin.deploy(supplyAmount, [bob], [alice], [jon]);
  
  await mameCoinContract.connect(bob).enableMultisig([alice, jon], 2);
  
  const multisigAddress = await mameCoinContract.getMultisgBySigner(bob.address);
  const Multisig = await hre.ethers.getContractFactory("Multisig");
  const bobMultisig = Multisig.attach(multisigAddress);
  
  return { mameCoinContract, owner, bob, alice, jon, bobMultisig };
}