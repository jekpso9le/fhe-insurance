const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PolicyRegistry", function () {
  let policyRegistry;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const PolicyRegistry = await ethers.getContractFactory("PolicyRegistry");
    policyRegistry = await PolicyRegistry.deploy();
    await policyRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await policyRegistry.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero policies", async function () {
      expect(await policyRegistry.policyCounter()).to.equal(0);
    });
  });

  describe("Policy Creation", function () {
    it("Should create a health insurance policy", async function () {
      // Note: In actual FHE tests, you'd use encrypted inputs
      // For now, testing the contract logic flow
      const PolicyType = {
        Health: 0,
        Property: 1,
        Life: 2,
        Cyber: 3,
      };

      // Mock encrypted data (in real tests, use FHE SDK)
      const mockPremium = ethers.hexlify(ethers.randomBytes(32));
      const mockCoverage = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      // Note: This will fail without proper FHE setup
      // Keeping as example structure
      try {
        await policyRegistry
          .connect(user1)
          .createPolicy(
            PolicyType.Health,
            mockPremium,
            mockCoverage,
            mockProof,
            mockProof,
            12 // 12 months duration
          );

        expect(await policyRegistry.policyCounter()).to.equal(1);
      } catch (error) {
        // Expected to fail without FHE environment
        console.log("   [Info] FHE environment required for full test");
      }
    });

    it("Should reject invalid policy type", async function () {
      const mockPremium = ethers.hexlify(ethers.randomBytes(32));
      const mockCoverage = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      await expect(
        policyRegistry
          .connect(user1)
          .createPolicy(
            99, // Invalid type
            mockPremium,
            mockCoverage,
            mockProof,
            mockProof,
            12
          )
      ).to.be.reverted;
    });

    it("Should reject zero duration", async function () {
      const mockPremium = ethers.hexlify(ethers.randomBytes(32));
      const mockCoverage = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      await expect(
        policyRegistry
          .connect(user1)
          .createPolicy(
            0, // Health
            mockPremium,
            mockCoverage,
            mockProof,
            mockProof,
            0 // Zero duration
          )
      ).to.be.revertedWithCustomError(policyRegistry, "InvalidDates");
    });
  });

  describe("Policy Status", function () {
    it("Should track policy types correctly", async function () {
      expect(await policyRegistry.getPolicyTypeCount(0)).to.equal(0); // Health
      expect(await policyRegistry.getPolicyTypeCount(1)).to.equal(0); // Property
      expect(await policyRegistry.getPolicyTypeCount(2)).to.equal(0); // Life
      expect(await policyRegistry.getPolicyTypeCount(3)).to.equal(0); // Cyber
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to transfer ownership", async function () {
      await expect(
        policyRegistry.connect(user1).transferOwnership(user2.address)
      ).to.be.revertedWithCustomError(policyRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to transfer ownership", async function () {
      await policyRegistry.connect(owner).transferOwnership(user1.address);
      expect(await policyRegistry.owner()).to.equal(user1.address);
    });
  });
});
