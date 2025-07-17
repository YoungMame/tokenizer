import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import deployFixture from "./fixtures/deployFixture";
import filledAccountsFxiture from "./fixtures/filledAccountsFixture";

export const DECIMALS = 8;
export const TOTAL_SUPPLY = 420000;
export const NAME = "MameCoin42";
export const SYMBOL = "MAM";
export const PARSED_TOTAL_SUPPLY = TOTAL_SUPPLY * 10 ** DECIMALS;

describe("MameCoin42", function () {
  describe("Deployment", function () {
    it("Should set the right supply amount", async function () {
      const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
      expect(await mameCoinContract.totalSupply()).to.equal(PARSED_TOTAL_SUPPLY);
    });

    it("Sould have the right name and symbol", async function () {
      const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
      expect(await mameCoinContract.name()).to.equal(NAME);
      expect(await mameCoinContract.symbol()).to.equal(SYMBOL);
    });
  });

  describe("Roles", function () {
    describe("Mint", function () {
      it("Alice should not be able to mint the coin money", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await expect (
          mameCoinContract.connect(alice).mint(owner, 42)
        ).to.be.revertedWithCustomError(
          mameCoinContract,
          "AccessControlUnauthorizedAccount"
        );
      });
      it("Bob be able to mint the coin money", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await expect(
          mameCoinContract.connect(bob).mint(owner, 42)
        ).to.not.be.reverted;
      });
    });
    describe("Burn", function () {
      it("Bob should not be able to burn the coin money", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await expect (
          mameCoinContract.connect(bob).burn(owner, 42)
        ).to.be.revertedWithCustomError(
          mameCoinContract,
          "AccessControlUnauthorizedAccount"
        );
      });
      it("Alice be able to burn the coin money", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await expect(
          mameCoinContract.connect(alice).burn(owner, 42)
        ).to.not.be.reverted;
      });
    });
    describe("Pause", function () {
      it("Bob should not be able to burn the pause the transactions", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await expect (
          mameCoinContract.connect(bob).pause()
        ).to.be.revertedWithCustomError(
          mameCoinContract,
          "AccessControlUnauthorizedAccount"
        );
      });
      it("Jon should be able to pause the transactions", async function() {
        const { mameCoinContract, owner, bob, alice, jon } = await loadFixture(deployFixture);
        await expect(
          mameCoinContract.connect(jon).pause()
        ).to.not.be.reverted;
      });
      it("Nobdoy should not be able to send transaction", async function() {
        const { mameCoinContract, owner, bob, alice, jon } = await loadFixture(deployFixture);
        mameCoinContract.connect(owner).mint(42, bob);
        await expect(
          mameCoinContract.connect(jon).pause()
        ).to.not.be.reverted;
        await expect (
          mameCoinContract.connect(alice).transfer(bob, 42)
        ).to.be.revertedWithCustomError(
          mameCoinContract,
          "EnforcedPause"
        );
      });
    });
    describe("Ownership", function () {
      it("Bob should not be able to give ownnership", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await expect (
          mameCoinContract.connect(bob).transferOwnership(bob)
        ).to.be.revertedWithCustomError(
          mameCoinContract,
          "OwnableUnauthorizedAccount"
        );
      });
      it("Owner should be able to give ownership to bob", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await mameCoinContract.connect(owner).transferOwnership(bob.address);
        expect(await mameCoinContract.owner()).to.be.equal(bob.address);
      });
      it("Owner should be able to leave contract without owner (bad idea)", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await expect(
          mameCoinContract.connect(owner).renounceOwnership()
        ).to.not.be.reverted;
        expect(await mameCoinContract.owner()).to.equal(ethers.ZeroAddress);
      });
    });
  });

  

  describe("Transactions", function () {
    describe("Allowance", function () {
      it("Bob should not be able to spend money from Alice (revert)", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await expect(
          mameCoinContract.connect(bob).transferFrom(alice, bob, 42)
        ).to.be.revertedWithCustomError(
          mameCoinContract,
          "ERC20InsufficientAllowance"
        );
      });
  
      it("Bob should be able to spend money from Alice after she allowed", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(filledAccountsFxiture);
        const balanceBobBefore = await mameCoinContract.balanceOf(bob.address);
        await mameCoinContract.connect(alice).approve(bob, 42);
        await expect(
          mameCoinContract.connect(bob).transferFrom(alice, bob, 42)
        ).to.not.be.reverted;
        const balanceBobAfter = await mameCoinContract.balanceOf(bob.address);

        expect(balanceBobAfter - balanceBobBefore).to.equal(42);
      });
    });

    describe("Normal", function () {
      it("bob should not be able to send money to Alice because he doesen't have enough", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await expect(
          mameCoinContract.connect(bob).transfer(alice, 42)
        ).to.be.revertedWithCustomError(
          mameCoinContract,
          "ERC20InsufficientBalance"
        );
      });
      it("bob should be able to send money to Alice", async function() {
        const { mameCoinContract, owner, bob, alice } = await loadFixture(deployFixture);
        await mameCoinContract.connect(owner).transfer(bob, 42);
        const balanceBobBefore = await mameCoinContract.balanceOf(bob.address);
        await expect(
          mameCoinContract.connect(bob).transfer(alice, 42)
        ).to.not.be.reverted;
        const balanceBobAfter = await mameCoinContract.balanceOf(bob.address);
        const balanceAlice = await mameCoinContract.balanceOf(alice.address);
        expect(balanceBobAfter - balanceBobBefore).to.equal(-42);
        expect(balanceAlice).to.equal(42);
      })
    });
  });
});
