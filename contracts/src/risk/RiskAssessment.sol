// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {externalEuint32, externalEuint8} from "encrypted-types/EncryptedTypes.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RiskAssessment
 * @notice FHE-based risk scoring for insurance underwriting
 * @dev All risk factors and scores are encrypted
 */
contract RiskAssessment is SepoliaConfig, Ownable {
    // ═══════════════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════════════

    struct RiskProfile {
        address user;
        euint8 encryptedAge;           // Age (encrypted)
        euint8 encryptedHealthScore;   // Health score 0-100
        euint8 encryptedCreditScore;   // Credit score 0-100
        euint8 encryptedRiskScore;     // Calculated risk score 0-100
        uint64 lastUpdated;
        bool exists;
    }

    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════

    // user => RiskProfile
    mapping(address => RiskProfile) public riskProfiles;

    uint256 public totalProfiles;

    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════

    event RiskProfileCreated(address indexed user, uint64 timestamp);
    event RiskProfileUpdated(address indexed user, uint64 timestamp);
    event RiskScoreCalculated(address indexed user, uint64 timestamp);

    // ═══════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════

    error ProfileAlreadyExists();
    error ProfileNotFound();
    error Unauthorized();

    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor() Ownable(msg.sender) {}

    // ═══════════════════════════════════════════════════════════════
    // CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Create risk profile with encrypted data
     * @param encryptedAge Encrypted age
     * @param encryptedHealthScore Encrypted health score (0-100)
     * @param encryptedCreditScore Encrypted credit score (0-100)
     * @param ageProof Proof for age
     * @param healthProof Proof for health score
     * @param creditProof Proof for credit score
     */
    function createRiskProfile(
        externalEuint8 encryptedAge,
        externalEuint8 encryptedHealthScore,
        externalEuint8 encryptedCreditScore,
        bytes calldata ageProof,
        bytes calldata healthProof,
        bytes calldata creditProof
    ) external {
        if (riskProfiles[msg.sender].exists) revert ProfileAlreadyExists();

        // Convert encrypted inputs
        euint8 age = FHE.fromExternal(encryptedAge, ageProof);
        euint8 healthScore = FHE.fromExternal(encryptedHealthScore, healthProof);
        euint8 creditScore = FHE.fromExternal(encryptedCreditScore, creditProof);

        // Calculate risk score (simplified algorithm)
        euint8 riskScore = _calculateRiskScore(age, healthScore, creditScore);

        // Setup ACL permissions
        FHE.allow(age, msg.sender);
        FHE.allowThis(age);
        FHE.allow(healthScore, msg.sender);
        FHE.allowThis(healthScore);
        FHE.allow(creditScore, msg.sender);
        FHE.allowThis(creditScore);
        FHE.allow(riskScore, msg.sender);
        FHE.allowThis(riskScore);

        riskProfiles[msg.sender] = RiskProfile({
            user: msg.sender,
            encryptedAge: age,
            encryptedHealthScore: healthScore,
            encryptedCreditScore: creditScore,
            encryptedRiskScore: riskScore,
            lastUpdated: uint64(block.timestamp),
            exists: true
        });

        totalProfiles++;

        emit RiskProfileCreated(msg.sender, uint64(block.timestamp));
    }

    /**
     * @notice Calculate risk score from factors (simplified FHE logic)
     * @dev In production, use more sophisticated risk models
     */
    function _calculateRiskScore(
        euint8 age,
        euint8 healthScore,
        euint8 creditScore
    ) private returns (euint8) {
        // Simplified risk calculation:
        // Risk = (age/2) + (100-health)/2 + (100-credit)/2 / 3
        // This is a placeholder - real implementations would be more complex

        // For now, return weighted sum (simplified)
        // Note: FHE doesn't support division
        euint8 invertedHealth = FHE.sub(FHE.asEuint8(100), healthScore);
        euint8 invertedCredit = FHE.sub(FHE.asEuint8(100), creditScore);

        // Weighted sum: age + (100-health) + (100-credit)
        // Higher value = higher risk
        euint8 sum = FHE.add(age, FHE.add(invertedHealth, invertedCredit));

        return sum;
    }

    /**
     * @notice Get encrypted risk score
     * @return euint8 Encrypted risk score
     */
    function getRiskScore() external view returns (euint8) {
        RiskProfile storage profile = riskProfiles[msg.sender];
        if (!profile.exists) revert ProfileNotFound();

        return profile.encryptedRiskScore;
    }

    /**
     * @notice Check if user has risk profile
     * @param user Address to check
     * @return bool True if profile exists
     */
    function hasRiskProfile(address user) external view returns (bool) {
        return riskProfiles[user].exists;
    }
}
