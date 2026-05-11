// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PropertyNFT} from "./PropertyNFT.sol";

contract Marketplace is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
    }

    error NotTokenOwner();
    error NotSeller();
    error InvalidPrice();
    error AlreadyListed();
    error ListingNotActive();
    error InvalidPropertyState();

    PropertyNFT public immutable propertyNFT;
    IERC20 public immutable paymentToken;

    mapping(uint256 tokenId => Listing listing) private _listings;
    uint256[] private _listedTokenIds;

    event PropertyListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event PropertySold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event ListingPriceUpdated(uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);

    constructor(PropertyNFT propertyNFT_, IERC20 paymentToken_) Ownable(msg.sender) {
        propertyNFT = propertyNFT_;
        paymentToken = paymentToken_;
    }

    function listProperty(uint256 tokenId, uint256 price) external nonReentrant {
        if (price == 0) revert InvalidPrice();
        if (propertyNFT.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (_listings[tokenId].active) revert AlreadyListed();
        if (propertyNFT.propertyState(tokenId) != PropertyNFT.PropertyState.REGISTERED) revert InvalidPropertyState();

        _listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            listedAt: block.timestamp
        });
        _listedTokenIds.push(tokenId);

        propertyNFT.updatePropertyState(tokenId, PropertyNFT.PropertyState.LISTED_FOR_SALE);
        emit PropertyListed(tokenId, msg.sender, price);
    }

    function buyProperty(uint256 tokenId) external nonReentrant {
        Listing memory listing = _listings[tokenId];
        if (!listing.active) revert ListingNotActive();
        if (propertyNFT.ownerOf(tokenId) != listing.seller) revert NotTokenOwner();

        delete _listings[tokenId];

        paymentToken.safeTransferFrom(msg.sender, listing.seller, listing.price);
        propertyNFT.transferPropertyOwnership(tokenId, msg.sender);

        emit PropertySold(tokenId, listing.seller, msg.sender, listing.price);
    }

    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing memory listing = _listings[tokenId];
        if (!listing.active) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotSeller();

        delete _listings[tokenId];
        propertyNFT.updatePropertyState(tokenId, PropertyNFT.PropertyState.REGISTERED);

        emit ListingCancelled(tokenId, msg.sender);
    }

    function updateListingPrice(uint256 tokenId, uint256 newPrice) external {
        if (newPrice == 0) revert InvalidPrice();

        Listing storage listing = _listings[tokenId];
        if (!listing.active) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotSeller();

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit ListingPriceUpdated(tokenId, oldPrice, newPrice);
    }

    function getListing(uint256 tokenId) external view returns (Listing memory) {
        return _listings[tokenId];
    }

    function getActiveListings() external view returns (Listing[] memory activeListings) {
        uint256 length = _listedTokenIds.length;
        uint256 activeCount;

        for (uint256 i; i < length; ++i) {
            if (_listings[_listedTokenIds[i]].active) ++activeCount;
        }

        activeListings = new Listing[](activeCount);
        uint256 cursor;

        for (uint256 i; i < length; ++i) {
            Listing memory listing = _listings[_listedTokenIds[i]];
            if (listing.active) activeListings[cursor++] = listing;
        }
    }
}
