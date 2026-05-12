# TerraLink — Decentralized Real Estate Marketplace

TerraLink is a full-stack Web3 real-estate platform that enables secure property registration, listing, rentals, and fractional ownership using Ethereum smart contracts.

Built with React, Vite, Wagmi, RainbowKit, Solidity, and Foundry, TerraLink combines modern Web3 UX with decentralized ownership and transparent on-chain transactions.

---

# ✨ Features

## 🏠 Property NFT Registration

* Mint real-estate properties as NFTs
* Store metadata using IPFS
* Immutable on-chain ownership records

## 🛒 Marketplace System

* List properties for sale
* Update listing prices
* Cancel listings
* Buy properties securely using smart contracts

## 🏘 Rental Escrow

* Open rental agreements
* Tenant rent payments
* Security deposit handling
* Rental termination workflow
* Deposit refunds and deductions

## 📈 Fractional Investment

* Enable shared ownership of properties
* Contributors invest into fractional pools
* Rental income distribution to investors
* Claimable payouts for contributors

## 🔐 Wallet & Web3 Integration

* MetaMask support
* RainbowKit wallet connection
* Wagmi + Viem integration
* Sepolia testnet deployment

## 🎨 Modern Frontend

* Responsive UI built with TailwindCSS
* Framer Motion animations
* React Router navigation
* Toast notifications
* Reusable component architecture

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* TailwindCSS
* Framer Motion
* React Router
* Wagmi
* Viem
* RainbowKit
* Recharts

## Smart Contracts

* Solidity
* Foundry

## Blockchain

* Ethereum Sepolia Testnet

## Storage

* IPFS
* Pinata

---

# 📁 Project Structure

```bash
TerraLink-RealEstate-Using-Blockchain/
│
├── frontend/                  # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── components/
│   ├── pages/
│   └── package.json
│
├── smart contracts/
│   ├── src/
│   │   ├── PropertyNFT.sol
│   │   ├── Marketplace.sol
│   │   ├── RentalEscrow.sol
│   │   ├── FractionalInvestment.sol
│   │   └── MockUSDT.sol
│   │
│   ├── script/
│   │   └── Deploy.s.sol
│   │
│   └── test/
│       └── Terralink.t.sol
│
└── README.md
```

---

# ⚙️ Smart Contracts

## PropertyNFT.sol

Handles:

* Property minting
* Ownership records
* Metadata storage
* Property registration events

## Marketplace.sol

Handles:

* Property listings
* Buying/selling
* Listing updates
* Listing cancellation

## RentalEscrow.sol

Handles:

* Rental agreements
* Security deposits
* Rent payment flows
* Refunds and settlement

## FractionalInvestment.sol

Handles:

* Shared property investments
* Investor contribution tracking
* Rental income payouts
* Claimable rewards

## MockUSDT.sol

Mock ERC20 token used for testing transactions.

---

# 🚀 Getting Started

## Prerequisites

Install the following before running the project:

* Node.js
* npm
* Foundry
* MetaMask
* Git

---

# 🔧 Frontend Setup

## 1. Clone Repository

```bash
git clone https://github.com/Chitrangath/TerraLink-RealEstate-Using-Blockchain.git
cd TerraLink-RealEstate-Using-Blockchain
```

## 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## 3. Configure Environment Variables

Copy `.env.example` into `.env`

```bash
cp .env.example .env
```

Update the following variables:

```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_PINATA_JWT=your_pinata_jwt
VITE_SEPOLIA_RPC_URL=your_sepolia_rpc_url
VITE_DEPLOYMENT_BLOCK=deployment_block

VITE_MOCK_USDT_ADDRESS=0x...
VITE_PROPERTY_NFT_ADDRESS=0x...
VITE_MARKETPLACE_ADDRESS=0x...
VITE_RENTAL_ESCROW_ADDRESS=0x...
VITE_FRACTIONAL_ADDRESS=0x...
```

---

## 4. Start Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# ⛓ Smart Contract Setup

## Install Foundry Dependencies

```bash
cd "smart contracts"
forge install
```

## Compile Contracts

```bash
forge build
```

## Run Tests

```bash
forge test
```

## Deploy Contracts

```bash
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

---

# 🔄 Protocol Workflow



## Property Registration

1. User uploads property metadata
2. Metadata stored on IPFS
3. Property NFT minted
4. Ownership stored on-chain

## Marketplace Purchase

1. Owner lists property
2. Buyer approves token allowance
3. Smart contract executes purchase
4. Ownership transferred automatically

## Rental System

1. Owner opens rental listing
2. Tenant accepts rental
3. Deposit locked in escrow
4. Monthly rent payments processed
5. Deposit refunded after completion

## Fractional Investment

1. Owner creates investment pool
2. Investors contribute funds
3. Rental income deposited
4. Contributors claim rewards proportionally

---

# 🌐 Deployed Network

The frontend is configured for:

* Ethereum Sepolia Testnet

Contract writes are restricted to Sepolia deployments.

---

# 🧪 Testing

Smart contract tests are located in:

```bash
smart contracts/test/Terralink.t.sol
```

Run tests:

```bash
forge test -vv
```

---

# 📸 Screenshots

Add screenshots here.

Example:

```bash
/screenshots/homepage.png
/screenshots/property-details.png
/screenshots/marketplace.png
/screenshots/fractional-investment.png
```

---

# 🔒 Security Notes

* Smart contracts should be audited before production deployment
* Never expose private keys publicly
* Store sensitive credentials securely
* Prefer backend proxying for Pinata JWT in production
* Validate ownership before executing transactions

---

# 📌 Future Improvements

* Multi-chain deployment
* DAO governance for properties
* Real government land registry integration
* AI property valuation
* Mobile application
* Fiat payment gateway integration
* NFT mortgage system

---

# 🤝 Contributing

Contributions are welcome.

## Steps

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push changes

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

## Chitrangath

GitHub Repository:
[https://github.com/Chitrangath/TerraLink-RealEstate-Using-Blockchain](https://github.com/Chitrangath/TerraLink-RealEstate-Using-Blockchain)

---

# ⭐ Acknowledgements

* Ethereum
* Foundry
* Wagmi
* RainbowKit
* React
* TailwindCSS
* IPFS
* Pinata
