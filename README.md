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
