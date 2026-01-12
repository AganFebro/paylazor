# paylazor

Embeddable “Pay with Solana (USDC)” checkout widget, integrated with LazorKit passkeys and paymaster.

## Status

- This package is wired as a workspace dependency in this monorepo.
- Publishing to npm is intended, but this repo currently marks the package as private (`packages/paylazor/package.json`).

## Install

```bash
pnpm add paylazor @lazorkit/wallet @solana/web3.js @coral-xyz/anchor @solana/spl-token
```

## Configuration

The widget does not read your `.env` directly; your app should load env vars and pass them via the `config` prop.

### Required config

- `usdcMint` (string)
- `merchantAddress` (string)
- `usdcDecimals` (number)
- `clusterSimulation` (`'devnet' | 'mainnet'`)

### Optional config (has safe defaults)

- `rpcUrl` (defaults to `https://api.devnet.solana.com`)
- `portalUrl` (defaults to `https://portal.lazor.sh`)
- `paymasterUrl` (defaults to `https://kora.devnet.lazorkit.com`)
- `errorFaqUrl` (optional public FAQ link shown on errors)

For Vite apps, set:

```bash
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_LAZORKIT_PORTAL_URL=https://portal.lazor.sh
VITE_LAZORKIT_PAYMASTER_URL=https://kora.devnet.lazorkit.com
VITE_USDC_MINT=USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT
VITE_MERCHANT_ADDRESS=YOUR_MERCHANT_PUBLIC_KEY
VITE_USDC_DECIMALS=6
VITE_CLUSTER_SIMULATION=devnet
```

## Usage

```tsx
import { PaylazorCheckout } from 'paylazor';

export function Checkout() {
  return (
    <PaylazorCheckout
      amount="1.50"
      config={{
        rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL,
        portalUrl: import.meta.env.VITE_LAZORKIT_PORTAL_URL,
        paymasterUrl: import.meta.env.VITE_LAZORKIT_PAYMASTER_URL,
        usdcMint: import.meta.env.VITE_USDC_MINT,
        merchantAddress: import.meta.env.VITE_MERCHANT_ADDRESS,
        usdcDecimals: Number(import.meta.env.VITE_USDC_DECIMALS),
        clusterSimulation: import.meta.env.VITE_CLUSTER_SIMULATION,
        errorFaqUrl: 'https://github.com/<org>/<repo>#faq',
      }}
      autoCreateAtas="both"
      onSuccess={({ signature }) => console.log('Paid:', signature)}
    />
  );
}
```

## Vite setup (passkeys + Solana polyfills)

Passkeys require HTTPS. The simplest setup for Vite dev is `vite-plugin-mkcert`.

If you see errors like `Buffer is not defined` or “Module "buffer" has been externalized”, ensure your `vite.config.ts` includes:

```ts
define: { global: 'globalThis' },
resolve: { alias: { buffer: 'buffer/' } },
optimizeDeps: { include: ['buffer'] },
server: { https: {}, host: true },
```

## Notes

- `autoCreateAtas` defaults to `both` so the widget can work out-of-the-box even when USDC token accounts don’t exist yet.
- If you don’t want the paymaster to pay rent for ATA creation, set `autoCreateAtas="none"` and ensure both sender/recipient USDC token accounts already exist.
- If you set `config.errorFaqUrl`, the widget will show a “See GitHub for error FAQ” link when errors occur.

## Security notes (recommended)

- Don’t trust the browser: compute `amount` and `recipient` server-side and verify on-chain before fulfillment (see `README_PAYLAZOR_INSTALL.md`).
- If you self-host `apps/portal`, set `VITE_PORTAL_ALLOWED_ORIGINS` on the portal deployment so only your site can open it.
