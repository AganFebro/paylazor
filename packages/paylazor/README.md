# paylazor

Embeddable “Pay with Solana (USDC)” checkout widget, integrated with LazorKit passkeys and paymaster.

## Install

```bash
pnpm add paylazor @lazorkit/wallet @solana/web3.js @coral-xyz/anchor @solana/spl-token
```

## Usage

```tsx
import { PaylazorCheckout } from 'paylazor';

export function Checkout() {
  return (
    <PaylazorCheckout
      amount="1.50"
      // Optional: enable SOL payments too
      enabledCurrencies={['USDC', 'SOL']}
      defaultCurrency="USDC"
      // Optional: overrides
      config={{
        rpcUrl: 'https://api.devnet.solana.com',
        portalUrl: 'https://portal.lazor.sh',
        paymasterUrl: 'https://kora.devnet.lazorkit.com',
        usdcMint: 'USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT',
        merchantAddress: '7MWBWrYEeLVqd6jpGAdbhzxdAF8oEAakjUej6cp9kPvP',
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
- SOL payments use a native `SystemProgram.transfer`. No token accounts are involved.
