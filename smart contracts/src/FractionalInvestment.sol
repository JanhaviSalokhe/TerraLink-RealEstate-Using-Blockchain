// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PropertyNFT} from "./PropertyNFT.sol";

contract FractionalInvestment is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    uint256 private constant ACC_PRECISION = 1e18;

    struct InvestmentPool {
        uint256 propertyId;
        uint256 targetAmount;
        uint256 totalRaised;
        bool active;
    }

    error NotTokenOwner();
    error PoolExists();
    error PoolNotActive();
    error InvalidAmount();
    error Overfunding();
    error NoContribution();
    error NoPayoutAvailable();
    error InvalidPropertyState();

    PropertyNFT public immutable propertyNFT;
    IERC20 public immutable paymentToken;

    mapping(uint256 propertyId => InvestmentPool pool) private _pools;
    mapping(uint256 propertyId => mapping(address investor => uint256 amount)) public contributions;
    mapping(uint256 propertyId => mapping(address investor => uint256 amount)) public payoutHistory;
    mapping(uint256 propertyId => mapping(address investor => uint256 debt)) private _rewardDebt;
    mapping(uint256 propertyId => uint256 accIncomePerShare) private _accIncomePerShare;
    mapping(uint256 propertyId => address[] contributors) private _contributors;
    mapping(uint256 propertyId => mapping(address investor => bool added)) private _isContributor;

    event FractionalInvestmentEnabled(uint256 indexed propertyId, address indexed owner, uint256 targetAmount);
    event Invested(uint256 indexed propertyId, address indexed investor, uint256 amount);
    event RentalIncomeDeposited(uint256 indexed propertyId, address indexed depositor, uint256 amount);
    event RentalIncomeDistributed(uint256 indexed propertyId, address indexed investor, uint256 amount);

    constructor(PropertyNFT propertyNFT_, IERC20 paymentToken_) Ownable(msg.sender) {
        propertyNFT = propertyNFT_;
        paymentToken = paymentToken_;
    }

    function enableFractionalInvestment(uint256 propertyId, uint256 targetAmount) external nonReentrant {
        if (propertyNFT.ownerOf(propertyId) != msg.sender) revert NotTokenOwner();
        if (targetAmount == 0) revert InvalidAmount();
        if (_pools[propertyId].active) revert PoolExists();
        if (propertyNFT.propertyState(propertyId) != PropertyNFT.PropertyState.REGISTERED) revert InvalidPropertyState();

        _pools[propertyId] = InvestmentPool({
            propertyId: propertyId,
            targetAmount: targetAmount,
            totalRaised: 0,
            active: true
        });

        propertyNFT.updatePropertyState(propertyId, PropertyNFT.PropertyState.RENTED_FRACTIONAL);
        emit FractionalInvestmentEnabled(propertyId, msg.sender, targetAmount);
    }

    function investInProperty(uint256 propertyId, uint256 amount) external nonReentrant {
        InvestmentPool storage pool = _requireActivePool(propertyId);
        if (amount == 0) revert InvalidAmount();
        if (pool.totalRaised + amount > pool.targetAmount) revert Overfunding();

        _claim(propertyId, msg.sender);

        if (!_isContributor[propertyId][msg.sender]) {
            _isContributor[propertyId][msg.sender] = true;
            _contributors[propertyId].push(msg.sender);
        }

        pool.totalRaised += amount;
        contributions[propertyId][msg.sender] += amount;
        _rewardDebt[propertyId][msg.sender] =
            contributions[propertyId][msg.sender] * _accIncomePerShare[propertyId] / ACC_PRECISION;

        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Invested(propertyId, msg.sender, amount);
    }

    function depositRentalIncome(uint256 propertyId, uint256 amount) external nonReentrant {
        InvestmentPool storage pool = _requireActivePool(propertyId);
        if (amount == 0) revert InvalidAmount();
        if (pool.totalRaised == 0) revert NoContribution();

        _accIncomePerShare[propertyId] += amount * ACC_PRECISION / pool.totalRaised;
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);

        emit RentalIncomeDeposited(propertyId, msg.sender, amount);
    }

    function distributeRentalIncome(uint256 propertyId) external nonReentrant {
        uint256 payout = _claim(propertyId, msg.sender);
        if (payout == 0) revert NoPayoutAvailable();
    }

    function getInvestorShare(uint256 propertyId, address investor) external view returns (uint256 shareWad) {
        InvestmentPool memory pool = _pools[propertyId];
        if (pool.totalRaised == 0) return 0;
        return contributions[propertyId][investor] * ACC_PRECISION / pool.totalRaised;
    }

    function pendingPayout(uint256 propertyId, address investor) external view returns (uint256) {
        return _pending(propertyId, investor);
    }

    function getInvestmentPool(uint256 propertyId) external view returns (InvestmentPool memory) {
        return _pools[propertyId];
    }

    function getContributors(uint256 propertyId) external view returns (address[] memory) {
        return _contributors[propertyId];
    }

    function _claim(uint256 propertyId, address investor) internal returns (uint256 payout) {
        payout = _pending(propertyId, investor);
        uint256 contributed = contributions[propertyId][investor];
        _rewardDebt[propertyId][investor] = contributed * _accIncomePerShare[propertyId] / ACC_PRECISION;

        if (payout != 0) {
            payoutHistory[propertyId][investor] += payout;
            paymentToken.safeTransfer(investor, payout);
            emit RentalIncomeDistributed(propertyId, investor, payout);
        }
    }

    function _pending(uint256 propertyId, address investor) internal view returns (uint256) {
        uint256 contributed = contributions[propertyId][investor];
        if (contributed == 0) return 0;

        uint256 accumulated = contributed * _accIncomePerShare[propertyId] / ACC_PRECISION;
        return accumulated - _rewardDebt[propertyId][investor];
    }

    function _requireActivePool(uint256 propertyId) internal view returns (InvestmentPool storage pool) {
        pool = _pools[propertyId];
        if (!pool.active) revert PoolNotActive();
    }
}
