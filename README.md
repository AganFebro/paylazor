# Paylazor

Monorepo for a LazorKit-integrated “Pay with Solana (USDC)” checkout widget and a minimal demo storefront.

## What this repo demonstrates (for bounty judges)

- Passkey-based wallet connect + session restore via LazorKit portal
- Gasless USDC payment (paymaster-sponsored `signAndSendTransaction`)
- A reusable “Pay with Solana (USDC)” widget (`packages/paylazor`) + drop-in Vite demo apps

## Structure

- `packages/paylazor` — the widget library (React)
- `apps/demo-store` — minimal Vite React demo
- `apps/portal` — self-hosted passkey portal (WebAuthn + postMessage)
- `sdk-example` — LazorKit reference repo (do not modify)

## Quick start (local dev)

```bash
pnpm install
cp .env.example .env
```

Set `VITE_MERCHANT_ADDRESS` in `.env` (a Solana public key).

```bash
pnpm --filter portal dev
pnpm --filter demo-store dev
```

Ports:
- Portal: `https://localhost:5174`
- Demo store: `https://localhost:5173`

Notes:
- `.env.example` defaults to Devnet + local portal (`VITE_LAZORKIT_PORTAL_URL=https://localhost:5174`).
- For production/self-hosted portals, set `VITE_PORTAL_ALLOWED_ORIGINS` in the portal deployment (see `README_PAYLAZOR_INSTALL.md`).

## Demo walkthrough

1. Open the demo store (`https://localhost:5173` or `https://localhost:5175`).
2. Click **Continue with passkey** and complete the portal prompt.
3. Fund the smart wallet’s USDC ATA (shown in the widget UI) with Devnet USDC for the configured mint.
4. Click **Pay now** and copy the transaction signature.

If something breaks:
- Read the tutorials below first.
- If you see `Buffer is not defined` or “module externalized”, follow the Vite troubleshooting in `README_PAYLAZOR_INSTALL.md`.

## Tutorials

- `tutorials/01-passkey-wallet.md`
- `tutorials/02-gasless-usdc-payment.md`

## Using Paylazor in your own site

- `README_PAYLAZOR_INSTALL.md`
