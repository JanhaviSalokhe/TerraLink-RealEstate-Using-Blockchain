// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyNFT is ERC721URIStorage, Ownable {
    enum PropertyState {
        REGISTERED,
        LISTED_FOR_SALE,
        RENTED_PRIVATE,
        RENTED_FRACTIONAL
    }

    struct Property {
        uint256 tokenId;
        address creator;
        uint64 createdAt;
        uint64 updatedAt;
        PropertyState state;
    }

    error EmptyMetadataURI();
    error InvalidTokenId();
    error NotPropertyOperator();
    error InvalidStateTransition(PropertyState fromState, PropertyState toState);
    error ZeroAddress();

    uint256 private _nextTokenId = 1;

    mapping(uint256 tokenId => Property property) private _properties;
    mapping(address operator => bool allowed) public authorizedOperators;

    event PropertyRegistered(
        uint256 indexed tokenId,
        address indexed creator,
        string metadataURI,
        uint256 timestamp
    );
    event PropertyTransferred(uint256 indexed tokenId, address indexed from, address indexed to);
    event PropertyStateChanged(uint256 indexed tokenId, PropertyState indexed oldState, PropertyState indexed newState);
    event OperatorAuthorizationChanged(address indexed operator, bool allowed);

    constructor() ERC721("Terralink Property", "TLAND") Ownable(msg.sender) {}

    function registerProperty(string calldata metadataURI) external returns (uint256 tokenId) {
        if (bytes(metadataURI).length == 0) revert EmptyMetadataURI();

        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        _properties[tokenId] = Property({
            tokenId: tokenId,
            creator: msg.sender,
            createdAt: uint64(block.timestamp),
            updatedAt: uint64(block.timestamp),
            state: PropertyState.REGISTERED
        });

        emit PropertyRegistered(tokenId, msg.sender, metadataURI, block.timestamp);
    }

    function setAuthorizedOperator(address operator, bool allowed) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        authorizedOperators[operator] = allowed;
        emit OperatorAuthorizationChanged(operator, allowed);
    }

    function getProperty(uint256 tokenId) external view returns (Property memory property, string memory metadataURI) {
        _requireExisting(tokenId);
        return (_properties[tokenId], tokenURI(tokenId));
    }

    function propertyState(uint256 tokenId) external view returns (PropertyState) {
        _requireExisting(tokenId);
        return _properties[tokenId].state;
    }

    function updatePropertyState(uint256 tokenId, PropertyState newState) external {
        _requireExisting(tokenId);
        if (!_isPropertyOperator(msg.sender, tokenId)) revert NotPropertyOperator();

        Property storage property = _properties[tokenId];
        PropertyState oldState = property.state;
        _validateStateTransition(oldState, newState);

        if (oldState != newState) {
            property.state = newState;
            property.updatedAt = uint64(block.timestamp);
            emit PropertyStateChanged(tokenId, oldState, newState);
        }
    }

    function transferPropertyOwnership(uint256 tokenId, address to) external {
        _requireExisting(tokenId);
        if (to == address(0)) revert ZeroAddress();
        if (!_isPropertyOperator(msg.sender, tokenId)) revert NotPropertyOperator();

        address from = ownerOf(tokenId);
        Property storage property = _properties[tokenId];
        PropertyState oldState = property.state;

        if (oldState != PropertyState.REGISTERED) {
            property.state = PropertyState.REGISTERED;
            emit PropertyStateChanged(tokenId, oldState, PropertyState.REGISTERED);
        }

        property.updatedAt = uint64(block.timestamp);
        safeTransferFrom(from, to, tokenId);
        emit PropertyTransferred(tokenId, from, to);
    }

    function _isPropertyOperator(address spender, uint256 tokenId) internal view returns (bool) {
        address propertyOwner = ownerOf(tokenId);
        return spender == propertyOwner
            || authorizedOperators[spender]
            || getApproved(tokenId) == spender
            || isApprovedForAll(propertyOwner, spender);
    }

    function _requireExisting(uint256 tokenId) internal view {
        if (_ownerOf(tokenId) == address(0)) revert InvalidTokenId();
    }

    function _validateStateTransition(PropertyState fromState, PropertyState toState) internal pure {
        if (fromState == toState) return;

        bool valid = fromState == PropertyState.REGISTERED
            || toState == PropertyState.REGISTERED;

        if (!valid) revert InvalidStateTransition(fromState, toState);
    }
}
