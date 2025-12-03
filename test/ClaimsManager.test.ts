import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

// Contract types
type ClaimsManager = any;
type PolicyRegistry = any;

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

// Claim status enum matching the contract
const ClaimStatus = {
  Pending: 0,
  UnderReview: 1,
  Approved: 2,
  Rejected: 3,
  Paid: 4,
};

// Claim type enum matching the contract
const ClaimType = {
  Medical: 0,
  PropertyDamage: 1,
  LifeEvent: 2,
  CyberIncident: 3,
};

// Policy type enum
const PolicyType = {
  Health: 0,
  Property: 1,
  Life: 2,
  Cyber: 3,
};

async function deployFixture() {
  // Deploy PolicyRegistry first
  const policyRegistryFactory = await ethers.getContractFactory("PolicyRegistry");
  const policyRegistry = await policyRegistryFactory.deploy();
  const policyRegistryAddress = await policyRegistry.getAddress();

  // Deploy ClaimsManager
  const claimsManagerFactory = await ethers.getContractFactory("ClaimsManager");
  const claimsManager = await claimsManagerFactory.deploy();
  const claimsManagerAddress = await claimsManager.getAddress();

  // Link PolicyRegistry to ClaimsManager
  await claimsManager.setPolicyRegistry(policyRegistryAddress);

  return {
    policyRegistry,
    policyRegistryAddress,
    claimsManager,
    claimsManagerAddress
  };
}

