import { useMemo, useState } from 'react';
import { PaylazorCheckout } from '@febro28/paylazor';
import type { PaylazorConfig } from '@febro28/paylazor';

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
        <div className="stack">
          <section className="card">
            <h2>Test product</h2>
            <p>USDC payment via LazorKit passkeys + paymaster.</p>
            {missingEnv.length > 0 ? (
              <p className="warning">
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
        </div>

        <aside className="card">
          <h2>How to test</h2>
          <p>If you faced Transaction Too Large error, please try again. It's a known issue with the current implementation.</p>
          <p>Make sure your wallet has some USDC on Devnet.</p>
          <p>
            Devnet USDC mint: <code className="mono">USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT</code>
          </p>
          <p>
            Swap on Raydium (select Devnet in settings):{' '}
            <a
              href="https://raydium.io/swap/?inputCurrency=sol&outputCurrency=4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R&fixed=in&inputMint=sol&outputMint=USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT"
              target="_blank"
              rel="noreferrer"
            >
              Open Raydium swap
            </a>

          
          </p>
        </aside>
      </main>
    </div>
  );
}
