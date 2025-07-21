import { expect } from "chai";
import { ethers } from "hardhat";
import { BTCMiner } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BTCMiner", function () {
  let btcMiner: BTCMiner;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let mockLzEndpoint: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("100000000"); // 100M tokens
  const MAX_DAILY_BURN = ethers.parseEther("1000000"); // 1M tokens

  beforeEach(async function () {
    [owner, user1, user2, mockLzEndpoint] = await ethers.getSigners();

    const BTCMinerFactory = await ethers.getContractFactory("BTCMiner");
    btcMiner = await BTCMinerFactory.deploy(
      mockLzEndpoint.address, // Mock LayerZero endpoint
      "BTCMiner Token",
      "BTCM"
    );
    await btcMiner.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await btcMiner.name()).to.equal("BTCMiner Token");
      expect(await btcMiner.symbol()).to.equal("BTCM");
    });

    it("Should mint initial supply to owner", async function () {
      expect(await btcMiner.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await btcMiner.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should set correct roles", async function () {
      const ADMIN_ROLE = await btcMiner.ADMIN_ROLE();
      const DEFAULT_ADMIN_ROLE = await btcMiner.DEFAULT_ADMIN_ROLE();
      
      expect(await btcMiner.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await btcMiner.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should set correct constants", async function () {
      expect(await btcMiner.MAX_DAILY_BURN()).to.equal(MAX_DAILY_BURN);
    });
  });

  describe("Basic ERC20 Functionality", function () {
    beforeEach(async function () {
      // Transfer some tokens to user1 for testing
      await btcMiner.transfer(user1.address, ethers.parseEther("1000"));
    });

    it("Should transfer tokens correctly", async function () {
      const transferAmount = ethers.parseEther("100");
      await btcMiner.connect(user1).transfer(user2.address, transferAmount);
      
      expect(await btcMiner.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await btcMiner.balanceOf(user1.address)).to.equal(
        ethers.parseEther("900")
      );
    });

    it("Should approve and transferFrom correctly", async function () {
      const approveAmount = ethers.parseEther("200");
      const transferAmount = ethers.parseEther("150");
      
      await btcMiner.connect(user1).approve(user2.address, approveAmount);
      await btcMiner.connect(user2).transferFrom(user1.address, user2.address, transferAmount);
      
      expect(await btcMiner.balanceOf(user2.address)).to.equal(transferAmount);
      expect(await btcMiner.allowance(user1.address, user2.address)).to.equal(
        approveAmount - transferAmount
      );
    });
  });

  describe("Burn Functionality", function () {
    beforeEach(async function () {
      // Transfer tokens to user1 for testing
      await btcMiner.transfer(user1.address, ethers.parseEther("2000000")); // 2M tokens
    });

    it("Should burn tokens correctly", async function () {
      const burnAmount = ethers.parseEther("1000");
      const initialBalance = await btcMiner.balanceOf(user1.address);
      const initialTotalSupply = await btcMiner.totalSupply();
      
      await btcMiner.connect(user1).burn(burnAmount);
      
      expect(await btcMiner.balanceOf(user1.address)).to.equal(initialBalance - burnAmount);
      expect(await btcMiner.totalSupply()).to.equal(initialTotalSupply - burnAmount);
      expect(await btcMiner.totalBurned()).to.equal(burnAmount);
    });

    it("Should enforce daily burn limits", async function () {
      const burnAmount = ethers.parseEther("500000"); // 500K tokens
      
      // First burn should succeed
      await btcMiner.connect(user1).burn(burnAmount);
      
      // Second burn should succeed (total 1M)
      await btcMiner.connect(user1).burn(burnAmount);
      
      // Third burn should fail (would exceed 1M daily limit)
      await expect(
        btcMiner.connect(user1).burn(ethers.parseEther("1"))
      ).to.be.revertedWith("BTCMiner: Daily burn limit exceeded");
    });

    it("Should reset daily burn limit after 24 hours", async function () {
      const burnAmount = MAX_DAILY_BURN;
      
      // Burn maximum amount
      await btcMiner.connect(user1).burn(burnAmount);
      
      // Fast forward 24 hours
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      
      // Should be able to burn again
      await expect(btcMiner.connect(user1).burn(ethers.parseEther("1000")))
        .to.not.be.reverted;
    });

    it("Should track remaining daily burn correctly", async function () {
      const burnAmount = ethers.parseEther("300000"); // 300K tokens
      
      expect(await btcMiner.getRemainingDailyBurn(user1.address)).to.equal(MAX_DAILY_BURN);
      
      await btcMiner.connect(user1).burn(burnAmount);
      
      expect(await btcMiner.getRemainingDailyBurn(user1.address)).to.equal(
        MAX_DAILY_BURN - burnAmount
      );
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to pause/unpause", async function () {
      await btcMiner.pause();
      expect(await btcMiner.paused()).to.be.true;
      
      await btcMiner.unpause();
      expect(await btcMiner.paused()).to.be.false;
    });

    it("Should prevent non-admin from pausing", async function () {
      await expect(btcMiner.connect(user1).pause())
        .to.be.reverted;
    });

    it("Should prevent transfers when paused", async function () {
      await btcMiner.pause();
      
      await expect(
        btcMiner.transfer(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow admin to emergency withdraw ETH", async function () {
      // Send some ETH to contract
      await owner.sendTransaction({
        to: await btcMiner.getAddress(),
        value: ethers.parseEther("1")
      });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      await btcMiner.emergencyWithdraw();
      const finalBalance = await ethers.provider.getBalance(owner.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should prevent non-admin from emergency withdraw", async function () {
      await expect(btcMiner.connect(user1).emergencyWithdraw())
        .to.be.reverted;
    });
  });

  describe("LayerZero Integration", function () {
    it("Should return correct token address", async function () {
      expect(await btcMiner.token()).to.equal(await btcMiner.getAddress());
    });

    it("Should return correct circulating supply", async function () {
      const totalSupply = await btcMiner.totalSupply();
      expect(await btcMiner.circulatingSupply()).to.equal(totalSupply);
    });
  });
});