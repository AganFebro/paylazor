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
  - The widget defaults `autoCreateAtas="both"` for plug-and-play (it will create missing ATAs via the paymaster).
  - If you want the strictest behavior, set `autoCreateAtas="none"` and ensure both sender + recipient USDC token accounts already exist.
  - Middle-ground: `autoCreateAtas="recipient"` ensures the merchant ATA exists but won’t create the payer ATA.
- If the paymaster endpoint is unreachable, the widget fails early with “Failed to reach paymaster”.
