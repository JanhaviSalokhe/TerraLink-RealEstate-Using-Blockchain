```text
Build a decentralized Web3 real-estate ownership and rental protocol focused on:

1. Instant property ownership transfer
2. Property marketplace
3. Rental escrow system
4. Fractional rental investment with automated yield distribution

The protocol should demonstrate how blockchain reduces traditional 5–6 month ownership transfers into instant on-chain settlement.

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
- Mock USDT/USDC ERC20 on Sepolia

==================================================
CORE ARCHITECTURE
==================================================

Each property is represented as an ERC721 NFT.

NFT represents:
- full property ownership
- authority over:
  - sale
  - resale
  - rental mode
  - fractional rental mode

Ownership transfer must occur atomically through smart contracts.

Use FOUR modular contracts:

1. PropertyNFT.sol
2. Marketplace.sol
3. RentalEscrow.sol
4. FractionalInvestment.sol

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
PROPERTY FLOW
==================================================

STEP 1 → REGISTER PROPERTY

Owner:
- connects wallet
- uploads metadata/images to IPFS
- property NFT minted

Initially:
- visible only in owner dashboard
- NOT listed publicly

State:
REGISTERED

==================================================
STEP 2 → LIST PROPERTY
==================================================

Owner can:
- list property
- set custom price
- update price
- delist anytime

Marketplace must:
- verify NFT ownership
- store listing
- expose active listings

State:
LISTED_FOR_SALE

==================================================
STEP 3 → BUY PROPERTY
==================================================

Example:
A lists for 10,000 USDT.
B buys.

Flow:
1. Verify active listing
2. Transfer USDT from B → A
3. Transfer NFT from A → B
4. Remove listing
5. Update owner

Ownership + payment transfer must be atomic.

After purchase:
B becomes sole owner.

==================================================
STEP 4 → NEW OWNER OPTIONS
==================================================

B can:

A. Re-sell
- relist anytime
- set custom price

B. Private Rental
- receive 100% rent

C. Fractional Rental
- allow investors
- distribute rental income proportionally

==================================================
PRIVATE RENTAL SYSTEM
==================================================

Owner sets:
- rent amount
- security deposit
- duration

Tenant:
- pays first rent + deposit

Example:
Rent = 100 USDT
Deposit = 300 USDT

Tenant pays:
400 USDT total.

Deposit stays locked in escrow.

If rent unpaid:
- deduct from deposit automatically

Formula:

Remaining Deposit =
Current Deposit - Missed Rent

If rental ends cleanly:
- refund remaining deposit automatically

==================================================
RENTALESCROW.SOL
==================================================

Handles:
- rental agreements
- deposits
- rent payments
- late deductions
- refunds

Use:

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
Do NOT create ERC20 ownership tokens.

Instead:
- track direct stablecoin investments internally.

Fractional investors:
- invest USDT/USDC
- receive proportional rental yield
- DO NOT receive NFT ownership

NFT owner remains protocol controller.

==================================================
FRACTIONAL FLOW
==================================================

Example:

Property Value:
10,000 USDT

Owner enables fractional mode:
- target raise
- minimum investment

Investor contributes:
100 USDT

Ownership share:

Investor Share =
Investor Contribution / Total Contributions

==================================================
RENT DISTRIBUTION
==================================================

When rent deposited:

Automatically distribute:

Investor Payout =
(Investor Contribution / Total Contributions)
× Rental Income

Transfer payouts directly to investor wallets.

==================================================
FRACTIONALINVESTMENT.SOL
==================================================

Handles:
- investments
- contribution tracking
- ownership share calculations
- rental income distribution

Use:

struct InvestmentPool {
    uint256 propertyId;
    uint256 targetAmount;
    uint256 totalRaised;
    bool active;
}

Functions:
- enableFractionalInvestment()
- investInProperty()
- depositRentalIncome()
- distributeRentalIncome()
- getInvestorShare()

Requirements:
- prevent overfunding
- automatic proportional payouts
- secure ERC20 handling
- track all contributors

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
OPENZEPPELIN + SECURITY
==================================================

Use latest OpenZeppelin contracts.

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

Implement:
- nonReentrant protection
- CEI pattern
- ownership verification
- input validation
- atomic transactions
- secure ERC20 transfers
- state validation

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
- expensive loops
- duplicate ownership tracking

==================================================
FOUNDARY REQUIREMENTS
==================================================

Generate:
- Foundry-compatible contracts
- deployment scripts
- forge tests
- Sepolia deployment setup
- mock USDT token
- environment variables
- frontend interaction examples

==================================================
FINAL GOAL
==================================================

The final protocol should demonstrate:

1. Instant NFT-based ownership transfer
2. Decentralized property marketplace
3. Rental escrow automation
4. Security deposit enforcement
5. Fractional rental investing
6. Automated proportional rental income distribution

The architecture should remain:
- modular
- secure
- gas-efficient
- scalable
- production-style
- clean and minimal MVP
```
