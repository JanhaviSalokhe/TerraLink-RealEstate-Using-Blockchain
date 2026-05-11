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
VITE_PROPERTY_NFT_ADDRESS=
VITE_MARKETPLACE_ADDRESS=
VITE_FRACTIONAL_ADDRESS=
VITE_RENTAL_ESCROW_ADDRESS=
```

Pinata uploads are intentionally handled through a reusable utility and hook. In production, proxy the Pinata JWT through a backend if you do not want the browser to hold upload credentials.
