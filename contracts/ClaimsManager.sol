// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {externalEuint64} from "encrypted-types/EncryptedTypes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ClaimsManager
 * @notice Handles insurance claim submissions and processing with FHE privacy
 * @dev Claim amounts and sensitive details are encrypted
 * @dev Updated for fhEVM 0.9.1 - uses ZamaEthereumConfig
 */
contract ClaimsManager is ZamaEthereumConfig, Ownable, ReentrancyGuard {
    // ═══════════════════════════════════════════════════════════════
    // ENUMS & STRUCTS
    // ═══════════════════════════════════════════════════════════════

    enum ClaimStatus { Pending, UnderReview, Approved, Rejected, Paid }
    enum ClaimType { Medical, PropertyDamage, LifeEvent, CyberIncident }

    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        ClaimType claimType;
        ClaimStatus status;
        euint64 encryptedClaimAmount;  // Requested claim amount (encrypted)
        euint64 encryptedApprovedAmount; // Approved payout amount (encrypted)
        string description;             // Claim description/reason
        uint64 submittedAt;
        uint64 reviewedAt;
        address reviewer;
        bool exists;
    }

    // ═══════════════════════════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════

    uint256 public claimCounter;

    // claimId => Claim
    mapping(uint256 => Claim) public claims;

    // claimant => claimIds
    mapping(address => uint256[]) public userClaims;

    // policyId => claimIds
    mapping(uint256 => uint256[]) public policyClaims;

    // ClaimStatus => count
    mapping(ClaimStatus => uint256) public claimStatusCount;

    // Reference to PolicyRegistry (set by owner)
    address public policyRegistryAddress;

    // ═══════════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════════

    event ClaimSubmitted(
        uint256 indexed claimId,
        uint256 indexed policyId,
        address indexed claimant,
        ClaimType claimType,
        uint64 timestamp
    );

    event ClaimStatusChanged(
        uint256 indexed claimId,
        ClaimStatus oldStatus,
        ClaimStatus newStatus,
        address reviewer
    );

    event ClaimApproved(
        uint256 indexed claimId,
        uint64 timestamp
    );

    event ClaimPaid(
        uint256 indexed claimId,
        address indexed claimant,
        uint64 timestamp
    );

    // ═══════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════

    error ClaimNotFound();
    error Unauthorized();
    error InvalidClaimType();
    error ClaimAlreadyProcessed();
    error PolicyNotActive();
    error InvalidAmount();

    // ═══════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor() Ownable(msg.sender) {}

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Set PolicyRegistry contract address
     * @param _policyRegistryAddress Address of PolicyRegistry
     */
    function setPolicyRegistry(address _policyRegistryAddress) external onlyOwner {
        policyRegistryAddress = _policyRegistryAddress;
    }

    // ═══════════════════════════════════════════════════════════════
    // CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Submit a new insurance claim with encrypted amount
     * @param policyId Associated policy ID
     * @param claimType Type of claim
     * @param encryptedAmount Encrypted claim amount
     * @param inputProof Proof for encrypted input
     * @param description Claim description/reason
     * @return claimId The newly created claim ID
     */
    function submitClaim(
        uint256 policyId,
        ClaimType claimType,
        externalEuint64 encryptedAmount,
        bytes calldata inputProof,
        string calldata description
    ) external nonReentrant returns (uint256) {
        if (uint8(claimType) > uint8(ClaimType.CyberIncident)) revert InvalidClaimType();

        // TODO: Verify policy is active (requires PolicyRegistry integration)
        // For now, we'll assume policyId is valid

        // Convert encrypted input to euint64 with proof verification (fhEVM 0.9.1 API)
        euint64 claimAmount = FHE.fromExternal(encryptedAmount, inputProof);

        // Setup ACL permissions
        FHE.allow(claimAmount, msg.sender);
        FHE.allowThis(claimAmount);

        // Create claim
        uint256 claimId = claimCounter++;

        claims[claimId] = Claim({
            claimId: claimId,
            policyId: policyId,
            claimant: msg.sender,
            claimType: claimType,
            status: ClaimStatus.Pending,
            encryptedClaimAmount: claimAmount,
            encryptedApprovedAmount: FHE.asEuint64(0), // Initialize as 0
            description: description,
            submittedAt: uint64(block.timestamp),
            reviewedAt: 0,
            reviewer: address(0),
            exists: true
        });

        userClaims[msg.sender].push(claimId);
        policyClaims[policyId].push(claimId);
        claimStatusCount[ClaimStatus.Pending]++;

        emit ClaimSubmitted(claimId, policyId, msg.sender, claimType, uint64(block.timestamp));

        return claimId;
    }

    /**
     * @notice Update claim status (admin/reviewer only)
     * @param claimId Claim to update
     * @param newStatus New status
     */
    function updateClaimStatus(
        uint256 claimId,
        ClaimStatus newStatus
    ) external onlyOwner {
        Claim storage claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();

        ClaimStatus oldStatus = claim.status;

        // Prevent status changes on already processed claims
        if (oldStatus == ClaimStatus.Paid) revert ClaimAlreadyProcessed();

        // Update counts
        claimStatusCount[oldStatus]--;
        claimStatusCount[newStatus]++;

        claim.status = newStatus;
        claim.reviewedAt = uint64(block.timestamp);
        claim.reviewer = msg.sender;

        emit ClaimStatusChanged(claimId, oldStatus, newStatus, msg.sender);
    }

    /**
     * @notice Approve claim with encrypted approved amount
     * @param claimId Claim to approve
     * @param encryptedApprovedAmount Encrypted approved payout amount
     * @param inputProof Proof for encrypted input
     */
    function approveClaim(
        uint256 claimId,
        externalEuint64 encryptedApprovedAmount,
        bytes calldata inputProof
    ) external onlyOwner nonReentrant {
        Claim storage claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();
        if (claim.status != ClaimStatus.UnderReview && claim.status != ClaimStatus.Pending) {
            revert ClaimAlreadyProcessed();
        }

        // Convert approved amount with proof verification (fhEVM 0.9.1 API)
        euint64 approvedAmount = FHE.fromExternal(encryptedApprovedAmount, inputProof);

        // Setup ACL permissions
        FHE.allow(approvedAmount, claim.claimant);
        FHE.allowThis(approvedAmount);

        // Note: Approved amount validation would require Gateway decryption
        // In production, implement off-chain validation of approved <= claimed
        // For now, we trust the admin to approve valid amounts

        claim.encryptedApprovedAmount = approvedAmount;

        ClaimStatus oldStatus = claim.status;
        claim.status = ClaimStatus.Approved;
        claim.reviewedAt = uint64(block.timestamp);
        claim.reviewer = msg.sender;

        claimStatusCount[oldStatus]--;
        claimStatusCount[ClaimStatus.Approved]++;

        emit ClaimApproved(claimId, uint64(block.timestamp));
        emit ClaimStatusChanged(claimId, oldStatus, ClaimStatus.Approved, msg.sender);
    }

    /**
     * @notice Reject a claim
     * @param claimId Claim to reject
     */
    function rejectClaim(uint256 claimId) external onlyOwner {
        Claim storage claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();
        if (claim.status == ClaimStatus.Paid) revert ClaimAlreadyProcessed();

        ClaimStatus oldStatus = claim.status;
        claim.status = ClaimStatus.Rejected;
        claim.reviewedAt = uint64(block.timestamp);
        claim.reviewer = msg.sender;

        claimStatusCount[oldStatus]--;
        claimStatusCount[ClaimStatus.Rejected]++;

        emit ClaimStatusChanged(claimId, oldStatus, ClaimStatus.Rejected, msg.sender);
    }

    /**
     * @notice Mark claim as paid (called by PayoutVault)
     * @param claimId Claim that was paid
     */
    function markClaimPaid(uint256 claimId) external {
        Claim storage claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();
        if (claim.status != ClaimStatus.Approved) revert ClaimAlreadyProcessed();

        // TODO: Verify caller is PayoutVault
        // if (msg.sender != payoutVaultAddress) revert Unauthorized();

        ClaimStatus oldStatus = claim.status;
        claim.status = ClaimStatus.Paid;

        claimStatusCount[oldStatus]--;
        claimStatusCount[ClaimStatus.Paid]++;

        emit ClaimPaid(claimId, claim.claimant, uint64(block.timestamp));
        emit ClaimStatusChanged(claimId, oldStatus, ClaimStatus.Paid, msg.sender);
    }

    // ═══════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Get encrypted claim amount
     * @param claimId Claim ID
     * @return euint64 Encrypted claim amount
     */
    function getClaimAmount(uint256 claimId) external view returns (euint64) {
        Claim storage claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();
        if (claim.claimant != msg.sender && msg.sender != owner()) revert Unauthorized();

        return claim.encryptedClaimAmount;
    }

    /**
     * @notice Get encrypted approved amount
     * @param claimId Claim ID
     * @return euint64 Encrypted approved amount
     */
    function getApprovedAmount(uint256 claimId) external view returns (euint64) {
        Claim storage claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();
        if (claim.claimant != msg.sender && msg.sender != owner()) revert Unauthorized();

        return claim.encryptedApprovedAmount;
    }

    /**
     * @notice Get user's claim IDs
     * @param user Address to query
     * @return uint256[] Array of claim IDs
     */
    function getUserClaims(address user) external view returns (uint256[] memory) {
        return userClaims[user];
    }

    /**
     * @notice Get claims for a specific policy
     * @param policyId Policy ID
     * @return uint256[] Array of claim IDs
     */
    function getPolicyClaims(uint256 policyId) external view returns (uint256[] memory) {
        return policyClaims[policyId];
    }

    /**
     * @notice Get claim details (non-sensitive data)
     * @param claimId Claim ID
     */
    function getClaimDetails(uint256 claimId)
        external
        view
        returns (
            uint256 policyId,
            address claimant,
            ClaimType claimType,
            ClaimStatus status,
            string memory description,
            uint64 submittedAt,
            uint64 reviewedAt,
            address reviewer
        )
    {
        Claim storage claim = claims[claimId];
        if (!claim.exists) revert ClaimNotFound();

        return (
            claim.policyId,
            claim.claimant,
            claim.claimType,
            claim.status,
            claim.description,
            claim.submittedAt,
            claim.reviewedAt,
            claim.reviewer
        );
    }

    /**
     * @notice Get count of claims by status
     * @param status Status to query
     * @return uint256 Count of claims
     */
    function getClaimCountByStatus(ClaimStatus status) external view returns (uint256) {
        return claimStatusCount[status];
    }
}
