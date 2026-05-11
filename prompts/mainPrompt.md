```text
I want to build a decentralized Web3 real-estate ownership and rental protocol focused specifically on:

1. Instant property ownership transfer
2. Decentralized property marketplace
3. Rental escrow system
4. Fractional rental investment and automated yield distribution

The architecture should remain clean, modular, scalable, and production-grade while avoiding unnecessary complexity such as governance systems, DAO systems, KYC, legal verification, or ERC20 fractional tokenization per property.

The protocol should demonstrate how blockchain can reduce the traditional 5–6 month property ownership transfer process into an instant on-chain settlement system.

==================================================
TECH STACK
==================================================

Frontend:
- React
- Vite
- TailwindCSS
- React Router
- Wagmi
- Viem
- RainbowKit

Blockchain:
- Solidity
- Foundry
- OpenZeppelin
- Sepolia Testnet

Storage:
- IPFS (Pinata)

Payments:
- Mock USDT/USDC ERC20 token on Sepolia

==================================================
CORE CONCEPT
==================================================

Each property is represented as an ERC721 NFT.

The NFT represents:
- full ownership of the property
- authority over listing/renting/fractionalization

Ownership transfer should occur instantly on-chain through smart contracts.

The protocol should support:
- direct property buying/selling
- rental agreements
- rental deposits
- automated late-payment deductions
- fractional investment participation
- automatic proportional rental income distribution

==================================================
IMPORTANT DESIGN RULES
==================================================

1. Registration DOES NOT automatically list property for sale.

2. Property owner fully controls:
- sale
- resale
- rental mode
- fractional rental mode

3. Fractional investors DO NOT receive NFT ownership.

Fractional investors only receive:
- economic participation
- proportional rental yield

The NFT owner remains the sole protocol controller.

4. A property can only be in ONE active mode at a time:
- idle
- listed for sale
- rented privately
- rented fractionally

5. Use ERC20 stablecoin payments only.
Avoid ETH-based rent calculations.

==================================================
SYSTEM OVERVIEW
==================================================

The protocol should contain FOUR major smart contracts:

1. PropertyNFT.sol
2. Marketplace.sol
3. FractionalInvestment.sol
4. RentalEscrow.sol

Each contract should be modular and independent.

==================================================
PROPERTY LIFECYCLE
==================================================

STEP 1 → PROPERTY REGISTRATION

Owner:
- connects wallet
- uploads property metadata/images
- metadata stored on IPFS
- ERC721 property NFT minted

The property should initially:
- belong only to owner dashboard
- NOT appear publicly on marketplace

Initial property state:
- REGISTERED

==================================================
STEP 2 → PROPERTY LISTING
==================================================

Owner may optionally:
- list property for sale
- set custom sale price
- delist anytime
- update price anytime

Marketplace contract should:
- verify NFT ownership
- store listing data
- expose active listings

When listed:
- property becomes visible publicly

Property state:
- LISTED_FOR_SALE

==================================================
STEP 3 → FULL PROPERTY PURCHASE
==================================================

Example:
- A lists property for 10,000 USDT
- B purchases property

Flow:
1. Verify listing active
2. Verify buyer balance
3. Transfer USDT from buyer to seller
4. Transfer NFT ownership from seller to buyer
5. Remove listing automatically
6. Update owner

Final state:
- Owner becomes B
- Listing removed

Ownership transfer must occur atomically.

==================================================
STEP 4 → NEW OWNER OPTIONS
==================================================

After purchase, new owner can choose:

OPTION A → RESALE
- relist property
- set new custom price

OPTION B → PRIVATE RENTAL
- rent property directly
- receive 100% rent income

OPTION C → FRACTIONAL RENTAL
- allow investors to participate
- distribute rental income proportionally

==================================================
PROPERTY STATES
==================================================

Use enum property states:

enum PropertyState {
    REGISTERED,
    LISTED_FOR_SALE,
    RENTED_PRIVATE,
    RENTED_FRACTIONAL
}

A property can never exist in multiple states simultaneously.

==================================================
PROPERTYNFT.SOL REQUIREMENTS
==================================================

This contract handles:
- property registration
- ERC721 ownership
- metadata storage
- ownership transfers

Use:
- ERC721URIStorage
- Ownable
- OpenZeppelin libraries

Store:
- tokenId
- metadata URI
- creator
- current owner
- timestamps
- property state

Functions:
- registerProperty()
- getProperty()
- updatePropertyState()
- transferPropertyOwnership()

Events:
- PropertyRegistered
- PropertyTransferred
- PropertyStateChanged

==================================================
MARKETPLACE.SOL REQUIREMENTS
==================================================

Handles:
- property sale listings
- buying/selling
- resale

Use:
- ReentrancyGuard
- Ownable

Listing structure:

struct Listing {
    uint256 tokenId;
    address seller;
    uint256 price;
    bool active;
    uint256 listedAt;
}

Functions:
- listProperty()
- buyProperty()
- cancelListing()
- updateListingPrice()
- getListing()
- getActiveListings()

Requirements:
- only NFT owner can list
- prevent double listings
- automatic listing removal after sale
- atomic NFT + payment transfer

Events:
- PropertyListed
- PropertySold
- PropertyDelisted
- ListingPriceUpdated

==================================================
PRIVATE RENTAL SYSTEM
==================================================

Owner can enable private rental mode.

Owner sets:
- rent amount
- security deposit
- rent duration

Tenant dashboard required.

==================================================
RENTAL ESCROW FLOW
==================================================

STEP 1
Owner lists property for rent.

STEP 2
Tenant accepts rental agreement.

STEP 3
Tenant deposits:
- first rent payment
- security deposit

Example:
- rent = 100 USDT
- deposit = 300 USDT

Tenant pays:
400 USDT total.

==================================================
DEPOSIT LOGIC
==================================================

Deposit remains locked in escrow contract.

If tenant pays rent on time:
- deposit untouched

If tenant misses payment:
- unpaid rent deducted automatically from deposit

Formula:

Remaining Deposit = Current Deposit - Missed Rent

If rental ends without dues:
- remaining deposit refunded automatically

==================================================
RENTALESCROW.SOL REQUIREMENTS
==================================================

Handles:
- rental agreements
- deposits
- rent payments
- late payment deductions
- refunds

Structure:

struct RentalAgreement {
    uint256 propertyId;
    address owner;
    address tenant;

    uint256 rentAmount;
    uint256 securityDeposit;
    uint256 depositBalance;

    uint256 nextPaymentDue;
    uint256 duration;

    bool active;
}

Functions:
- createRentalAgreement()
- acceptRentalAgreement()
- payRent()
- deductFromDeposit()
- terminateRental()
- refundDeposit()

Requirements:
- automatic overdue checks
- escrow logic
- deposit balance tracking
- secure ERC20 transfers

Events:
- RentalCreated
- RentPaid
- DepositDeducted
- RentalTerminated
- DepositRefunded

==================================================
FRACTIONAL RENTAL SYSTEM
==================================================

IMPORTANT:
Do NOT use ERC20 fractional ownership tokens.

Instead:
- track direct proportional investments internally

Fractional investors should:
- invest stablecoins directly
- receive proportional rental yield

They DO NOT receive:
- NFT ownership
- governance
- transfer authority

==================================================
FRACTIONAL INVESTMENT FLOW
==================================================

Example:

Property Value:
10,000 USDT

Owner enables:
- fractional rental mode

Sets:
- target raise amount
- minimum investment

Investors contribute directly.

Example:
Investor C contributes 100 USDT.

Ownership share calculated dynamically:

Ownership Share =
Investor Contribution / Total Contributions

==================================================
RENT DISTRIBUTION FLOW
==================================================

When rental income is deposited:

Contract automatically distributes rent proportionally.

Formula:

Investor Payout =
(Investor Contribution / Total Contributions)
× Rental Income

Funds transferred directly to investor wallets automatically.

==================================================
FRACTIONALINVESTMENT.SOL REQUIREMENTS
==================================================

Handles:
- investor participation
- contribution tracking
- ownership percentage calculations
- rental income distribution

Structure:

struct InvestmentPool {
    uint256 propertyId;

    uint256 targetAmount;
    uint256 totalRaised;

    bool active;
}

Mappings:
- investor contributions
- investor payout history

Functions:
- enableFractionalInvestment()
- investInProperty()
- depositRentalIncome()
- distributeRentalIncome()
- getInvestorShare()

Requirements:
- proportional calculations
- automatic payouts
- secure ERC20 handling
- prevent overfunding
- track all contributors

Events:
- FractionalInvestmentEnabled
- InvestorParticipated
- RentalIncomeDeposited
- RentalYieldDistributed

==================================================
IMPORTANT BUSINESS LOGIC
==================================================

1. NFT owner always remains protocol controller.

2. Fractional investors only receive rental rights.

3. Rent distribution must be automatic.

4. Only owner can:
- resell
- delist
- change rental mode

5. Rental property cannot simultaneously be:
- listed for sale
- privately rented
- fractionally rented

==================================================
SECURITY REQUIREMENTS
==================================================

Implement:
- Reentrancy protection
- Access control
- Ownership verification
- CEI pattern
- Secure ERC20 transfers
- Input validation
- Overflow-safe math
- Prevent duplicate listings
- Prevent invalid state transitions

==================================================
FOUNDARY REQUIREMENTS
==================================================

Generate:
- Foundry-compatible contracts
- deployment scripts
- constructor setup
- forge tests
- mock USDT token
- Sepolia deployment scripts

==================================================
DEPLOYMENT REQUIREMENTS
==================================================

Include:
- Foundry deployment workflow
- environment variable setup
- Sepolia configuration
- contract interaction examples

==================================================
IMPORTANT FINAL GOAL
==================================================

The final protocol should demonstrate:

1. Instant blockchain-based ownership transfer
2. Decentralized property sales
3. Rental escrow automation
4. Security deposit enforcement
5. Fractional rental investing
6. Automated rental income distribution

while remaining:
- minimal
- realistic
- modular
- scalable
- technically clean
- easy to demonstrate as an MVP
```


