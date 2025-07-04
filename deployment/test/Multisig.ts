    

import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import deployFixture from "./fixtures/deployFixture";
import filledAccountsFxiture from "./fixtures/filledAccountsFixture";
import bobMultisigEnabledFixture from "./fixtures/bobMultisigEnabledFixture";

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
      // try to enable two times
      await expect (mameCoinContract.connect(bob).enableMultisig([alice, jon], 2)).to.be.revertedWith('MultisigAlreadyEnabled');
    })
    it("Should emit the right event", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await expect(mameCoinContract.connect(bob).addMultisigSigner(jon)).to.emit(bobMultisig, "NewSigner");
    });

    it("Should emit the right event", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await expect(mameCoinContract.connect(bob).removeMultisigSigner(jon)).to.emit(bobMultisig, "SignerRevoked");
    });
  })

  describe("Transaction", function () {
    it("Should revert", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await mameCoinContract.connect(owner).mint(bob, 42);
      await expect(mameCoinContract.connect(bob).transfer(jon, 42)).to.be.revertedWith("MultisigEnabled");
    });

    it("Should not revert", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await mameCoinContract.connect(owner).mint(bob, 42153);
      
      const tx = await mameCoinContract.connect(bob).submitTransactionToMultisig(owner.address, 42153);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find((log : any) => {
          try {
              const parsed = mameCoinContract.interface.parseLog(log);
              return parsed.name === 'TransactionCreated';
          } catch {
              return false;
          }
      });
      
      const parsed = mameCoinContract.interface.parseLog(event);
      const transactionId = parsed.args.transactionId;
      console.log("Transaction ID:", transactionId.toString());
      await expect(mameCoinContract.connect(alice).multisigSignTransaction(transactionId, bob)).to.emit(bobMultisig, "NewSigner");
      await expect(mameCoinContract.connect(jon).multisigSignTransaction(transactionId, bob)).to.emit(bobMultisig, "NewSigner");;
    });
  })
});