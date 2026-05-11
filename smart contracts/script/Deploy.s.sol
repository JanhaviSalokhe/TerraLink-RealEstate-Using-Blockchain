// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {PropertyNFT} from "../src/PropertyNFT.sol";
import {Marketplace} from "../src/Marketplace.sol";
import {RentalEscrow} from "../src/RentalEscrow.sol";
import {FractionalInvestment} from "../src/FractionalInvestment.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

contract Deploy is Script {
    function run()
        external
        returns (
            MockUSDT mockUSDT,
            PropertyNFT propertyNFT,
            Marketplace marketplace,
            RentalEscrow rentalEscrow,
            FractionalInvestment fractionalInvestment
        )
    {
        vm.startBroadcast();

        mockUSDT = new MockUSDT();
        propertyNFT = new PropertyNFT();
        marketplace = new Marketplace(propertyNFT, mockUSDT);
        rentalEscrow = new RentalEscrow(propertyNFT, mockUSDT);
        fractionalInvestment = new FractionalInvestment(propertyNFT, mockUSDT);

        propertyNFT.setAuthorizedOperator(address(marketplace), true);
        propertyNFT.setAuthorizedOperator(address(rentalEscrow), true);
        propertyNFT.setAuthorizedOperator(address(fractionalInvestment), true);

        vm.stopBroadcast();
    }
}