```text id="5fdh1u"
ADDITIONAL SMART CONTRACT REQUIREMENTS

==================================================
OPENZEPPELIN SECURITY REQUIREMENTS
==================================================

Use OpenZeppelin contracts and security standards throughout the protocol to ensure:
- production-grade security
- battle-tested implementations
- gas optimization
- safe token handling
- upgradeable architecture compatibility (optional future support)

Mandatory OpenZeppelin usage:

PropertyNFT.sol:
- ERC721URIStorage
- Ownable

Marketplace.sol:
- ReentrancyGuard
- Ownable
- SafeERC20

RentalEscrow.sol:
- ReentrancyGuard
- SafeERC20
- Ownable

FractionalInvestment.sol:
- ReentrancyGuard
- SafeERC20
- Ownable

Use latest stable OpenZeppelin contracts.

==================================================
SECURITY REQUIREMENTS
==================================================

Implement proper security architecture including:

1. Reentrancy Protection
- Protect all payment functions
- Use nonReentrant modifier

2. Access Control
- Only NFT owner can:
  - list property
  - delist property
  - enable rentals
  - enable fractional investment

3. Checks-Effects-Interactions Pattern
- Update state BEFORE external calls

4. Safe ERC20 Transfers
- Use SafeERC20 for:
  - USDT/USDC transfers
  - rental payouts
  - deposits
  - refunds

5. Ownership Verification
- Verify NFT ownership before any privileged action

6. Input Validation
- prevent zero-value listings
- prevent invalid rent values
- prevent invalid state transitions

7. Escrow Safety
- deposits must remain locked securely
- prevent unauthorized withdrawals

8. Fractional Investment Protection
- prevent overfunding
- prevent duplicate invalid contributions
- validate proportional calculations

9. Atomic Transactions
- NFT transfer and payment transfer must occur atomically

10. State Validation
Prevent impossible states such as:
- listed + rented simultaneously
- sold while rented
- fractional mode without active rental

==================================================
GAS OPTIMIZATION REQUIREMENTS
==================================================

Optimize contracts for gas efficiency.

Use:
- calldata instead of memory where possible
- immutable variables
- custom errors instead of require strings
- packed structs
- minimal storage writes
- efficient mappings
- unchecked arithmetic where safe
- event indexing
- avoid unnecessary loops

Avoid:
- redundant storage variables
- nested expensive loops
- unnecessary state updates
- duplicate ownership tracking

==================================================
CUSTOM ERRORS
==================================================

Use Solidity custom errors instead of require strings.

Examples:

error NotPropertyOwner();
error InvalidPropertyState();
error PropertyAlreadyListed();
error InsufficientPayment();
error RentalAlreadyActive();
error InvalidInvestmentAmount();

==================================================
EVENT OPTIMIZATION
==================================================

Index important event fields for efficient frontend querying.

Example:

event PropertyListed(
    uint256 indexed tokenId,
    address indexed seller,
    uint256 price
);

==================================================
SMART CONTRACT ARCHITECTURE GOAL
==================================================

The generated contracts should be:
- modular
- secure
- gas-efficient
- scalable
- production-style
- Foundry compatible
- optimized for Sepolia deployment

The code should resemble real-world protocol architecture standards used in modern Web3 applications.
```
