# Tutorial 1: Passkey wallet connect (LazorKit)

This tutorial shows the passkey-based connect flow used by the `paylazor` widget.

## Prerequisites

- `pnpm install`
- Start the demo: `pnpm --filter demo-store dev`
- Defaults are Devnet and the hosted portal (`https://portal.lazor.sh`).

## Steps

1. Open the demo app in your browser.
2. In the Paylazor widget, click **Continue with passkey**.
3. A LazorKit portal window opens and prompts you to create or use a passkey.
4. After completing the passkey prompt, the widget shows a **Pay now** button, indicating the wallet session is ready.

## What happened under the hood

- The widget wraps itself in LazorKit’s `LazorkitProvider` with `rpcUrl`, `portalUrl`, and `paymasterUrl`.
- It calls `useWallet().connect({ feeMode: 'paymaster' })` to create/restore a passkey wallet session.

