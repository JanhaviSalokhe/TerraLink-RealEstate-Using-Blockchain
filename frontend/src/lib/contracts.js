export const SEPOLIA_CHAIN_ID = 11155111;

export const contracts = {
  mockUSDT: import.meta.env.VITE_MOCK_USDT_ADDRESS || '0x088DcD9178a4a58786fA3cf18081649a2b29bbb1',
  propertyNFT: import.meta.env.VITE_PROPERTY_NFT_ADDRESS || '0x329192aE8732B222be6505E6DFe1A02400361187',
  marketplace: import.meta.env.VITE_MARKETPLACE_ADDRESS || '0x4dAfAb9a1560Cff8E33e031e8cA240408f069BdB',
  rentalEscrow: import.meta.env.VITE_RENTAL_ESCROW_ADDRESS || '0x4d4C151FF9A040B1Bc9538aaaf563E7d054fB198', //new gas optimized address
  fractionalInvestment: import.meta.env.VITE_FRACTIONAL_ADDRESS || '0xB97D45C1Da9d41E5d9A76ea31c319C2B691d0ef9',
};

export const erc20Abi = [
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
];

export const propertyNftAbi = [
  {
    type: 'event',
    name: 'PropertyRegistered',
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'metadataURI', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'registerProperty',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'metadataURI', type: 'string' }],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getProperty',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      {
        name: 'property',
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'creator', type: 'address' },
          { name: 'createdAt', type: 'uint64' },
          { name: 'updatedAt', type: 'uint64' },
          { name: 'state', type: 'uint8' },
        ],
      },
      { name: 'metadataURI', type: 'string' },
    ],
  },
  {
    type: 'function',
    name: 'ownerOf',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: 'owner', type: 'address' }],
  },
  {
    type: 'function',
    name: 'setApprovalForAll',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'isApprovedForAll',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
];

export const marketplaceAbi = [
  {
    type: 'event',
    name: 'PropertyListed',
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'seller', type: 'address' },
      { indexed: false, name: 'price', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'buyProperty',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'listProperty',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'price', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'cancelListing',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'updateListingPrice',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'newPrice', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getListing',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'seller', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'active', type: 'bool' },
          { name: 'listedAt', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getActiveListings',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        name: 'activeListings',
        type: 'tuple[]',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'seller', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'active', type: 'bool' },
          { name: 'listedAt', type: 'uint256' },
        ],
      },
    ],
  },
];

export const rentalEscrowAbi = [
  {
    type: 'event',
    name: 'RentalAgreementCreated',
    inputs: [
      { indexed: true, name: 'propertyId', type: 'uint256' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: true, name: 'tenant', type: 'address' },
    ],
  },
  {
    type: 'function',
    name: 'createRentalAgreement',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'propertyId', type: 'uint256' },
      { name: 'tenant', type: 'address' },
      { name: 'rentAmount', type: 'uint256' },
      { name: 'securityDeposit', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'acceptRentalAgreement',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'propertyId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'payRent',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'propertyId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'deductFromDeposit',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'propertyId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'terminateRental',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'propertyId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'refundDeposit',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'propertyId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getRentalAgreement',
    stateMutability: 'view',
    inputs: [{ name: 'propertyId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'propertyId', type: 'uint256' },
          { name: 'owner', type: 'address' },
          { name: 'tenant', type: 'address' },
          { name: 'rentAmount', type: 'uint256' },
          { name: 'securityDeposit', type: 'uint256' },
          { name: 'depositBalance', type: 'uint256' },
          { name: 'nextPaymentDue', type: 'uint256' },
          { name: 'duration', type: 'uint256' },
          { name: 'startedAt', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
  },
];

export const fractionalInvestmentAbi = [
  {
    type: 'event',
    name: 'FractionalInvestmentEnabled',
    inputs: [
      { indexed: true, name: 'propertyId', type: 'uint256' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'targetAmount', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'enableFractionalInvestment',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'propertyId', type: 'uint256' },
      { name: 'targetAmount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'investInProperty',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'propertyId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'depositRentalIncome',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'propertyId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'distributeRentalIncome',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'propertyId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getInvestmentPool',
    stateMutability: 'view',
    inputs: [{ name: 'propertyId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'propertyId', type: 'uint256' },
          { name: 'targetAmount', type: 'uint256' },
          { name: 'totalRaised', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getInvestorShare',
    stateMutability: 'view',
    inputs: [
      { name: 'propertyId', type: 'uint256' },
      { name: 'investor', type: 'address' },
    ],
    outputs: [{ name: 'shareWad', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'pendingPayout',
    stateMutability: 'view',
    inputs: [
      { name: 'propertyId', type: 'uint256' },
      { name: 'investor', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'contributions',
    stateMutability: 'view',
    inputs: [
      { name: 'propertyId', type: 'uint256' },
      { name: 'investor', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'payoutHistory',
    stateMutability: 'view',
    inputs: [
      { name: 'propertyId', type: 'uint256' },
      { name: 'investor', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getContributors',
    stateMutability: 'view',
    inputs: [{ name: 'propertyId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address[]' }],
  },
];
