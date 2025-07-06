    

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
      
      const tx = await mameCoinContract.connect(bob).submitTransactionToMultisig(owner, 42153);
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1, "Transaction should be successful");
      const event = receipt.logs?.find((event: any) => event.fragment.name == "NewTransaction");
      const transactionId = event?.args?.transactionId;
      expect(transactionId).to.not.be.undefined;
    });

    it("Should execute transaction after signers", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await mameCoinContract.connect(owner).mint(bob, 42153);
      expect(await mameCoinContract.balanceOf(bob)).to.equal(42153, "Bob should have 42153 MAM");
      
      const tx = await mameCoinContract.connect(bob).submitTransactionToMultisig(owner, 42153);
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1, "Transaction should be successful");
      const event = receipt.logs?.find((event: any) => event.fragment.name == "NewTransaction");
      const transactionId = event?.args?.transactionId;
      const ownerOldBalance = await mameCoinContract.balanceOf(owner);
      expect(transactionId).to.not.be.undefined;
      await expect(mameCoinContract.connect(alice).multisigSignTransaction(transactionId, bob)).to.emit(bobMultisig, "TransactionSigned").withArgs(transactionId, alice, 1 );
      await expect(mameCoinContract.connect(jon).multisigSignTransaction(transactionId, bob)).to.emit(bobMultisig, "TransactionConfirmed").withArgs(transactionId, owner, 42153).to.emit(bobMultisig, "TransactionExecuted").withArgs(transactionId, owner, 42153);

      expect((await mameCoinContract.balanceOf(owner)) - ownerOldBalance).to.equal(42153);
    });
  });
  describe("Unauthorized access", function () {
    it("Should revert when a non-signer tries to sign a transaction", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await mameCoinContract.connect(owner).mint(bob, 42153);
      const tx = await mameCoinContract.connect(bob).submitTransactionToMultisig(owner, 42153);
      const receipt = await tx.wait();
      const event = receipt.logs?.find((event: any) => event.fragment.name == "NewTransaction");
      const transactionId = event?.args?.transactionId;
      expect(transactionId).to.not.be.undefined;
      
      await expect(mameCoinContract.connect(owner).multisigSignTransaction(transactionId, bob)).to.be.revertedWith("SenderNotMultisigSigner");
    });
    it("Should revert when non contract tries to set transaction executed", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await mameCoinContract.connect(owner).mint(bob, 42153);
      const tx = await mameCoinContract.connect(bob).submitTransactionToMultisig(owner, 42153);
      const receipt = await tx.wait();
      const event = receipt.logs?.find((event: any) => event.fragment.name == "NewTransaction");
      const transactionId = event?.args?.transactionId;
      expect(transactionId).to.not.be.undefined;
      
      await expect(bobMultisig.connect(alice).setTransactionExecuted(transactionId)).to.be.revertedWith("FunctionReservedToMameCoin");
    });
    it("Should revert when non contract tries to create transaction", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await expect(bobMultisig.connect(alice).createTransaction(owner, 42153)).to.be.revertedWith("FunctionReservedToMameCoin");
    });
    it("Should revert when non contract tries to add signer to other account", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await expect(bobMultisig.connect(alice).addSigner(bob, jon)).to.be.revertedWith("FunctionReservedToMameCoin");
    });
    it("Should revert when non contract tries to remove signer from other account", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await expect(bobMultisig.connect(alice).removeSigner(bob, jon)).to.be.revertedWith("FunctionReservedToMameCoin");
    });
    it("Should revert when non contract tries to set signers count needed from other account", async function() {
      const { mameCoinContract, owner, bob, alice, jon, bobMultisig } = await loadFixture(bobMultisigEnabledFixture);
      await expect(bobMultisig.connect(alice).setSignersCountNeeded(bob, 2)).to.be.revertedWith("FunctionReservedToMameCoin");
    });
  });
});