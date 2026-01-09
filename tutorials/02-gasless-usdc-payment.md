# Tutorial 2: Gasless USDC payment (Devnet)

This tutorial sends a USDC SPL-token transfer instruction using LazorKit’s `signAndSendTransaction` (paymaster-sponsored).

## Prerequisites

- Complete Tutorial 1 (wallet connected)
- The paying wallet must have Devnet USDC for the configured mint.
  - The demo UI shows the smart wallet’s derived **USDC ATA**. Fund that address with Devnet USDC before paying.

## Steps

1. In the demo store, set an amount (example: `1.00`).
2. Click **Pay now**.
3. If successful, the widget displays a transaction signature.

## Notes / troubleshooting

- If the recipient (merchant) USDC associated token account doesn’t exist, the transfer can fail.
  - The widget defaults `autoCreateAtas="none"` for safety.
  - You can opt-in to ATA creation via `autoCreateAtas="recipient"` or `autoCreateAtas="both"` (see `packages/paylazor/README.md`).
- If the paymaster endpoint is unreachable, the widget fails early with “Failed to reach paymaster”.
