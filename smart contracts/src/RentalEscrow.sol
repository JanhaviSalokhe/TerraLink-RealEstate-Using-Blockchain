// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PropertyNFT} from "./PropertyNFT.sol";

contract RentalEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    uint256 public constant RENT_PERIOD = 30 days;

    struct RentalAgreement {
        uint256 propertyId;
        address owner;
        address tenant;
        uint256 rentAmount;
        uint256 securityDeposit;
        uint256 depositBalance;
        uint256 nextPaymentDue;
        uint256 duration;
        uint256 startedAt;
        bool active;
    }

    error NotTokenOwner();
    error NotAgreementOwner();
    error NotTenant();
    error AgreementExists();
    error AgreementNotFound();
    error AgreementAlreadyActive();
    error AgreementNotActive();
    error InvalidAmount();
    error InvalidDuration();
    error RentNotLate();
    error RentalStillRunning();
    error InvalidPropertyState();
    error Unauthorized();

    PropertyNFT public immutable propertyNFT;
    IERC20 public immutable paymentToken;

    mapping(uint256 propertyId => RentalAgreement agreement) private _agreements;

    event RentalAgreementCreated(uint256 indexed propertyId, address indexed owner, address indexed tenant);
    event RentalAgreementAccepted(uint256 indexed propertyId, address indexed tenant, uint256 paid);
    event RentPaid(uint256 indexed propertyId, address indexed tenant, uint256 amount, uint256 nextPaymentDue);
    event DepositDeducted(uint256 indexed propertyId, uint256 amount, uint256 remainingDeposit);
    event RentalTerminated(uint256 indexed propertyId, address indexed tenant, uint256 refundedDeposit);
    event DepositRefunded(uint256 indexed propertyId, address indexed tenant, uint256 amount);

    constructor(PropertyNFT propertyNFT_, IERC20 paymentToken_) Ownable(msg.sender) {
        propertyNFT = propertyNFT_;
        paymentToken = paymentToken_;
    }

    function createRentalAgreement(
        uint256 propertyId,
        address tenant,
        uint256 rentAmount,
        uint256 securityDeposit,
        uint256 duration
    ) external nonReentrant {
        if (propertyNFT.ownerOf(propertyId) != msg.sender) revert NotTokenOwner();
        if (_agreements[propertyId].owner != address(0)) revert AgreementExists();
        if (rentAmount == 0 || securityDeposit == 0) revert InvalidAmount();
        if (duration == 0) revert InvalidDuration();
        if (propertyNFT.propertyState(propertyId) != PropertyNFT.PropertyState.REGISTERED) revert InvalidPropertyState();

        _agreements[propertyId] = RentalAgreement({
            propertyId: propertyId,
            owner: msg.sender,
            tenant: tenant,
            rentAmount: rentAmount,
            securityDeposit: securityDeposit,
            depositBalance: 0,
            nextPaymentDue: 0,
            duration: duration,
            startedAt: 0,
            active: false
        });

        propertyNFT.updatePropertyState(propertyId, PropertyNFT.PropertyState.RENTED_PRIVATE);
        emit RentalAgreementCreated(propertyId, msg.sender, tenant);
    }

    function acceptRentalAgreement(uint256 propertyId) external nonReentrant {
        RentalAgreement storage agreement = _agreements[propertyId];
        if (agreement.owner == address(0)) revert AgreementNotFound();
        if (agreement.active) revert AgreementAlreadyActive();
        if (agreement.tenant != address(0) && agreement.tenant != msg.sender) revert NotTenant();

        uint256 totalDue = agreement.rentAmount + agreement.securityDeposit;
        agreement.tenant = msg.sender;
        agreement.depositBalance = agreement.securityDeposit;
        agreement.startedAt = block.timestamp;
        agreement.nextPaymentDue = block.timestamp + RENT_PERIOD;
        agreement.active = true;

        paymentToken.safeTransferFrom(msg.sender, address(this), totalDue);
        paymentToken.safeTransfer(agreement.owner, agreement.rentAmount);

        emit RentalAgreementAccepted(propertyId, msg.sender, totalDue);
    }

    function payRent(uint256 propertyId) external nonReentrant {
        RentalAgreement storage agreement = _requireActiveAgreement(propertyId);
        if (agreement.tenant != msg.sender) revert NotTenant();

        agreement.nextPaymentDue += RENT_PERIOD;
        paymentToken.safeTransferFrom(msg.sender, agreement.owner, agreement.rentAmount);

        emit RentPaid(propertyId, msg.sender, agreement.rentAmount, agreement.nextPaymentDue);
    }

    function deductFromDeposit(uint256 propertyId) external nonReentrant {
        RentalAgreement storage agreement = _requireActiveAgreement(propertyId);
        if (agreement.owner != msg.sender && owner() != msg.sender) revert Unauthorized();
        if (block.timestamp <= agreement.nextPaymentDue) revert RentNotLate();

        uint256 deduction = agreement.rentAmount;
        if (deduction > agreement.depositBalance) deduction = agreement.depositBalance;

        agreement.depositBalance -= deduction;
        agreement.nextPaymentDue += RENT_PERIOD;
        paymentToken.safeTransfer(agreement.owner, deduction);

        emit DepositDeducted(propertyId, deduction, agreement.depositBalance);
    }

    function terminateRental(uint256 propertyId) external nonReentrant {
        RentalAgreement storage agreement = _requireActiveAgreement(propertyId);
        if (msg.sender != agreement.owner && msg.sender != agreement.tenant && msg.sender != owner()) revert Unauthorized();

        uint256 refund = agreement.depositBalance;
        address tenant = agreement.tenant;

        _clearAgreement(propertyId);
        if (refund != 0) paymentToken.safeTransfer(tenant, refund);

        emit RentalTerminated(propertyId, tenant, refund);
    }

    function refundDeposit(uint256 propertyId) external nonReentrant {
        RentalAgreement storage agreement = _requireActiveAgreement(propertyId);
        if (msg.sender != agreement.owner && msg.sender != agreement.tenant && msg.sender != owner()) revert Unauthorized();
        if (block.timestamp < agreement.startedAt + agreement.duration) revert RentalStillRunning();

        uint256 refund = agreement.depositBalance;
        address tenant = agreement.tenant;

        _clearAgreement(propertyId);
        if (refund != 0) paymentToken.safeTransfer(tenant, refund);

        emit DepositRefunded(propertyId, tenant, refund);
    }

    function getRentalAgreement(uint256 propertyId) external view returns (RentalAgreement memory) {
        return _agreements[propertyId];
    }

    function _requireActiveAgreement(uint256 propertyId) internal view returns (RentalAgreement storage agreement) {
        agreement = _agreements[propertyId];
        if (agreement.owner == address(0)) revert AgreementNotFound();
        if (!agreement.active) revert AgreementNotActive();
    }

    function _clearAgreement(uint256 propertyId) internal {
        delete _agreements[propertyId];
        propertyNFT.updatePropertyState(propertyId, PropertyNFT.PropertyState.REGISTERED);
    }
}
