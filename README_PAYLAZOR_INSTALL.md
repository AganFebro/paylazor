# Paylazor Install & Integration Guide (Vite + React)

This guide shows how to use the `paylazor` checkout widget in a brand new website, plus a minimal backend pattern to create orders and verify USDC payments securely.

## Short Tutorial
If you're just looking for a quick example, see [packages/paylazor/README.md](packages/paylazor/README.md)


## What you’re building

- **Frontend (your website)**: a Vite + React app that renders the default `PaylazorCheckout` UI.
- **Portal (passkey + approval UI)**: either the hosted LazorKit portal or your own hosted copy of `apps/portal` from this repo.
- **Backend (your server)**: creates checkout sessions and verifies on-chain payments before fulfilling orders.

Why a backend is required:
- Client code is **not trusted**. The user can modify amount/recipient in the browser.
- A transaction signature returned by the widget is only a **hint** until you verify it server-side.

---

## Requirements

- Node `>=18`
- `pnpm`
- HTTPS for WebAuthn:
  - **Production**: your site and portal must be served over `https://…`
  - **Local dev**: use `vite-plugin-mkcert` (recommended) or another HTTPS setup

---

## Before you start (important)

- The client is untrusted: do not fulfill orders until your backend verifies **mint + recipient + amount** on-chain.
- The passkey portal must be served over HTTPS and must be allowed to communicate with your site.
- If you see errors like `Buffer is not defined` or `Module "buffer" has been externalized`, jump to the troubleshooting section under step 5.

---

## Table of Contents