describe("ClaimsManager", function () {
  let signers: Signers;
  let policyRegistry: PolicyRegistry;
  let policyRegistryAddress: string;
  let claimsManager: ClaimsManager;
  let claimsManagerAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2]
    };
  });

  beforeEach(async function () {
    ({
      policyRegistry,
      policyRegistryAddress,
      claimsManager,
      claimsManagerAddress
    } = await deployFixture());
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await claimsManager.owner()).to.equal(signers.deployer.address);
    });

    it("Should initialize with zero claims", async function () {
      expect(await claimsManager.claimCounter()).to.equal(0);
    });

    it("Should link PolicyRegistry correctly", async function () {
      expect(await claimsManager.policyRegistryAddress()).to.equal(policyRegistryAddress);
    });

    it("Should initialize all claim status counts to zero", async function () {
      expect(await claimsManager.getClaimCountByStatus(ClaimStatus.Pending)).to.equal(0);
      expect(await claimsManager.getClaimCountByStatus(ClaimStatus.UnderReview)).to.equal(0);
      expect(await claimsManager.getClaimCountByStatus(ClaimStatus.Approved)).to.equal(0);
      expect(await claimsManager.getClaimCountByStatus(ClaimStatus.Rejected)).to.equal(0);
      expect(await claimsManager.getClaimCountByStatus(ClaimStatus.Paid)).to.equal(0);
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to set PolicyRegistry", async function () {
      const newAddress = ethers.Wallet.createRandom().address;
      await claimsManager.connect(signers.deployer).setPolicyRegistry(newAddress);
      expect(await claimsManager.policyRegistryAddress()).to.equal(newAddress);
    });

    it("Should reject non-owner from setting PolicyRegistry", async function () {
      const newAddress = ethers.Wallet.createRandom().address;
      await expect(
        claimsManager.connect(signers.alice).setPolicyRegistry(newAddress)
      ).to.be.revertedWithCustomError(claimsManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Claim Submission with FHE", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        console.warn("Skipping FHE tests - requires mock environment");
        this.skip();
      }

      // Create a policy for Alice first
      const encryptedPremiumInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(100)
        .encrypt();

      const encryptedCoverageInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(10000)
        .encrypt();

      await policyRegistry
        .connect(signers.alice)
        .createPolicy(
          PolicyType.Health,
          encryptedPremiumInput.handles[0],
          encryptedCoverageInput.handles[0],
          encryptedPremiumInput.inputProof,
          encryptedCoverageInput.inputProof,
          12
        );
    });

    it("Should submit a medical claim with encrypted amount", async function () {
      const claimAmount = 500;
      const description = "Hospital visit for checkup";

      const encryptedAmountInput = await fhevm
        .createEncryptedInput(claimsManagerAddress, signers.alice.address)
        .add64(claimAmount)
        .encrypt();

      const tx = await claimsManager
        .connect(signers.alice)
        .submitClaim(
          0, // policyId
          ClaimType.Medical,
          encryptedAmountInput.handles[0],
          encryptedAmountInput.inputProof,
          description
        );
      await tx.wait();

      // Verify claim was created
      expect(await claimsManager.claimCounter()).to.equal(1);
      expect(await claimsManager.getClaimCountByStatus(ClaimStatus.Pending)).to.equal(1);

      // Verify user has the claim
      const userClaims = await claimsManager.getUserClaims(signers.alice.address);
      expect(userClaims.length).to.equal(1);
      expect(userClaims[0]).to.equal(0); // First claim ID is 0

      // Verify policy has the claim
      const policyClaims = await claimsManager.getPolicyClaims(0);
      expect(policyClaims.length).to.equal(1);
    });

    it("Should return correct claim details", async function () {
      const claimAmount = 1500;
      const description = "Emergency room visit";

      const encryptedAmountInput = await fhevm
        .createEncryptedInput(claimsManagerAddress, signers.alice.address)
        .add64(claimAmount)
        .encrypt();

      await claimsManager
        .connect(signers.alice)
        .submitClaim(
          0,
          ClaimType.Medical,
          encryptedAmountInput.handles[0],
          encryptedAmountInput.inputProof,
          description
        );

      const details = await claimsManager.getClaimDetails(0);

      expect(details.policyId).to.equal(0);
      expect(details.claimant).to.equal(signers.alice.address);
      expect(details.claimType).to.equal(ClaimType.Medical);
      expect(details.status).to.equal(ClaimStatus.Pending);
      expect(details.description).to.equal(description);
      expect(details.submittedAt).to.be.gt(0);
      expect(details.reviewedAt).to.equal(0);
      expect(details.reviewer).to.equal(ethers.ZeroAddress);
    });

    it("Should submit multiple claims for different policies", async function () {
      // Create another policy for Bob
      const encryptedPremiumInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.bob.address)
        .add64(200)
        .encrypt();

      const encryptedCoverageInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.bob.address)
        .add64(50000)
        .encrypt();

      await policyRegistry
        .connect(signers.bob)
        .createPolicy(
          PolicyType.Property,
          encryptedPremiumInput.handles[0],
          encryptedCoverageInput.handles[0],
          encryptedPremiumInput.inputProof,
          encryptedCoverageInput.inputProof,
          24
        );

      // Alice submits claim on policy 0
      const aliceAmountInput = await fhevm
        .createEncryptedInput(claimsManagerAddress, signers.alice.address)
        .add64(500)
        .encrypt();

      await claimsManager
        .connect(signers.alice)
        .submitClaim(
          0,
          ClaimType.Medical,
          aliceAmountInput.handles[0],
          aliceAmountInput.inputProof,
          "Alice's medical claim"
        );

      // Bob submits claim on policy 1
      const bobAmountInput = await fhevm
        .createEncryptedInput(claimsManagerAddress, signers.bob.address)
        .add64(2000)
        .encrypt();

      await claimsManager
        .connect(signers.bob)
        .submitClaim(
          1,
          ClaimType.PropertyDamage,
          bobAmountInput.handles[0],
          bobAmountInput.inputProof,
          "Bob's property damage claim"
        );

      expect(await claimsManager.claimCounter()).to.equal(2);

      const aliceClaims = await claimsManager.getUserClaims(signers.alice.address);
      expect(aliceClaims.length).to.equal(1);

      const bobClaims = await claimsManager.getUserClaims(signers.bob.address);
      expect(bobClaims.length).to.equal(1);
    });
  });

  describe("Claim Validation", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        this.skip();
      }
    });

    it("Should reject invalid claim type", async function () {
      const encryptedAmountInput = await fhevm
        .createEncryptedInput(claimsManagerAddress, signers.alice.address)
        .add64(500)
        .encrypt();

      // Note: Passing an out-of-range value for enum causes Solidity to panic
      // before our custom error check, so we just verify it reverts
      await expect(
        claimsManager
          .connect(signers.alice)
          .submitClaim(
            0,
            99, // Invalid type (out of enum range)
            encryptedAmountInput.handles[0],
            encryptedAmountInput.inputProof,
            "Test description"
          )
      ).to.be.reverted;
    });

    it("Should revert when getting non-existent claim details", async function () {
      await expect(
        claimsManager.getClaimDetails(999)
      ).to.be.revertedWithCustomError(claimsManager, "ClaimNotFound");
    });
  });

  describe("Claim Status Management", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        this.skip();
      }

      // Create a policy and submit a claim
      const encryptedPremiumInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(100)
        .encrypt();

      const encryptedCoverageInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(10000)
        .encrypt();

      await policyRegistry
        .connect(signers.alice)
        .createPolicy(
          PolicyType.Health,
          encryptedPremiumInput.handles[0],
          encryptedCoverageInput.handles[0],
          encryptedPremiumInput.inputProof,
          encryptedCoverageInput.inputProof,
          12
        );

      const encryptedAmountInput = await fhevm
        .createEncryptedInput(claimsManagerAddress, signers.alice.address)
        .add64(500)
        .encrypt();

      await claimsManager
        .connect(signers.alice)
        .submitClaim(
          0,
          ClaimType.Medical,
          encryptedAmountInput.handles[0],
          encryptedAmountInput.inputProof,
          "Test claim"
        );
    });

    it("Should allow owner to update claim status", async function () {
      await claimsManager.connect(signers.deployer).updateClaimStatus(0, ClaimStatus.UnderReview);

      const details = await claimsManager.getClaimDetails(0);
      expect(details.status).to.equal(ClaimStatus.UnderReview);
      expect(await claimsManager.getClaimCountByStatus(ClaimStatus.Pending)).to.equal(0);
      expect(await claimsManager.getClaimCountByStatus(ClaimStatus.UnderReview)).to.equal(1);
    });

    it("Should reject non-owner from updating claim status", async function () {
      await expect(
        claimsManager.connect(signers.alice).updateClaimStatus(0, ClaimStatus.UnderReview)
      ).to.be.revertedWithCustomError(claimsManager, "OwnableUnauthorizedAccount");
    });

    it("Should reject updating status of non-existent claim", async function () {
      await expect(
        claimsManager.connect(signers.deployer).updateClaimStatus(999, ClaimStatus.UnderReview)
      ).to.be.revertedWithCustomError(claimsManager, "ClaimNotFound");
    });
  });

  describe("Claim Approval", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        this.skip();
      }

      // Create policy and claim
      const encryptedPremiumInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(100)
        .encrypt();

      const encryptedCoverageInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(10000)
        .encrypt();

      await policyRegistry
        .connect(signers.alice)
        .createPolicy(
          PolicyType.Health,
          encryptedPremiumInput.handles[0],
          encryptedCoverageInput.handles[0],
          encryptedPremiumInput.inputProof,
          encryptedCoverageInput.inputProof,
          12
        );

      const encryptedAmountInput = await fhevm
        .createEncryptedInput(claimsManagerAddress, signers.alice.address)
        .add64(500)
        .encrypt();

      await claimsManager
        .connect(signers.alice)
        .submitClaim(
          0,
          ClaimType.Medical,
          encryptedAmountInput.handles[0],
          encryptedAmountInput.inputProof,
          "Test claim"
        );
    });

    it("Should allow owner to approve claim with encrypted amount", async function () {
      const approvedAmount = 450;

      const encryptedApprovedInput = await fhevm
        .createEncryptedInput(claimsManagerAddress, signers.deployer.address)
        .add64(approvedAmount)
        .encrypt();

      await claimsManager
        .connect(signers.deployer)
        .approveClaim(
          0,
          encryptedApprovedInput.handles[0],
          encryptedApprovedInput.inputProof
        );

      const details = await claimsManager.getClaimDetails(0);
      expect(details.status).to.equal(ClaimStatus.Approved);
      expect(details.reviewer).to.equal(signers.deployer.address);
      expect(details.reviewedAt).to.be.gt(0);
    });

    it("Should reject non-owner from approving claims", async function () {
      const encryptedApprovedInput = await fhevm
        .createEncryptedInput(claimsManagerAddress, signers.alice.address)
        .add64(450)
        .encrypt();

      await expect(
        claimsManager
          .connect(signers.alice)
          .approveClaim(0, encryptedApprovedInput.handles[0], encryptedApprovedInput.inputProof)
      ).to.be.revertedWithCustomError(claimsManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("Claim Rejection", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        this.skip();
      }

      // Create policy and claim
      const encryptedPremiumInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(100)
        .encrypt();

      const encryptedCoverageInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(10000)
        .encrypt();

      await policyRegistry
        .connect(signers.alice)
        .createPolicy(
          PolicyType.Health,
          encryptedPremiumInput.handles[0],
          encryptedCoverageInput.handles[0],
          encryptedPremiumInput.inputProof,
          encryptedCoverageInput.inputProof,
          12
        );

      const encryptedAmountInput = await fhevm
        .createEncryptedInput(claimsManagerAddress, signers.alice.address)
        .add64(500)
        .encrypt();

      await claimsManager
        .connect(signers.alice)
        .submitClaim(
          0,
          ClaimType.Medical,
          encryptedAmountInput.handles[0],
          encryptedAmountInput.inputProof,
          "Test claim"
        );
    });

    it("Should allow owner to reject claim", async function () {
      await claimsManager.connect(signers.deployer).rejectClaim(0);

      const details = await claimsManager.getClaimDetails(0);
      expect(details.status).to.equal(ClaimStatus.Rejected);
      expect(await claimsManager.getClaimCountByStatus(ClaimStatus.Rejected)).to.equal(1);
    });

    it("Should reject non-owner from rejecting claims", async function () {
      await expect(
        claimsManager.connect(signers.alice).rejectClaim(0)
      ).to.be.revertedWithCustomError(claimsManager, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return empty array for user with no claims", async function () {
      const claims = await claimsManager.getUserClaims(signers.alice.address);
      expect(claims.length).to.equal(0);
    });

    it("Should return empty array for policy with no claims", async function () {
      const claims = await claimsManager.getPolicyClaims(0);
      expect(claims.length).to.equal(0);
    });
  });
});
