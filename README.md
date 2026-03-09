# Trivia Pay

A Solana-based payment demo app (Ionic/React + Capacitor) that demonstrates QR payments, wallet connections, and escrow flows.

**Quick overview**
- Purpose: demo Solana pay flows (send/receive/scan/escrow) with mobile-ready wrappers.
- Stack: React, Vite, Capacitor, Solana web3 tooling.

**Features**
- Generate and scan QR codes for payments
- Connect wallets (WalletConnect / browser wallets)
- Send and receive SOL or token payments
- Escrow payment flow (create, accept, release)
- Transaction history listing

**Tech / Libraries**
- React + Vite
- Capacitor for native builds (Android scaffolding included)
- Solana web3 integrations in `services/`
- QR code generation & scanning

**Project structure**

trivia-pay/
  - public/ — static assets
  - src/
    - components/ — UI components (QR, Navbar, Wallet UI)
    - config/ — network / Solana config
    - layout/ — top bar, drawer, mobile layout
    - pages/ — app screens (Dashboard, Send, Receive, ScanPay, Escrow, etc.)
    - services/ — `solanaService.js`, `escrowService.js` (RPC + on-chain logic)
    - styles/ — theme and style tokens
    - utils/ — native integrations and helpers
  - android/ — Capacitor Android project
  - idl/ — program IDLs (e.g., escrow.json)
  - package.json, vite.config.js, tsconfig.json

**Folder structure (detailed)**

trivia-pay/
  public/
  src/
    components/
      GradientButton.jsx       # re-usable button
      Navbar.jsx               # top navigation
      QRGenerator.jsx          # create payment QR
      QRScanner.jsx            # scan QR codes
      WalletConnectBtn.jsx     # wallet connect UI
      WalletConnectModal.jsx   # modal for wallet selection
    config/
      solanaConfig.js          # RPC endpoints, program IDs
    layout/
      TopBar.jsx
      Drawer.jsx
      MobileLayout.jsx
    pages/
      Dashboard.jsx            # home summary + quick actions
      Send.jsx                 # send SOL/tokens screen
      Receive.jsx              # generate receive request (QR)
      ScanPay.jsx              # camera view to scan QR and pay
      Escrow.jsx               # create/fulfill/release escrow
      Transactions.jsx         # list of on-chain transactions
      BillSplit.jsx            # split-bill flow
    services/
      solanaService.js         # RPC helpers, send/confirm tx
      escrowService.js         # escrow program interactions
    styles/
      theme.js                 # tokens and theme
    utils/
      nativeIntegrations.js    # Capacitor/native helpers
  android/
  idl/
  README.md

**Wireframes (simple text sketches)**

- Dashboard (main)
  - Header: `TopBar` (logo + wallet status)
  - Balance card: total SOL + tokens
  - Quick actions: [Send] [Receive] [Scan]
  - Recent transactions list (click to view details)

- Send
  - Form: To (address/QR) | Amount | Token selector
  - Button: `Preview` -> confirm dialog -> `Send`

- Receive
  - Select token & amount (optional)
  - Button: `Generate QR` (shows QR + copy link)

- ScanPay
  - Camera view (QRScanner component)
  - On scan: show payment preview modal with `Pay` and `Cancel`

- Escrow
  - Create escrow: counterparty, amount, conditions
  - Pending escrows list: `Accept` / `Release` action buttons

- Transactions / BillSplit
  - List items with amount, status, timestamp
  - BillSplit: create bill, add participants, share QR or link

These wireframes are intentionally minimal — they map directly to the `pages/` files above and can be turned into visual mockups or exported images if you want.

**Backend / Server requirements**

- Core flows: The app performs all payment and escrow actions directly on Solana via client-side RPC calls. There is no required backend server or database to make on-chain payments — the frontend talks to a Solana RPC provider (configured in `src/config/solanaConfig.js` or via environment variables).
- RPC provider: You must provide an RPC endpoint (mainnet/devnet) or use a public provider (e.g., QuickNode, Alchemy, or a self-hosted Solana RPC node).
- On-chain program: Escrow interactions rely on an on-chain program (IDL included in `idl/`). You can use an already-deployed program or deploy your own; the client-side services expect the program ID in configuration.
- Optional backend uses:
  - Indexing / transaction history: for fast, reliable history and search, add a server that indexes transactions (Postgres, ElasticSearch, or hosted services). Without it, the app queries RPC for transactions.
  - Relayer or notification service: to send push notifications, webhooks, or perform off-chain coordination (e.g., email invites).
  - Custodial/relayer operations: if you require server-side signing or batched transactions, a secure backend is required (avoid storing private keys in the repo).
- Data storage: The app stores only local/transient data (localStorage or Capacitor storage). No production database is required unless you add the optional features above.

**Run without a backend**

1. Configure RPC and program IDs in `src/config/solanaConfig.js` or `.env`.
2. Start the app with `npm run dev` and connect a wallet (wallets handle signing locally).

If you'd like, I can add an example `server/` scaffold (Node.js + Express + Postgres) showing optional indexing and webhook endpoints.

**Prerequisites**
- Node.js (16+ recommended)
- npm or yarn
- Android SDK (if building Android native app)

**Environment**
- Copy `.env.example` to `.env` and fill values (RPC endpoints, keys, etc.).

**Local development**
1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. To run on Android emulator/device (Capacitor):

```bash
npm run build
npx cap sync android
npx cap open android
```

**Build**

```bash
npm run build
```

**Notes & Next steps**
- Securely store private keys and API keys — do not commit `.env`.
- The repo includes an Android Capactior project under `android/` ready for further native testing.

**Contributing**
- Open issues and PRs are welcome. Follow existing code patterns and add tests where possible.

**License**
- MIT
