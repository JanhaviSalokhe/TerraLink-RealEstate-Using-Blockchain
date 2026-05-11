```text id="l2sqfw"
Generate ONLY Solidity smart contracts for a decentralized Web3 real-estate ownership and rental protocol.

DO NOT generate:
- frontend code
- React code
- UI/UX
- Tailwind
- explanations
- architecture diagrams
- markdown tutorials

ONLY generate:
1. Solidity smart contracts
2. Foundry deployment scripts
3. Foundry tests
4. Mock ERC20 token
5. Contract interfaces if required

==================================================
TECH STACK
==================================================

- Solidity
- Foundry
- OpenZeppelin
- Sepolia Testnet

Payments:
- Mock USDT/USDC ERC20 token

==================================================
SMART CONTRACTS REQUIRED
==================================================

Generate these contracts:

1. PropertyNFT.sol
2. Marketplace.sol
3. RentalEscrow.sol
4. FractionalInvestment.sol
5. MockUSDT.sol

==================================================
CORE CONCEPT
==================================================

Each property is represented as an ERC721 NFT.

NFT represents:
- full ownership
- authority over:
  - sale
  - resale
  - rental mode
  - fractional rental mode

Ownership transfer must occur atomically through smart contracts.

==================================================
PROPERTY STATES
==================================================

Use:

enum PropertyState {
    REGISTERED,
    LISTED_FOR_SALE,
    RENTED_PRIVATE,
    RENTED_FRACTIONAL
}

A property can exist in ONLY ONE state at a time.

==================================================
PROPERTYNFT.SOL
==================================================

Responsibilities:
- property registration
- ERC721 ownership
- metadata storage
- property state tracking

Use:
- ERC721URIStorage
- Ownable

Store:
- tokenId
- metadata URI
- creator
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
MARKETPLACE.SOL
==================================================

Responsibilities:
- property listing
- property buying/selling
- resale support

Use:
- ReentrancyGuard
- Ownable
- SafeERC20

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
- verify NFT ownership
- prevent double listings
- remove listing after sale
- atomic NFT + payment transfer

==================================================
RENTAL ESCROW SYSTEM
==================================================

Owner sets:
- rent amount
- security deposit
- rental duration

Tenant:
- pays first rent + deposit

Example:
Rent = 100 USDT
Deposit = 300 USDT

Deposit remains locked in escrow.

If tenant misses rent:
- deduct from deposit automatically

Formula:

Remaining Deposit =
Current Deposit - Missed Rent

Refund remaining deposit when rental ends cleanly.

==================================================
RENTALESCROW.SOL
==================================================

Responsibilities:
- rental agreements
- escrow deposits
- rent payments
- late payment deductions
- refunds

Use:
- ReentrancyGuard
- Ownable
- SafeERC20

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

==================================================
FRACTIONAL RENTAL SYSTEM
==================================================

IMPORTANT:
Do NOT use ERC20 ownership tokens.

Instead:
- internally track proportional investments.

Fractional investors:
- invest USDT/USDC
- receive proportional rental yield
- DO NOT receive NFT ownership

NFT owner remains protocol controller.

==================================================
FRACTIONALINVESTMENT.SOL
==================================================

Responsibilities:
- investment tracking
- ownership share calculations
- rental income distribution

Use:
- ReentrancyGuard
- Ownable
- SafeERC20

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

Formulas:

Investor Share =
Investor Contribution / Total Contributions

Investor Payout =
(Investor Contribution / Total Contributions)
× Rental Income

Requirements:
- prevent overfunding
- automatic payouts
- secure ERC20 handling
- track contributors

==================================================
BUSINESS RULES
==================================================

1. Registration DOES NOT auto-list property.

2. Only NFT owner can:
- list/delist
- resell
- enable rental
- enable fractional mode

3. Fractional investors only receive:
- rental yield rights

4. Rental property cannot simultaneously be:
- listed for sale
- privately rented
- fractionally rented

==================================================
OPENZEPPELIN REQUIREMENTS
==================================================

Use latest OpenZeppelin libraries.

PropertyNFT.sol:
- ERC721URIStorage
- Ownable

Marketplace.sol:
- ReentrancyGuard
- Ownable
- SafeERC20

RentalEscrow.sol:
- ReentrancyGuard
- Ownable
- SafeERC20

FractionalInvestment.sol:
- ReentrancyGuard
- Ownable
- SafeERC20

==================================================
SECURITY REQUIREMENTS
==================================================

Implement:
- nonReentrant protection
- CEI pattern
- ownership verification
- input validation
- atomic transfers
- secure ERC20 transfers
- state validation

Prevent:
- double listings
- invalid state transitions
- unauthorized actions
- overfunding

==================================================
GAS OPTIMIZATION
==================================================

Optimize using:
- calldata
- immutable variables
- custom errors
- packed structs
- indexed events
- minimal storage writes
- efficient mappings

Avoid:
- redundant storage
- unnecessary loops
- duplicate ownership tracking

==================================================
FOUNDARY REQUIREMENTS
==================================================

Generate:
- forge-compatible contracts
- deployment scripts
- forge tests
- mock USDT token
- Sepolia deployment setup

Code must be:
- modular
- production-style
- scalable
- secure
- gas-efficient
- cleanly commented
- fully compilable
```
