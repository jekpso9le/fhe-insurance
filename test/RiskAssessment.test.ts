import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

// Contract type
type RiskAssessment = any;

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = await ethers.getContractFactory("RiskAssessment");
  const riskAssessment = await factory.deploy();
  const riskAssessmentAddress = await riskAssessment.getAddress();

  return { riskAssessment, riskAssessmentAddress };
}

describe("RiskAssessment", function () {
  let signers: Signers;
  let riskAssessment: RiskAssessment;
  let riskAssessmentAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2]
    };
  });

  beforeEach(async function () {
    ({ riskAssessment, riskAssessmentAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await riskAssessment.owner()).to.equal(signers.deployer.address);
    });

    it("Should initialize with zero profiles", async function () {
      expect(await riskAssessment.totalProfiles()).to.equal(0);
    });
  });

  describe("Risk Profile Check", function () {
    it("Should return false for non-existent profile", async function () {
      expect(await riskAssessment.hasRiskProfile(signers.alice.address)).to.equal(false);
      expect(await riskAssessment.hasRiskProfile(signers.bob.address)).to.equal(false);
    });
  });

  describe("Risk Profile Creation with FHE", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        console.warn("Skipping FHE tests - requires mock environment");
        this.skip();
      }
    });

    it("Should create risk profile with encrypted data", async function () {
      const age = 35;
      const healthScore = 85; // 85/100
      const creditScore = 75; // 75/100

      // Create encrypted age
      const encryptedAgeInput = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(age)
        .encrypt();

      // Create encrypted health score
      const encryptedHealthInput = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(healthScore)
        .encrypt();

      // Create encrypted credit score
      const encryptedCreditInput = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(creditScore)
        .encrypt();

      // Create risk profile
      const tx = await riskAssessment
        .connect(signers.alice)
        .createRiskProfile(
          encryptedAgeInput.handles[0],
          encryptedHealthInput.handles[0],
          encryptedCreditInput.handles[0],
          encryptedAgeInput.inputProof,
          encryptedHealthInput.inputProof,
          encryptedCreditInput.inputProof
        );
      await tx.wait();

      // Verify profile was created
      expect(await riskAssessment.hasRiskProfile(signers.alice.address)).to.equal(true);
      expect(await riskAssessment.totalProfiles()).to.equal(1);
    });

    it("Should create profiles for multiple users", async function () {
      // Alice's profile
      const aliceAge = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(30)
        .encrypt();
      const aliceHealth = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(90)
        .encrypt();
      const aliceCredit = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(80)
        .encrypt();

      await riskAssessment
        .connect(signers.alice)
        .createRiskProfile(
          aliceAge.handles[0],
          aliceHealth.handles[0],
          aliceCredit.handles[0],
          aliceAge.inputProof,
          aliceHealth.inputProof,
          aliceCredit.inputProof
        );

      // Bob's profile
      const bobAge = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.bob.address)
        .add8(50)
        .encrypt();
      const bobHealth = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.bob.address)
        .add8(70)
        .encrypt();
      const bobCredit = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.bob.address)
        .add8(85)
        .encrypt();

      await riskAssessment
        .connect(signers.bob)
        .createRiskProfile(
          bobAge.handles[0],
          bobHealth.handles[0],
          bobCredit.handles[0],
          bobAge.inputProof,
          bobHealth.inputProof,
          bobCredit.inputProof
        );

      // Verify both profiles exist
      expect(await riskAssessment.hasRiskProfile(signers.alice.address)).to.equal(true);
      expect(await riskAssessment.hasRiskProfile(signers.bob.address)).to.equal(true);
      expect(await riskAssessment.totalProfiles()).to.equal(2);
    });

    it("Should reject duplicate profile creation", async function () {
      // Create first profile
      const age = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(35)
        .encrypt();
      const health = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(85)
        .encrypt();
      const credit = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(75)
        .encrypt();

      await riskAssessment
        .connect(signers.alice)
        .createRiskProfile(
          age.handles[0],
          health.handles[0],
          credit.handles[0],
          age.inputProof,
          health.inputProof,
          credit.inputProof
        );

      // Try to create duplicate profile
      const age2 = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(36)
        .encrypt();
      const health2 = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(86)
        .encrypt();
      const credit2 = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(76)
        .encrypt();

      await expect(
        riskAssessment
          .connect(signers.alice)
          .createRiskProfile(
            age2.handles[0],
            health2.handles[0],
            credit2.handles[0],
            age2.inputProof,
            health2.inputProof,
            credit2.inputProof
          )
      ).to.be.revertedWithCustomError(riskAssessment, "ProfileAlreadyExists");
    });

    it("Should calculate risk score from factors", async function () {
      // Create profile with specific values
      const age = 40; // Moderate age contribution
      const healthScore = 80; // Good health (100-80=20 risk)
      const creditScore = 70; // Decent credit (100-70=30 risk)
      // Expected risk = 40 + 20 + 30 = 90

      const encryptedAge = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(age)
        .encrypt();
      const encryptedHealth = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(healthScore)
        .encrypt();
      const encryptedCredit = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(creditScore)
        .encrypt();

      await riskAssessment
        .connect(signers.alice)
        .createRiskProfile(
          encryptedAge.handles[0],
          encryptedHealth.handles[0],
          encryptedCredit.handles[0],
          encryptedAge.inputProof,
          encryptedHealth.inputProof,
          encryptedCredit.inputProof
        );

      // Get encrypted risk score
      const encryptedRiskScore = await riskAssessment.connect(signers.alice).getRiskScore();

      // In mock mode, we can decrypt to verify
      if (fhevm.isMock && encryptedRiskScore !== ethers.ZeroHash) {
        const decryptedScore = await fhevm.userDecryptEuint(
          FhevmType.euint8,
          encryptedRiskScore,
          riskAssessmentAddress,
          signers.alice
        );

        // Risk = age + (100-health) + (100-credit)
        // Risk = 40 + 20 + 30 = 90
        expect(decryptedScore).to.equal(90);
      }
    });
  });

  describe("Risk Score Retrieval", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        this.skip();
      }
    });

    it("Should revert when getting score for non-existent profile", async function () {
      await expect(
        riskAssessment.connect(signers.alice).getRiskScore()
      ).to.be.revertedWithCustomError(riskAssessment, "ProfileNotFound");
    });

    it("Should return encrypted risk score for existing profile", async function () {
      // Create profile first
      const age = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(35)
        .encrypt();
      const health = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(85)
        .encrypt();
      const credit = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(75)
        .encrypt();

      await riskAssessment
        .connect(signers.alice)
        .createRiskProfile(
          age.handles[0],
          health.handles[0],
          credit.handles[0],
          age.inputProof,
          health.inputProof,
          credit.inputProof
        );

      // Should not revert
      const riskScore = await riskAssessment.connect(signers.alice).getRiskScore();
      expect(riskScore).to.not.equal(ethers.ZeroHash);
    });
  });

  describe("Risk Score Formula Validation", function () {
    beforeEach(async function () {
      if (!fhevm.isMock) {
        this.skip();
      }
    });

    it("Should calculate higher risk for older age", async function () {
      // Young person
      const youngAge = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(25)
        .encrypt();
      const youngHealth = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(90)
        .encrypt();
      const youngCredit = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(90)
        .encrypt();

      await riskAssessment
        .connect(signers.alice)
        .createRiskProfile(
          youngAge.handles[0],
          youngHealth.handles[0],
          youngCredit.handles[0],
          youngAge.inputProof,
          youngHealth.inputProof,
          youngCredit.inputProof
        );

      const youngRiskScore = await riskAssessment.connect(signers.alice).getRiskScore();

      // Older person
      const oldAge = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.bob.address)
        .add8(65)
        .encrypt();
      const oldHealth = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.bob.address)
        .add8(90)
        .encrypt();
      const oldCredit = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.bob.address)
        .add8(90)
        .encrypt();

      await riskAssessment
        .connect(signers.bob)
        .createRiskProfile(
          oldAge.handles[0],
          oldHealth.handles[0],
          oldCredit.handles[0],
          oldAge.inputProof,
          oldHealth.inputProof,
          oldCredit.inputProof
        );

      const oldRiskScore = await riskAssessment.connect(signers.bob).getRiskScore();

      // In mock mode, verify the older person has higher risk
      if (fhevm.isMock) {
        const youngDecrypted = await fhevm.userDecryptEuint(
          FhevmType.euint8,
          youngRiskScore,
          riskAssessmentAddress,
          signers.alice
        );
        const oldDecrypted = await fhevm.userDecryptEuint(
          FhevmType.euint8,
          oldRiskScore,
          riskAssessmentAddress,
          signers.bob
        );

        // Young: 25 + 10 + 10 = 45
        // Old: 65 + 10 + 10 = 85
        expect(oldDecrypted).to.be.gt(youngDecrypted);
      }
    });

    it("Should calculate higher risk for lower health score", async function () {
      // Healthy person
      const healthyAge = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(40)
        .encrypt();
      const healthyHealth = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(95)
        .encrypt();
      const healthyCredit = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(80)
        .encrypt();

      await riskAssessment
        .connect(signers.alice)
        .createRiskProfile(
          healthyAge.handles[0],
          healthyHealth.handles[0],
          healthyCredit.handles[0],
          healthyAge.inputProof,
          healthyHealth.inputProof,
          healthyCredit.inputProof
        );

      // Less healthy person
      const lessHealthyAge = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.bob.address)
        .add8(40)
        .encrypt();
      const lessHealthyHealth = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.bob.address)
        .add8(50)
        .encrypt();
      const lessHealthyCredit = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.bob.address)
        .add8(80)
        .encrypt();

      await riskAssessment
        .connect(signers.bob)
        .createRiskProfile(
          lessHealthyAge.handles[0],
          lessHealthyHealth.handles[0],
          lessHealthyCredit.handles[0],
          lessHealthyAge.inputProof,
          lessHealthyHealth.inputProof,
          lessHealthyCredit.inputProof
        );

      // Verify in mock mode
      if (fhevm.isMock) {
        const healthyScore = await riskAssessment.connect(signers.alice).getRiskScore();
        const lessHealthyScore = await riskAssessment.connect(signers.bob).getRiskScore();

        const healthyDecrypted = await fhevm.userDecryptEuint(
          FhevmType.euint8,
          healthyScore,
          riskAssessmentAddress,
          signers.alice
        );
        const lessHealthyDecrypted = await fhevm.userDecryptEuint(
          FhevmType.euint8,
          lessHealthyScore,
          riskAssessmentAddress,
          signers.bob
        );

        // Healthy: 40 + 5 + 20 = 65
        // Less healthy: 40 + 50 + 20 = 110
        expect(lessHealthyDecrypted).to.be.gt(healthyDecrypted);
      }
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to transfer ownership", async function () {
      await expect(
        riskAssessment.connect(signers.alice).transferOwnership(signers.bob.address)
      ).to.be.revertedWithCustomError(riskAssessment, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to transfer ownership", async function () {
      await riskAssessment.connect(signers.deployer).transferOwnership(signers.alice.address);
      expect(await riskAssessment.owner()).to.equal(signers.alice.address);
    });
  });

  describe("Profile Statistics", function () {
    it("Should start with zero total profiles", async function () {
      expect(await riskAssessment.totalProfiles()).to.equal(0);
    });

    it("Should increment total profiles when created", async function () {
      if (!fhevm.isMock) {
        this.skip();
      }

      const age = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(35)
        .encrypt();
      const health = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(85)
        .encrypt();
      const credit = await fhevm
        .createEncryptedInput(riskAssessmentAddress, signers.alice.address)
        .add8(75)
        .encrypt();

      expect(await riskAssessment.totalProfiles()).to.equal(0);

      await riskAssessment
        .connect(signers.alice)
        .createRiskProfile(
          age.handles[0],
          health.handles[0],
          credit.handles[0],
          age.inputProof,
          health.inputProof,
          credit.inputProof
        );

      expect(await riskAssessment.totalProfiles()).to.equal(1);
    });
  });
});
