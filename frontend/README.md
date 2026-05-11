# TERRALINK Frontend

Premium Web3 real-estate frontend built with Vite, React, TailwindCSS, Framer Motion, React Router, shadcn-style UI primitives, Wagmi, Viem, RainbowKit, and React Hot Toast.

## Run

```bash
cd frontend
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env` and fill:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_PINATA_JWT=your_pinata_jwt
VITE_SEPOLIA_RPC_URL=
VITE_DEPLOYMENT_BLOCK=
VITE_MOCK_USDT_ADDRESS=0x088DcD9178a4a58786fA3cf18081649a2b29bbb1
VITE_PROPERTY_NFT_ADDRESS=0x329192aE8732B222be6505E6DFe1A02400361187
VITE_MARKETPLACE_ADDRESS=0x4dAfAb9a1560Cff8E33e031e8cA240408f069BdB
VITE_RENTAL_ESCROW_ADDRESS=0x80507292eBa35BcBd5c69EDBCb52255dB422Eb36
VITE_FRACTIONAL_ADDRESS=0xB97D45C1Da9d41E5d9A76ea31c319C2B691d0ef9
```

The deployed Sepolia addresses are already configured as defaults in source and in `.env.example`; override them only if you redeploy. `VITE_DEPLOYMENT_BLOCK` is optional, but setting it to the PropertyNFT deployment block makes event indexing faster and more reliable on RPC providers with log-range limits.

Pinata uploads are intentionally handled through a reusable utility and hook. In production, proxy the Pinata JWT through a backend if you do not want the browser to hold upload credentials.

## Live Protocol Behavior

- Properties are discovered from `PropertyNFT.PropertyRegistered` events.
- Metadata is fetched from the token URI/IPFS URI returned by `getProperty`.
- Marketplace cards render only active `Marketplace.getListing` records.
- Owner tools approve the protocol operator, then list, open rentals, or enable fractional pools.
- Buyer/tenant/investor actions approve mUSDT, then call the deployed Sepolia contracts.