1. [Create a new website (Vite + React)](#1-create-a-new-website-vite--react)
2. [Install `paylazor` with npm](#2-install-paylazor)
3. [Install required dependencies](#3-install-required-dependencies)
4. [Configure environment variables (`VITE_...`)](#4-configure-environment-variables)
5. [Enable HTTPS in Vite (required for passkeys) + apply troubleshooting if needed](#5-enable-https-in-vite-required-for-passkeys)
6. [Render the `PaylazorCheckout` widget](#6-render-the-default-paylazor-widget-template-ui)
7. [(Optional) Self-host the portal and allowlist your site origins](#7-optional-self-host-your-own-portal)
8. [Add a backend checkout session (compute amount/recipient server-side)](#8-backend-create-a-checkout-session)
9. [Verify the payment on-chain before fulfillment](#9-backend-verify-the-payment-on-chain)

---

## 1) Create a new website (Vite + React)

```bash
pnpm create vite my-store --template react-ts
cd my-store
pnpm install
```

---

## 2) Install `paylazor`

```bash
pnpm add @febro28/paylazor
```

---

## 3) Install required dependencies

`paylazor` depends on the LazorKit wallet SDK and Solana tooling. Install these alongside it:

```bash
pnpm add @lazorkit/wallet @solana/web3.js @coral-xyz/anchor buffer
```

If your package manager reports additional peer dependency warnings, align versions with `@lazorkit/wallet` (the demo app in this repo is the best reference).

---

## 4) Configure environment variables

Create `.env` in your new website (Vite requires the `VITE_` prefix):

```bash
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_LAZORKIT_PORTAL_URL=https://portal.lazor.sh
VITE_LAZORKIT_PAYMASTER_URL=https://kora.devnet.lazorkit.com
VITE_USDC_MINT=USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT
VITE_MERCHANT_ADDRESS=YOUR_MERCHANT_PUBLIC_KEY
VITE_USDC_DECIMALS=6
VITE_CLUSTER_SIMULATION=devnet
```
---

## 5) Enable HTTPS in Vite (required for passkeys)

Install:

```bash
pnpm add -D vite-plugin-mkcert
```

Edit `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  plugins: [react(), mkcert()],
  define: { global: 'globalThis' },
  resolve: { alias: { buffer: 'buffer/' } },
  optimizeDeps: { include: ['buffer'] },
  server: { https: {}, host: true },
});
```

Then start:

```bash
pnpm dev
```

### Troubleshooting: `Buffer is not defined` / “module externalized”

Solana tooling (and LazorKit) expects a couple of Node-ish globals in the browser. `paylazor` installs minimal polyfills when you render `PaylazorCheckout`, but some bundlers can still pre-bundle dependencies early.

If you see any of these errors:
- `Uncaught ReferenceError: Buffer is not defined`
- `Module "buffer" has been externalized for browser compatibility`

Apply all of the following:
- In `vite.config.ts`, keep `resolve.alias.buffer = 'buffer/'` and `optimizeDeps.include = ['buffer']` (see above).
- Restart the dev server with `--force` (re-optimize deps): `pnpm dev -- --force`
- As a last resort (if another dependency runs before `PaylazorCheckout`), install Buffer globals in your app entry:

```ts
import { Buffer } from 'buffer/';

const g = globalThis as any;
g.global ||= globalThis;
g.Buffer ||= Buffer;
g.process ||= { env: {} };
g.process.env ||= {};
```

### TypeScript editor errors in `vite.config.ts` (optional)

Some editors typecheck `vite.config.ts` outside your main TS project and can show confusing Vite plugin type errors.

Add a `tsconfig.node.json` (Vite template pattern) to include `vite.config.ts`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts"]
}
```

---

## 6) Render the default Paylazor widget (template UI)

Example component:

```tsx
import { useMemo, useState } from 'react';
import { PaylazorCheckout } from '@febro28/paylazor';

export function CheckoutWidget() {
  const [amount, setAmount] = useState('1.00');

  const config = useMemo(
    () => ({
      rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL,
      portalUrl: import.meta.env.VITE_LAZORKIT_PORTAL_URL,
      paymasterUrl: import.meta.env.VITE_LAZORKIT_PAYMASTER_URL,
      usdcMint: import.meta.env.VITE_USDC_MINT,
      merchantAddress: import.meta.env.VITE_MERCHANT_ADDRESS,
      usdcDecimals: Number(import.meta.env.VITE_USDC_DECIMALS),
      clusterSimulation: import.meta.env.VITE_CLUSTER_SIMULATION,
    }),
    []
  );

  return (
    <div style={{ maxWidth: 520 }}>
      <label style={{ display: 'block', marginBottom: 12 }}>
        Amount (USDC)
        <input value={amount} onChange={(e) => setAmount(e.target.value)} />
      </label>

      <PaylazorCheckout
        amount={amount}
        config={config}
        autoCreateAtas="both"
        onSuccess={({ signature }) => {
          console.log('Payment submitted:', signature);
          // Next step: call your backend to verify this signature before fulfilling an order.
        }}
        onError={(e) => console.warn('Payment error:', e)}
      />
    </div>
  );
}
```

### `autoCreateAtas`

- `autoCreateAtas="both"` (recommended for plug-and-play): ensures the payer’s and recipient’s USDC token accounts exist.
- `autoCreateAtas="recipient"`: only ensures the merchant’s USDC token account exists.
- `autoCreateAtas="none"`: safest/strictest; requires both token accounts already exist.

---

## 7) Optional: self-host your own portal

The portal is the page that performs passkey authentication and approvals. You can:

- Use the hosted portal: `https://portal.lazor.sh`
- Or self-host the portal app from this repo: `apps/portal`

### Deploying `apps/portal`

`apps/portal` is a static Vite app. Deploy it to any HTTPS static host (Vercel, Netlify, Cloudflare Pages, etc.).

Security hardening (recommended):
- Set `VITE_PORTAL_ALLOWED_ORIGINS` on the portal deployment to the origins allowed to open it, e.g.:
  - `https://yourdomain.com`
  - `https://checkout.yourdomain.com`

---

## 8) Backend: create a checkout session

Minimal approach:

1. Your frontend requests a checkout session:
   - `POST /api/checkout-sessions` with `productId` and `quantity`
2. Your backend validates pricing and returns:
   - `checkoutSessionId`
   - `amountUsdc` (string)
   - `recipient` (merchant address)
   - `memo` (a unique order reference; optional but recommended)
3. Your frontend passes `amountUsdc`, `recipient`, `memo` into `PaylazorCheckout`.
4. After payment, your frontend calls:
   - `POST /api/checkout-sessions/:id/verify` with `{ signature }`
5. Your backend verifies on-chain and marks the order as paid.

Why this matters:
- Even if you hide the merchant address in your build step, users can still tamper with the widget props in DevTools.
- The backend must verify **mint, recipient, amount** before fulfilling.

---

## 9) Backend: verify the payment on-chain

Install in your backend:

```bash
pnpm add express @solana/web3.js @solana/spl-token
```

Example `server.ts` (minimal, in-memory “DB” for illustration only):

```ts
import express from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

const app = express();
app.use(express.json());

const RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
const USDC_MINT = new PublicKey(process.env.USDC_MINT!);
const MERCHANT = new PublicKey(process.env.MERCHANT_ADDRESS!);

type Session = {
  id: string;
  amountBaseUnits: bigint;
  recipient: string;
  memo?: string;
  status: 'created' | 'paid';
  signature?: string;
};

const sessions = new Map<string, Session>();

app.post('/api/checkout-sessions', (req, res) => {
  // TODO: validate productId/quantity and compute the amount server-side.
  const amountUsdc = '1.00';
  const amountBaseUnits = 1_000_000n; // 1.00 USDC with 6 decimals

  const id = crypto.randomUUID();
  const memo = `order:${id}`;

  sessions.set(id, {
    id,
    amountBaseUnits,
    recipient: MERCHANT.toBase58(),
    memo,
    status: 'created',
  });

  res.json({
    checkoutSessionId: id,
    amountUsdc,
    recipient: MERCHANT.toBase58(),
    memo,
    usdcMint: USDC_MINT.toBase58(),
  });
});

app.post('/api/checkout-sessions/:id/verify', async (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'not_found' });
  if (session.status === 'paid') return res.json({ ok: true, status: 'paid', signature: session.signature });

  const signature = String(req.body?.signature ?? '');
  if (!signature) return res.status(400).json({ error: 'missing_signature' });

  const connection = new Connection(RPC_URL, 'finalized');
  const tx = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });
  if (!tx) return res.status(404).json({ error: 'tx_not_found' });

  if (tx.meta?.err) return res.status(400).json({ error: 'tx_failed', details: tx.meta.err });

  // Verify recipient received the expected USDC amount by checking token balance delta on the recipient ATA.
  const recipientAta = getAssociatedTokenAddressSync(USDC_MINT, new PublicKey(session.recipient), true);
  const pre = tx.meta?.preTokenBalances?.find((b) => b.mint === USDC_MINT.toBase58() && b.owner === session.recipient);
  const post = tx.meta?.postTokenBalances?.find((b) => b.mint === USDC_MINT.toBase58() && b.owner === session.recipient);

  // If the owner field is absent in your RPC response, fall back to matching by `accountIndex` for the ATA.
  const preAmount = BigInt(pre?.uiTokenAmount.amount ?? '0');
  const postAmount = BigInt(post?.uiTokenAmount.amount ?? '0');
  const delta = postAmount - preAmount;

  if (delta !== session.amountBaseUnits) {
    return res.status(400).json({
      error: 'amount_mismatch',
      expected: session.amountBaseUnits.toString(),
      received: delta.toString(),
      recipientAta: recipientAta.toBase58(),
    });
  }

  session.status = 'paid';
  session.signature = signature;
  sessions.set(session.id, session);

  return res.json({ ok: true, status: 'paid', signature });
});

app.listen(3001, () => console.log('API listening on :3001'));
```

### Backend verification notes (important)

- Use `commitment: 'finalized'` for fulfillment.
- Verify **all** of:
  - USDC mint matches your expected mint
  - Recipient matches your merchant address
  - Amount matches your session amount (in base units)
- Consider requiring a unique `memo` and verifying it (optional), so replayed signatures can’t be reused for other orders.
- Store sessions in a real database and make verification idempotent.
