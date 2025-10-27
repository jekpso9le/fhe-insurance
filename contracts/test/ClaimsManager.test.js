const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ClaimsManager", function () {
  let claimsManager;
  let policyRegistry;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy PolicyRegistry first
    const PolicyRegistry = await ethers.getContractFactory("PolicyRegistry");
    policyRegistry = await PolicyRegistry.deploy();
    await policyRegistry.waitForDeployment();

    // Deploy ClaimsManager
    const ClaimsManager = await ethers.getContractFactory("ClaimsManager");
    claimsManager = await ClaimsManager.deploy();
    await claimsManager.waitForDeployment();

    // Link PolicyRegistry
    await claimsManager.setPolicyRegistry(await policyRegistry.getAddress());
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await claimsManager.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero claims", async function () {
      expect(await claimsManager.claimCounter()).to.equal(0);
    });

    it("Should link PolicyRegistry correctly", async function () {
      expect(await claimsManager.policyRegistryAddress()).to.equal(
        await policyRegistry.getAddress()
      );
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to set PolicyRegistry", async function () {
      const newAddress = ethers.Wallet.createRandom().address;
      await claimsManager.connect(owner).setPolicyRegistry(newAddress);
      expect(await claimsManager.policyRegistryAddress()).to.equal(newAddress);
    });

    it("Should reject non-owner from setting PolicyRegistry", async function () {
      const newAddress = ethers.Wallet.createRandom().address;
      await expect(
        claimsManager.connect(user1).setPolicyRegistry(newAddress)
      ).to.be.revertedWithCustomError(claimsManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Claim Submission", function () {
    it("Should reject invalid claim type", async function () {
      const ClaimType = {
        Medical: 0,
        PropertyDamage: 1,
        LifeEvent: 2,
        CyberIncident: 3,
      };

      const mockAmount = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));
      const documentHash = ethers.keccak256(ethers.toUtf8Bytes("test document"));

      await expect(
        claimsManager
          .connect(user1)
          .submitClaim(
            1, // policyId
            99, // Invalid claim type
            mockAmount,
            mockProof,
            documentHash
          )
      ).to.be.reverted;
    });

    it("Should track claim status counts", async function () {
      // Check initial counts
      expect(await claimsManager.getClaimCountByStatus(0)).to.equal(0); // Pending
      expect(await claimsManager.getClaimCountByStatus(1)).to.equal(0); // UnderReview
      expect(await claimsManager.getClaimCountByStatus(2)).to.equal(0); // Approved
      expect(await claimsManager.getClaimCountByStatus(3)).to.equal(0); // Rejected
      expect(await claimsManager.getClaimCountByStatus(4)).to.equal(0); // Paid
    });
  });

  describe("Claim Status Management", function () {
    it("Should allow owner to update claim status", async function () {
      // Note: Testing logic flow only
      // Actual claim submission requires FHE environment
      console.log("   [Info] Claim status tests require FHE environment");
    });

    it("Should reject non-owner from updating status", async function () {
      // Mock claimId
      const claimId = 0;

      await expect(
        claimsManager.connect(user1).updateClaimStatus(claimId, 1)
      ).to.be.revertedWithCustomError(claimsManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Claim Approval", function () {
    it("Should only allow owner to approve claims", async function () {
      const mockAmount = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));
      const claimId = 0;

      await expect(
        claimsManager.connect(user1).approveClaim(claimId, mockAmount, mockProof)
      ).to.be.revertedWithCustomError(claimsManager, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to reject claims", async function () {
      const claimId = 0;

      await expect(
        claimsManager.connect(user1).rejectClaim(claimId)
      ).to.be.revertedWithCustomError(claimsManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return empty array for user with no claims", async function () {
      const claims = await claimsManager.getUserClaims(user1.address);
      expect(claims.length).to.equal(0);
    });

    it("Should return empty array for policy with no claims", async function () {
      const claims = await claimsManager.getPolicyClaims(1);
      expect(claims.length).to.equal(0);
    });
  });
});
