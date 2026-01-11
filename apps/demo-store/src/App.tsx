import { useMemo, useState } from 'react';
import { PaylazorCheckout } from 'paylazor';
import type { PaylazorConfig } from 'paylazor';

const DEFAULT_AMOUNT = '1.00';

export default function App() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);

  const config = useMemo(
    () =>
      ({
        rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL,
        portalUrl: import.meta.env.VITE_LAZORKIT_PORTAL_URL,
        paymasterUrl: import.meta.env.VITE_LAZORKIT_PAYMASTER_URL,
        usdcMint: import.meta.env.VITE_USDC_MINT,
        merchantAddress: import.meta.env.VITE_MERCHANT_ADDRESS,
        usdcDecimals: Number(import.meta.env.VITE_USDC_DECIMALS),
        clusterSimulation: import.meta.env.VITE_CLUSTER_SIMULATION as PaylazorConfig['clusterSimulation'],
      }) satisfies Partial<PaylazorConfig>,
    []
  );

  const missingEnv = useMemo(() => {
    const required = [
      'VITE_SOLANA_RPC_URL',
      'VITE_LAZORKIT_PORTAL_URL',
      'VITE_LAZORKIT_PAYMASTER_URL',
      'VITE_USDC_MINT',
      'VITE_MERCHANT_ADDRESS',
      'VITE_USDC_DECIMALS',
      'VITE_CLUSTER_SIMULATION',
    ] as const;

    return required.filter((key) => {
      const value = import.meta.env[key];
      return typeof value !== 'string' || value.trim().length === 0;
    });
  }, []);

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
          {missingEnv.length > 0 ? (
            <p style={{ marginTop: 12, color: '#b91c1c' }}>
              Missing required env vars: <code>{missingEnv.join(', ')}</code>. Set them in <code>.env</code> (see{' '}
              <code>.env.example</code>).
            </p>
          ) : null}

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
