    

import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import deployFixture from "./fixtures/deployFixture";
import filledAccountsFxiture from "./fixtures/filledAccountsFixture";

export const DECIMALS = 8;
export const TOTAL_SUPPLY = 420000;
export const NAME = "MameCoin";
export const SYMBOL = "MAM";
export const PARSED_TOTAL_SUPPLY = TOTAL_SUPPLY * 10 ** DECIMALS;

describe("Multisig", function () {
  describe("Enabling", function () {
    it ("Should emit the right event", async function name() {
      const { mameCoinContract, owner, bob, alice, jon } = await loadFixture(deployFixture);
      await expect (mameCoinContract.connect(bob).enableMultisig([alice, jon], 2)).to.emit(mameCoinContract, "NewMultisigEnabled");
    })
    it ("Should revert", async function name() {
      const { mameCoinContract, owner, bob, alice, jon } = await loadFixture(deployFixture);
      await expect (mameCoinContract.connect(bob).enableMultisig([alice, jon], 2)).to.emit(mameCoinContract, "NewMultisigEnabled");
      await expect (mameCoinContract.connect(bob).enableMultisig([alice, jon], 2)).to.be.revertedWithCustomError(
        mameCoinContract,
        "MultisigAlreadyEnabled"
      );;
    })
  })
});