# Paylazor

Monorepo for a LazorKit-integrated “Pay with Solana (USDC)” checkout widget and a minimal demo storefront.

## Structure

- `packages/paylazor` — the widget library (React)
- `apps/demo-store` — minimal Vite React demo
- `apps/portal` — self-hosted passkey portal (WebAuthn + postMessage)
- `sdk-example` — LazorKit reference repo (do not modify)

## Quick start

```bash
pnpm install
pnpm dev
```

Environment defaults are in `.env.example` (Devnet). Copy to `.env` to override:

```bash
cp .env.example .env
```

By default, the demo uses the local portal at `https://localhost:5174` and runs the demo-store at `https://localhost:5173`.

## Tutorials

- `tutorials/01-passkey-wallet.md`
- `tutorials/02-gasless-usdc-payment.md`
