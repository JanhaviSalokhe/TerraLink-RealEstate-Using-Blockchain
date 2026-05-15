// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {PropertyNFT} from "../src/PropertyNFT.sol";
import {RentalEscrow} from "../src/RentalEscrow.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployRentalEscrow is Script {
    function run() external returns (RentalEscrow rentalEscrow) {
        address propertyNFT = vm.envAddress("PROPERTY_NFT_ADDRESS");
        address paymentToken = vm.envAddress("MOCK_USDT_ADDRESS");

        vm.startBroadcast();
        rentalEscrow = new RentalEscrow(PropertyNFT(propertyNFT), IERC20(paymentToken));
        vm.stopBroadcast();
    }
}
