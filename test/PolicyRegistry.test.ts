import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

// Contract type will be generated after compilation
type PolicyRegistry = any;

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

// Policy types enum matching the contract
const PolicyType = {
  Health: 0,
  Property: 1,
  Life: 2,
  Cyber: 3,
};

// Policy status enum matching the contract
const PolicyStatus = {
  Active: 0,
  Inactive: 1,
  Expired: 2,
  Claimed: 3,
};

async function deployFixture() {
  const factory = await ethers.getContractFactory("PolicyRegistry");
  const policyRegistry = await factory.deploy();
  const policyRegistryAddress = await policyRegistry.getAddress();

  return { policyRegistry, policyRegistryAddress };
}

describe("PolicyRegistry", function () {
  let signers: Signers;
  let policyRegistry: PolicyRegistry;
  let policyRegistryAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2]
    };
  });

  beforeEach(async function () {
    ({ policyRegistry, policyRegistryAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await policyRegistry.owner()).to.equal(signers.deployer.address);
    });

    it("Should initialize with zero policies", async function () {
      expect(await policyRegistry.policyCounter()).to.equal(0);
    });

    it("Should initialize all policy type counts to zero", async function () {
      expect(await policyRegistry.getPolicyTypeCount(PolicyType.Health)).to.equal(0);
      expect(await policyRegistry.getPolicyTypeCount(PolicyType.Property)).to.equal(0);
      expect(await policyRegistry.getPolicyTypeCount(PolicyType.Life)).to.equal(0);
      expect(await policyRegistry.getPolicyTypeCount(PolicyType.Cyber)).to.equal(0);
    });
  });

  describe("Policy Creation with FHE", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        console.warn("Skipping FHE tests - requires mock environment");
        this.skip();
      }
    });

    it("Should create a Health insurance policy with encrypted data", async function () {
      const premium = 100; // $100 monthly premium
      const coverage = 10000; // $10,000 coverage
      const durationMonths = 12;

      // Create encrypted premium
      const encryptedPremiumInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(premium)
        .encrypt();

      // Create encrypted coverage
      const encryptedCoverageInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(coverage)
        .encrypt();

      // Create policy
      const tx = await policyRegistry
        .connect(signers.alice)
        .createPolicy(
          PolicyType.Health,
          encryptedPremiumInput.handles[0],
          encryptedCoverageInput.handles[0],
          encryptedPremiumInput.inputProof,
          encryptedCoverageInput.inputProof,
          durationMonths
        );
      await tx.wait();

      // Verify policy was created
      expect(await policyRegistry.policyCounter()).to.equal(1);
      expect(await policyRegistry.getPolicyTypeCount(PolicyType.Health)).to.equal(1);

      // Verify user has the policy
      const userPolicies = await policyRegistry.getUserPolicies(signers.alice.address);
      expect(userPolicies.length).to.equal(1);
      expect(userPolicies[0]).to.equal(0); // First policy ID is 0
    });

    it("Should create multiple policies of different types", async function () {
      const createPolicyWithType = async (policyType: number, user: HardhatEthersSigner) => {
        const encryptedPremiumInput = await fhevm
          .createEncryptedInput(policyRegistryAddress, user.address)
          .add64(100)
          .encrypt();

        const encryptedCoverageInput = await fhevm
          .createEncryptedInput(policyRegistryAddress, user.address)
          .add64(10000)
          .encrypt();

        const tx = await policyRegistry
          .connect(user)
          .createPolicy(
            policyType,
            encryptedPremiumInput.handles[0],
            encryptedCoverageInput.handles[0],
            encryptedPremiumInput.inputProof,
            encryptedCoverageInput.inputProof,
            12
          );
        await tx.wait();
      };

      await createPolicyWithType(PolicyType.Health, signers.alice);
      await createPolicyWithType(PolicyType.Property, signers.alice);
      await createPolicyWithType(PolicyType.Life, signers.bob);
      await createPolicyWithType(PolicyType.Cyber, signers.bob);

      expect(await policyRegistry.policyCounter()).to.equal(4);
      expect(await policyRegistry.getPolicyTypeCount(PolicyType.Health)).to.equal(1);
      expect(await policyRegistry.getPolicyTypeCount(PolicyType.Property)).to.equal(1);
      expect(await policyRegistry.getPolicyTypeCount(PolicyType.Life)).to.equal(1);
      expect(await policyRegistry.getPolicyTypeCount(PolicyType.Cyber)).to.equal(1);

      // Alice should have 2 policies
      const alicePolicies = await policyRegistry.getUserPolicies(signers.alice.address);
      expect(alicePolicies.length).to.equal(2);

      // Bob should have 2 policies
      const bobPolicies = await policyRegistry.getUserPolicies(signers.bob.address);
      expect(bobPolicies.length).to.equal(2);
    });

    it("Should return correct policy details", async function () {
      const encryptedPremiumInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(150)
        .encrypt();

      const encryptedCoverageInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(25000)
        .encrypt();

      const tx = await policyRegistry
        .connect(signers.alice)
        .createPolicy(
          PolicyType.Property,
          encryptedPremiumInput.handles[0],
          encryptedCoverageInput.handles[0],
          encryptedPremiumInput.inputProof,
          encryptedCoverageInput.inputProof,
          6 // 6 months
        );
      await tx.wait();

      const details = await policyRegistry.getPolicyDetails(0);

      expect(details.policyholder).to.equal(signers.alice.address);
      expect(details.policyType).to.equal(PolicyType.Property);
      expect(details.status).to.equal(PolicyStatus.Active);
      // Start date should be recent
      expect(details.startDate).to.be.gt(0);
      // End date should be ~6 months later
      expect(details.endDate).to.be.gt(details.startDate);
    });
  });

  describe("Policy Validation", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        this.skip();
      }
    });

    it("Should reject invalid policy type", async function () {
      const encryptedPremiumInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(100)
        .encrypt();

      const encryptedCoverageInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(10000)
        .encrypt();

      // Note: Passing an out-of-range value for enum causes Solidity to panic
      // before our custom error check, so we just verify it reverts
      await expect(
        policyRegistry
          .connect(signers.alice)
          .createPolicy(
            99, // Invalid type (out of enum range)
            encryptedPremiumInput.handles[0],
            encryptedCoverageInput.handles[0],
            encryptedPremiumInput.inputProof,
            encryptedCoverageInput.inputProof,
            12
          )
      ).to.be.reverted;
    });

    it("Should reject zero duration", async function () {
      const encryptedPremiumInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(100)
        .encrypt();

      const encryptedCoverageInput = await fhevm
        .createEncryptedInput(policyRegistryAddress, signers.alice.address)
        .add64(10000)
        .encrypt();

      await expect(
        policyRegistry
          .connect(signers.alice)
          .createPolicy(
            PolicyType.Health,
            encryptedPremiumInput.handles[0],
            encryptedCoverageInput.handles[0],
            encryptedPremiumInput.inputProof,
            encryptedCoverageInput.inputProof,
            0 // Zero duration
          )
      ).to.be.revertedWithCustomError(policyRegistry, "InvalidDates");
    });

    it("Should revert when getting non-existent policy details", async function () {
      await expect(
        policyRegistry.getPolicyDetails(999)
      ).to.be.revertedWithCustomError(policyRegistry, "PolicyNotFound");
    });
  });

  describe("Policy Renewal", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        this.skip();
      }

      // Create a policy first
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

    it("Should allow policyholder to renew their policy", async function () {
      const detailsBefore = await policyRegistry.getPolicyDetails(0);
      const endDateBefore = detailsBefore.endDate;

      const tx = await policyRegistry.connect(signers.alice).renewPolicy(0, 6);
      await tx.wait();

      const detailsAfter = await policyRegistry.getPolicyDetails(0);
      const endDateAfter = detailsAfter.endDate;

      // End date should be extended by ~6 months (6 * 30 days)
      expect(endDateAfter).to.be.gt(endDateBefore);
    });

    it("Should reject renewal by non-owner", async function () {
      await expect(
        policyRegistry.connect(signers.bob).renewPolicy(0, 6)
      ).to.be.revertedWithCustomError(policyRegistry, "Unauthorized");
    });

    it("Should reject renewal with zero months", async function () {
      await expect(
        policyRegistry.connect(signers.alice).renewPolicy(0, 0)
      ).to.be.revertedWithCustomError(policyRegistry, "InvalidDates");
    });

    it("Should reject renewal of non-existent policy", async function () {
      await expect(
        policyRegistry.connect(signers.alice).renewPolicy(999, 6)
      ).to.be.revertedWithCustomError(policyRegistry, "PolicyNotFound");
    });
  });

  describe("Policy Status Management", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        this.skip();
      }

      // Create a policy
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

    it("Should allow owner to update policy status", async function () {
      const tx = await policyRegistry
        .connect(signers.deployer)
        .updatePolicyStatus(0, PolicyStatus.Inactive);
      await tx.wait();

      const details = await policyRegistry.getPolicyDetails(0);
      expect(details.status).to.equal(PolicyStatus.Inactive);
    });

    it("Should allow policyholder to update their policy status", async function () {
      const tx = await policyRegistry
        .connect(signers.alice)
        .updatePolicyStatus(0, PolicyStatus.Inactive);
      await tx.wait();

      const details = await policyRegistry.getPolicyDetails(0);
      expect(details.status).to.equal(PolicyStatus.Inactive);
    });

    it("Should reject status update by unauthorized user", async function () {
      await expect(
        policyRegistry.connect(signers.bob).updatePolicyStatus(0, PolicyStatus.Inactive)
      ).to.be.revertedWithCustomError(policyRegistry, "Unauthorized");
    });

    it("Should correctly report isPolicyActive", async function () {
      expect(await policyRegistry.isPolicyActive(0)).to.equal(true);

      // Deactivate
      await policyRegistry.connect(signers.alice).updatePolicyStatus(0, PolicyStatus.Inactive);

      expect(await policyRegistry.isPolicyActive(0)).to.equal(false);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to transfer ownership", async function () {
      await expect(
        policyRegistry.connect(signers.alice).transferOwnership(signers.bob.address)
      ).to.be.revertedWithCustomError(policyRegistry, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to transfer ownership", async function () {
      await policyRegistry.connect(signers.deployer).transferOwnership(signers.alice.address);
      expect(await policyRegistry.owner()).to.equal(signers.alice.address);
    });
  });

  describe("View Functions", function () {
    it("Should return empty array for user with no policies", async function () {
      const policies = await policyRegistry.getUserPolicies(signers.alice.address);
      expect(policies.length).to.equal(0);
    });

    it("Should return false for isPolicyActive on non-existent policy", async function () {
      expect(await policyRegistry.isPolicyActive(999)).to.equal(false);
    });
  });
});
