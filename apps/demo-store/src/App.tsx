import { useMemo, useState } from 'react';
import { PaylazorCheckout } from 'paylazor';

const DEFAULT_AMOUNT = '1.00';

export default function App() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);

  const config = useMemo(
    () => ({
      rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      portalUrl: import.meta.env.VITE_LAZORKIT_PORTAL_URL || 'https://portal.lazor.sh',
      paymasterUrl: import.meta.env.VITE_LAZORKIT_PAYMASTER_URL || 'https://kora.devnet.lazorkit.com',
      usdcMint:
        import.meta.env.VITE_USDC_MINT || 'USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT',
      merchantAddress:
        import.meta.env.VITE_MERCHANT_ADDRESS || '7MWBWrYEeLVqd6jpGAdbhzxdAF8oEAakjUej6cp9kPvP',
    }),
    []
  );

  return (
    <div className="page">
      <header className="header">
        <h1>Demo Store</h1>
        <p>Minimal storefront showcasing the `paylazor` widget (Devnet).</p>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Test product</h2>
          <p>USDC payment via LazorKit passkeys + paymaster.</p>

          <label className="label">
            Amount (USDC)
            <input
              className="input"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.00"
            />
          </label>
        </section>

        <section>
          <PaylazorCheckout
            amount={amount}
            config={config}
            autoCreateAtas="both"
            onSuccess={({ signature }) => console.log('Paid:', signature)}
          />
        </section>
      </main>
    </div>
  );
}
