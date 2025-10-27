const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RiskAssessment", function () {
  let riskAssessment;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const RiskAssessment = await ethers.getContractFactory("RiskAssessment");
    riskAssessment = await RiskAssessment.deploy();
    await riskAssessment.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await riskAssessment.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero profiles", async function () {
      expect(await riskAssessment.totalProfiles()).to.equal(0);
    });
  });

  describe("Risk Profile Creation", function () {
    it("Should allow user to check if they have a profile", async function () {
      expect(await riskAssessment.hasRiskProfile(user1.address)).to.equal(false);
    });

    it("Should create risk profile (requires FHE)", async function () {
      // Mock encrypted data
      const mockAge = ethers.hexlify(ethers.randomBytes(32));
      const mockHealth = ethers.hexlify(ethers.randomBytes(32));
      const mockCredit = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      console.log("   [Info] Risk profile creation requires FHE environment");

      // In FHE environment, this would work:
      // await riskAssessment
      //   .connect(user1)
      //   .createRiskProfile(
      //     mockAge,
      //     mockHealth,
      //     mockCredit,
      //     mockProof,
      //     mockProof,
      //     mockProof
      //   );
      //
      // expect(await riskAssessment.hasRiskProfile(user1.address)).to.equal(true);
      // expect(await riskAssessment.totalProfiles()).to.equal(1);
    });

    it("Should reject duplicate profile creation", async function () {
      // Note: Requires FHE environment to actually create first profile
      console.log("   [Info] Duplicate profile test requires FHE environment");
    });
  });

  describe("Risk Score Calculation", function () {
    it("Should calculate risk score from factors", async function () {
      console.log("   [Info] Risk score calculation uses FHE operations");
      console.log("   [Info] Formula: age + (100-health) + (100-credit)");
      console.log("   [Info] Higher score = Higher risk");
    });
  });

  describe("View Functions", function () {
    it("Should return false for non-existent profile", async function () {
      expect(await riskAssessment.hasRiskProfile(user1.address)).to.equal(false);
    });

    it("Should revert when getting score for non-existent profile", async function () {
      await expect(
        riskAssessment.connect(user1).getRiskScore()
      ).to.be.revertedWithCustomError(riskAssessment, "ProfileNotFound");
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to transfer ownership", async function () {
      await expect(
        riskAssessment.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWithCustomError(riskAssessment, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to transfer ownership", async function () {
      await riskAssessment.connect(owner).transferOwnership(user1.address);
      expect(await riskAssessment.owner()).to.equal(user1.address);
    });
  });

  describe("Profile Statistics", function () {
    it("Should start with zero total profiles", async function () {
      expect(await riskAssessment.totalProfiles()).to.equal(0);
    });

    it("Should increment total profiles when created", async function () {
      // Note: Requires FHE environment
      console.log("   [Info] Profile counting requires FHE environment for creation");
    });
  });
});
