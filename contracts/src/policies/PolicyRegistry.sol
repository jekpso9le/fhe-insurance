// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {externalEuint64, externalEuint32} from "encrypted-types/EncryptedTypes.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PolicyRegistry
 * @notice Manages insurance policy creation and lifecycle with FHE privacy
 * @dev All sensitive policy data (premiums, coverage amounts) are encrypted
 */
contract PolicyRegistry is SepoliaConfig, Ownable, ReentrancyGuard {
    // ═══════════════════════════════════════════════════════════════
    // ENUMS & STRUCTS
    // ═══════════════════════════════════════════════════════════════

    enum PolicyType { Health, Property, Life, Cyber }
    enum PolicyStatus { Active, Inactive, Expired, Claimed }

    struct Policy {
        uint256 policyId;
        address policyholder;
        PolicyType policyType;
        PolicyStatus status;
        euint64 encryptedPremium;        // Monthly premium (encrypted)
        euint64 encryptedCoverageAmount; // Max coverage (encrypted)
        uint64 startDate;
        uint64 endDate;
        uint64 createdAt;
        bool exists;
    }

    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════

    uint256 public policyCounter;

    // policyId => Policy
    mapping(uint256 => Policy) public policies;

    // policyholder => policyIds
    mapping(address => uint256[]) public userPolicies;

    // policyType => count
    mapping(PolicyType => uint256) public policyTypeCount;

    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════

    event PolicyCreated(
        uint256 indexed policyId,
        address indexed policyholder,
        PolicyType policyType,
        uint64 startDate,
        uint64 endDate
    );

    event PolicyStatusChanged(
        uint256 indexed policyId,
        PolicyStatus oldStatus,
        PolicyStatus newStatus
    );

    event PolicyRenewed(
        uint256 indexed policyId,
        uint64 newEndDate
    );

    // ═══════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════

    error PolicyNotFound();
    error Unauthorized();
    error InvalidDates();
    error PolicyExpired();
    error InvalidPolicyType();

    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor() Ownable(msg.sender) {}

    // ═══════════════════════════════════════════════════════════════
    // CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Create a new insurance policy with encrypted premium and coverage
     * @param policyType Type of insurance (Health/Property/Life/Cyber)
     * @param encryptedPremium Encrypted monthly premium amount
     * @param encryptedCoverageAmount Encrypted max coverage amount
     * @param premiumProof Proof for encrypted premium
     * @param coverageProof Proof for encrypted coverage
     * @param durationMonths Policy duration in months
     * @return policyId The newly created policy ID
     */
    function createPolicy(
        PolicyType policyType,
        externalEuint64 encryptedPremium,
        externalEuint64 encryptedCoverageAmount,
        bytes calldata premiumProof,
        bytes calldata coverageProof,
        uint64 durationMonths
    ) external nonReentrant returns (uint256) {
        if (uint8(policyType) > uint8(PolicyType.Cyber)) revert InvalidPolicyType();
        if (durationMonths == 0) revert InvalidDates();

        // Convert external encrypted inputs to euint64 with proof verification
        euint64 premium = FHE.fromExternal(encryptedPremium, premiumProof);
        euint64 coverage = FHE.fromExternal(encryptedCoverageAmount, coverageProof);

        // Setup ACL permissions
        FHE.allow(premium, msg.sender);
        FHE.allowThis(premium);
        FHE.allow(coverage, msg.sender);
        FHE.allowThis(coverage);

        // Create policy
        uint256 policyId = policyCounter++;
        uint64 startDate = uint64(block.timestamp);
        uint64 endDate = startDate + (durationMonths * 30 days);

        policies[policyId] = Policy({
            policyId: policyId,
            policyholder: msg.sender,
            policyType: policyType,
            status: PolicyStatus.Active,
            encryptedPremium: premium,
            encryptedCoverageAmount: coverage,
            startDate: startDate,
            endDate: endDate,
            createdAt: uint64(block.timestamp),
            exists: true
        });

        userPolicies[msg.sender].push(policyId);
        policyTypeCount[policyType]++;

        emit PolicyCreated(policyId, msg.sender, policyType, startDate, endDate);

        return policyId;
    }

    /**
     * @notice Renew an existing policy
     * @param policyId Policy to renew
     * @param additionalMonths Months to extend
     */
    function renewPolicy(
        uint256 policyId,
        uint64 additionalMonths
    ) external nonReentrant {
        Policy storage policy = policies[policyId];
        if (!policy.exists) revert PolicyNotFound();
        if (policy.policyholder != msg.sender) revert Unauthorized();
        if (additionalMonths == 0) revert InvalidDates();

        uint64 newEndDate = policy.endDate + (additionalMonths * 30 days);
        policy.endDate = newEndDate;

        if (policy.status == PolicyStatus.Expired) {
            policy.status = PolicyStatus.Active;
        }

        emit PolicyRenewed(policyId, newEndDate);
    }

    /**
     * @notice Update policy status
     * @param policyId Policy to update
     * @param newStatus New status
     */
    function updatePolicyStatus(
        uint256 policyId,
        PolicyStatus newStatus
    ) external {
        Policy storage policy = policies[policyId];
        if (!policy.exists) revert PolicyNotFound();
        if (policy.policyholder != msg.sender && msg.sender != owner()) revert Unauthorized();

        PolicyStatus oldStatus = policy.status;
        policy.status = newStatus;

        emit PolicyStatusChanged(policyId, oldStatus, newStatus);
    }

    /**
     * @notice Check if policy is active and valid
     * @param policyId Policy to check
     * @return bool True if policy is active and not expired
     */
    function isPolicyActive(uint256 policyId) external view returns (bool) {
        Policy storage policy = policies[policyId];
        if (!policy.exists) return false;
        if (policy.status != PolicyStatus.Active) return false;
        if (block.timestamp > policy.endDate) return false;
        return true;
    }

    /**
     * @notice Get encrypted premium for a policy
     * @param policyId Policy ID
     * @return euint64 Encrypted premium amount
     */
    function getPolicyPremium(uint256 policyId) external view returns (euint64) {
        Policy storage policy = policies[policyId];
        if (!policy.exists) revert PolicyNotFound();
        if (policy.policyholder != msg.sender && msg.sender != owner()) revert Unauthorized();

        return policy.encryptedPremium;
    }

    /**
     * @notice Get encrypted coverage for a policy
     * @param policyId Policy ID
     * @return euint64 Encrypted coverage amount
     */
    function getPolicyCoverage(uint256 policyId) external view returns (euint64) {
        Policy storage policy = policies[policyId];
        if (!policy.exists) revert PolicyNotFound();
        if (policy.policyholder != msg.sender && msg.sender != owner()) revert Unauthorized();

        return policy.encryptedCoverageAmount;
    }

    /**
     * @notice Get user's policy IDs
     * @param user Address to query
     * @return uint256[] Array of policy IDs
     */
    function getUserPolicies(address user) external view returns (uint256[] memory) {
        return userPolicies[user];
    }

    /**
     * @notice Get policy details (non-sensitive data)
     * @param policyId Policy ID
     * @return policyholder Owner address
     * @return policyType Type of insurance
     * @return status Current status
     * @return startDate Start timestamp
     * @return endDate End timestamp
     */
    function getPolicyDetails(uint256 policyId)
        external
        view
        returns (
            address policyholder,
            PolicyType policyType,
            PolicyStatus status,
            uint64 startDate,
            uint64 endDate
        )
    {
        Policy storage policy = policies[policyId];
        if (!policy.exists) revert PolicyNotFound();

        return (
            policy.policyholder,
            policy.policyType,
            policy.status,
            policy.startDate,
            policy.endDate
        );
    }

    /**
     * @notice Get total count of policies by type
     * @param policyType Type to query
     * @return uint256 Count of policies
     */
    function getPolicyTypeCount(PolicyType policyType) external view returns (uint256) {
        return policyTypeCount[policyType];
    }
}
