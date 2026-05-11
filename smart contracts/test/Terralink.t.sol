// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PropertyNFT} from "../src/PropertyNFT.sol";
import {Marketplace} from "../src/Marketplace.sol";
import {RentalEscrow} from "../src/RentalEscrow.sol";
import {FractionalInvestment} from "../src/FractionalInvestment.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract TerralinkTest is Test {
    MockUSDT internal usdt;
    PropertyNFT internal propertyNFT;
    Marketplace internal marketplace;
    RentalEscrow internal rentalEscrow;
    FractionalInvestment internal fractionalInvestment;

    address internal owner = address(0xA11CE);
    address internal buyer = address(0xB0B);
    address internal tenant = address(0xCAFE);
    address internal investorA = address(0xD00D);
    address internal investorB = address(0xBEEF);

    uint256 internal constant ONE_USDT = 1e6;

    function setUp() public {
        usdt = new MockUSDT();
        propertyNFT = new PropertyNFT();
        marketplace = new Marketplace(propertyNFT, usdt);
        rentalEscrow = new RentalEscrow(propertyNFT, usdt);
        fractionalInvestment = new FractionalInvestment(propertyNFT, usdt);

        propertyNFT.setAuthorizedOperator(address(marketplace), true);
        propertyNFT.setAuthorizedOperator(address(rentalEscrow), true);
        propertyNFT.setAuthorizedOperator(address(fractionalInvestment), true);

        usdt.mint(buyer, 1_000_000 * ONE_USDT);
        usdt.mint(tenant, 1_000_000 * ONE_USDT);
        usdt.mint(investorA, 1_000_000 * ONE_USDT);
        usdt.mint(investorB, 1_000_000 * ONE_USDT);
        usdt.mint(owner, 1_000_000 * ONE_USDT);
    }

    function testMarketplaceSaleTransfersPaymentAndNFT() public {
        uint256 tokenId = _register(owner);
        uint256 price = 250_000 * ONE_USDT;

        vm.prank(owner);
        marketplace.listProperty(tokenId, price);

        vm.startPrank(buyer);
        usdt.approve(address(marketplace), price);
        marketplace.buyProperty(tokenId);
        vm.stopPrank();

        assertEq(propertyNFT.ownerOf(tokenId), buyer);
        assertEq(usdt.balanceOf(owner), 1_250_000 * ONE_USDT);
        assertEq(uint256(propertyNFT.propertyState(tokenId)), uint256(PropertyNFT.PropertyState.REGISTERED));
    }

    function testRentalEscrowDeductsMissedRentFromDeposit() public {
        uint256 tokenId = _register(owner);
        uint256 rent = 100 * ONE_USDT;
        uint256 deposit = 300 * ONE_USDT;

        vm.prank(owner);
        rentalEscrow.createRentalAgreement(tokenId, tenant, rent, deposit, 90 days);

        vm.startPrank(tenant);
        usdt.approve(address(rentalEscrow), rent + deposit);
        rentalEscrow.acceptRentalAgreement(tokenId);
        vm.stopPrank();

        vm.warp(block.timestamp + 31 days);

        vm.prank(owner);
        rentalEscrow.deductFromDeposit(tokenId);

        RentalEscrow.RentalAgreement memory agreement = rentalEscrow.getRentalAgreement(tokenId);
        assertEq(agreement.depositBalance, 200 * ONE_USDT);
        assertEq(usdt.balanceOf(owner), 1_000_200 * ONE_USDT);
    }

    function testFractionalInvestmentDistributesRentalIncomeByContribution() public {
        uint256 tokenId = _register(owner);
        uint256 target = 1_000 * ONE_USDT;

        vm.prank(owner);
        fractionalInvestment.enableFractionalInvestment(tokenId, target);

        vm.startPrank(investorA);
        usdt.approve(address(fractionalInvestment), 250 * ONE_USDT);
        fractionalInvestment.investInProperty(tokenId, 250 * ONE_USDT);
        vm.stopPrank();

        vm.startPrank(investorB);
        usdt.approve(address(fractionalInvestment), 750 * ONE_USDT);
        fractionalInvestment.investInProperty(tokenId, 750 * ONE_USDT);
        vm.stopPrank();

        vm.startPrank(owner);
        usdt.approve(address(fractionalInvestment), 400 * ONE_USDT);
        fractionalInvestment.depositRentalIncome(tokenId, 400 * ONE_USDT);
        vm.stopPrank();

        vm.prank(investorA);
        fractionalInvestment.distributeRentalIncome(tokenId);
        vm.prank(investorB);
        fractionalInvestment.distributeRentalIncome(tokenId);

        assertEq(fractionalInvestment.payoutHistory(tokenId, investorA), 100 * ONE_USDT);
        assertEq(fractionalInvestment.payoutHistory(tokenId, investorB), 300 * ONE_USDT);
    }

    function _register(address registrant) internal returns (uint256 tokenId) {
        vm.prank(registrant);
        tokenId = propertyNFT.registerProperty("ipfs://property");
    }
}
