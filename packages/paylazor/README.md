# paylazor

Embeddable “Pay with Solana (USDC)” checkout widget, integrated with LazorKit passkeys and paymaster.

## Install

```bash
pnpm add paylazor @lazorkit/wallet @solana/web3.js @coral-xyz/anchor @solana/spl-token
```

## Configuration

These values are required and should come from your app config (recommended) or `.env`.

For Vite apps, set:

```bash
VITE_USDC_MINT=USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT
VITE_MERCHANT_ADDRESS=YOUR_MERCHANT_PUBLIC_KEY
VITE_USDC_DECIMALS=6
VITE_CLUSTER_SIMULATION=devnet
```

The widget does not read your `.env` directly; your app should load env vars and pass them via the `config` prop.

## Usage

```tsx
import { PaylazorCheckout } from 'paylazor';

export function Checkout() {
  return (
    <PaylazorCheckout
      amount="1.50"
      config={{
        usdcMint: import.meta.env.VITE_USDC_MINT,
        merchantAddress: import.meta.env.VITE_MERCHANT_ADDRESS,
        usdcDecimals: Number(import.meta.env.VITE_USDC_DECIMALS),
        clusterSimulation: import.meta.env.VITE_CLUSTER_SIMULATION,
        errorFaqUrl: 'https://github.com/<org>/<repo>#faq',

        // Optional: endpoint overrides
        rpcUrl: 'https://api.devnet.solana.com',
      }}
      autoCreateAtas="both"
      onSuccess={({ signature }) => console.log('Paid:', signature)}
    />
  );
}
```

## Notes

- `autoCreateAtas` defaults to `both` so the widget can work out-of-the-box even when USDC token accounts don’t exist yet.
- If you don’t want the paymaster to pay rent for ATA creation, set `autoCreateAtas="none"` and ensure both sender/recipient USDC token accounts already exist.
- If you set `config.errorFaqUrl`, the widget will show a “See GitHub for error FAQ” link when errors occur.
