import { useEffect, useMemo, useState } from 'react';
import { PaylazorCheckout } from '@febro28/paylazor';
import type { PaylazorAutoCreateAtas, PaylazorTheme } from '@febro28/paylazor';
import { getMissingPaylazorEnv, paylazorConfig } from './paylazorConfig';

const DEFAULT_AMOUNT = '1.00';

export default function App() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [theme, setTheme] = useState<PaylazorTheme>('system');
  const [debug, setDebug] = useState<boolean>(false);
  const [autoCreateAtas, setAutoCreateAtas] = useState<PaylazorAutoCreateAtas>('both');
  const [useCustomRecipient, setUseCustomRecipient] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<string>('');
  const [useCustomMemo, setUseCustomMemo] = useState<boolean>(false);
  const [memo, setMemo] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [configFromEnv, setConfigFromEnv] = useState<boolean>(true);
  const [activeSnippetFile, setActiveSnippetFile] = useState<string>('App.tsx');

  const missingEnv = useMemo(() => getMissingPaylazorEnv(), []);

  useEffect(() => {
    if (!configFromEnv) setActiveSnippetFile('App.tsx');
  }, [configFromEnv]);

  const snippetFiles = useMemo(() => {
    const recipientTrimmed = recipient.trim();
    const effectiveRecipient = useCustomRecipient && recipientTrimmed.length > 0 ? recipientTrimmed : null;
    const recipientExpr = useCustomRecipient
      ? JSON.stringify(effectiveRecipient ?? '<RECIPIENT_PUBLIC_KEY>')
      : null;

    const memoTrimmed = memo.trim();
    const effectiveMemo = useCustomMemo && memoTrimmed.length > 0 ? memoTrimmed : null;
    const memoExpr = useCustomMemo ? JSON.stringify(effectiveMemo ?? '<OPTIONAL_MEMO>') : null;

    const widget = [
      '<PaylazorCheckout',
      `  amount=${JSON.stringify(amount)}`,
      '  config={paylazorConfig}',
      `  theme=${JSON.stringify(theme)}`,
      `  debug={${debug}}`,
      `  autoCreateAtas=${JSON.stringify(autoCreateAtas)}`,
      useCustomRecipient
        ? `  recipient=${recipientExpr}`
        : '  recipient={paylazorConfig.merchantAddress /* default */}',
      ...(useCustomMemo ? [`  memo=${memoExpr}`] : []),
      "  onSuccess={({ signature }) => console.log('Paid:', signature)}",
      "  onError={(error) => console.error('Paylazor error:', error)}",
      '/>',
    ].join('\n');

    if (configFromEnv) {
      const configFile = `import type { PaylazorConfig } from '@febro28/paylazor';

export const paylazorConfig = {
  rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL,
  portalUrl: import.meta.env.VITE_LAZORKIT_PORTAL_URL,
  paymasterUrl: import.meta.env.VITE_LAZORKIT_PAYMASTER_URL,
  usdcMint: import.meta.env.VITE_USDC_MINT,
  merchantAddress: import.meta.env.VITE_MERCHANT_ADDRESS,
  usdcDecimals: Number(import.meta.env.VITE_USDC_DECIMALS),
  clusterSimulation: import.meta.env.VITE_CLUSTER_SIMULATION as PaylazorConfig['clusterSimulation'],
} satisfies Partial<PaylazorConfig>;
`;

      const appFile = `import { PaylazorCheckout } from '@febro28/paylazor';
import { paylazorConfig } from './paylazorConfig';

export default function App() {
  return (
${indent(widget, 4)}
  );
}
`;

      return [
        { name: 'paylazorConfig.ts', content: configFile },
        { name: 'App.tsx', content: appFile },
      ];
    }

    const appFile = `import { PaylazorCheckout } from '@febro28/paylazor';
import type { PaylazorConfig } from '@febro28/paylazor';

const paylazorConfig = {
  rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL,
  portalUrl: import.meta.env.VITE_LAZORKIT_PORTAL_URL,
  paymasterUrl: import.meta.env.VITE_LAZORKIT_PAYMASTER_URL,
  usdcMint: import.meta.env.VITE_USDC_MINT,
  merchantAddress: import.meta.env.VITE_MERCHANT_ADDRESS,
  usdcDecimals: Number(import.meta.env.VITE_USDC_DECIMALS),
  clusterSimulation: import.meta.env.VITE_CLUSTER_SIMULATION as PaylazorConfig['clusterSimulation'],
} satisfies Partial<PaylazorConfig>;

export default function App() {
  return (
${indent(widget, 4)}
  );
}
`;

    return [{ name: 'App.tsx', content: appFile }];
  }, [amount, autoCreateAtas, configFromEnv, debug, memo, recipient, theme, useCustomMemo, useCustomRecipient]);

  const activeSnippet = useMemo(() => {
    const fallback = snippetFiles.find((file) => file.name === 'App.tsx') ?? snippetFiles[0] ?? null;
    if (!fallback) return null;
    return snippetFiles.find((file) => file.name === activeSnippetFile) ?? fallback;
  }, [activeSnippetFile, snippetFiles]);

  async function copySnippet() {
    try {
      if (!activeSnippet) return;
      await navigator.clipboard.writeText(activeSnippet.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch (err) {
      console.error('Failed to copy snippet:', err);
    }
  }

  function indent(text: string, spaces: number): string {
    const prefix = ' '.repeat(spaces);
    return text
      .split('\n')
      .map((line) => `${prefix}${line}`)
      .join('\n');
  }

  return (
    <div className="page">
      <header className="header">
        <div className="headerRow">
          <div>
            <h1>Paylazor Demo</h1>
            <p>Minimal demo showcasing the `paylazor` widget (Devnet).</p>
          </div>

          <div className="headerLinks">
            <a className="iconLink" href="https://github.com/AganFebro/paylazor" target="_blank" rel="noreferrer" aria-label="Paylazor GitHub">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 .5C5.73.5.75 5.6.75 12c0 5.13 3.19 9.48 7.62 11.01.56.1.77-.25.77-.55 0-.27-.01-1.17-.01-2.13-3.1.69-3.75-1.35-3.75-1.35-.5-1.33-1.23-1.68-1.23-1.68-1-.71.08-.7.08-.7 1.1.08 1.68 1.16 1.68 1.16.98 1.7 2.57 1.21 3.2.92.1-.73.38-1.21.69-1.49-2.48-.29-5.09-1.27-5.09-5.66 0-1.25.43-2.27 1.14-3.07-.11-.29-.5-1.46.11-3.04 0 0 .93-.3 3.05 1.17a10.2 10.2 0 0 1 2.78-.39c.94 0 1.89.13 2.78.39 2.12-1.47 3.05-1.17 3.05-1.17.61 1.58.22 2.75.11 3.04.71.8 1.14 1.82 1.14 3.07 0 4.4-2.62 5.37-5.11 5.66.39.35.74 1.03.74 2.08 0 1.5-.01 2.7-.01 3.07 0 .3.2.66.77.55A11.27 11.27 0 0 0 23.25 12C23.25 5.6 18.27.5 12 .5Z"
                />
              </svg>
              <span>GitHub</span>
            </a>
            <a
              className="iconLink"
              href="https://www.npmjs.com/package/@febro28/paylazor"
              target="_blank"
              rel="noreferrer"
              aria-label="Paylazor on npm"
            >
              <svg viewBox="0 0 780 250" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M0 0v250h780V0H0zm65 200V65h195v135h65V65h65v200H65zm390-135V65h260v135h-65V130h-65v70h-130V65z"
                />
              </svg>
              <span>npm</span>
            </a>
          </div>
        </div>
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

            <label className="label">
              Theme
              <select className="input" value={theme} onChange={(e) => setTheme(e.target.value as PaylazorTheme)}>
                <option value="system">System</option>
                <option value="default">Default (light)</option>
                <option value="dark">Dark</option>
                <option value="midnight">Midnight</option>
              </select>
            </label>

            <label className="label" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={debug} onChange={(e) => setDebug(e.target.checked)} />
              Debug (show recipient + ATA)
            </label>

            <label className="label" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={configFromEnv} onChange={(e) => setConfigFromEnv(e.target.checked)} />
              Config in paylazorConfig.ts
            </label>

            <label className="label">
              autoCreateAtas
              <select
                className="input"
                value={autoCreateAtas}
                onChange={(e) => setAutoCreateAtas(e.target.value as PaylazorAutoCreateAtas)}
              >
                <option value="both">both</option>
                <option value="recipient">recipient</option>
                <option value="none">none</option>
              </select>
            </label>

            <label className="label" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={useCustomRecipient} onChange={(e) => setUseCustomRecipient(e.target.checked)} />
              Override recipient
            </label>
            {useCustomRecipient ? (
              <label className="label">
                Recipient address
                <input
                  className="input"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Solana public key"
                />
              </label>
            ) : null}

            <label className="label" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={useCustomMemo} onChange={(e) => setUseCustomMemo(e.target.checked)} />
              Include memo
            </label>
            {useCustomMemo ? (
              <label className="label">
                Memo
                <input className="input" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Optional memo" />
              </label>
            ) : null}
          </section>

          <details className="card fold" open>
            <summary className="foldSummary">
              <span className="foldTitle">How to test</span>
              <span className="foldChevron" aria-hidden="true" />
            </summary>
            <div className="foldContent">
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
            </div>
          </details>

          <details className="card fold">
            <summary className="foldSummary">
              <span className="foldTitle">Known error</span>
              <span className="foldChevron" aria-hidden="true" />
            </summary>
            <div className="foldContent">
              <p>
                Please refer to GitHub{' '}
                <a href="https://github.com/AganFebro/paylazor" target="_blank" rel="noreferrer">
                  https://github.com/AganFebro/paylazor
                </a>{' '}
                for more information.
              </p>
              <ul>
                <li>Transaction too large: please refresh and try the payment again.</li>
                <li>Transaction error 0x2: please create a new passkey wallet.</li>
              </ul>
            </div>
          </details>
        </div>

        <aside className="stack">
          <section>
            <PaylazorCheckout
              amount={amount}
              config={paylazorConfig}
              theme={theme}
              debug={debug}
              autoCreateAtas={autoCreateAtas}
              recipient={useCustomRecipient && recipient.trim().length > 0 ? recipient.trim() : undefined}
              memo={useCustomMemo && memo.trim().length > 0 ? memo.trim() : undefined}
              onSuccess={({ signature }) => console.log('Paid:', signature)}
              onError={(error) => console.error('Paylazor error:', error)}
            />
          </section>

          <details className="card fold" open>
            <summary className="foldSummary">
              <span className="foldTitle">Code snippet</span>
              <span className="foldChevron" aria-hidden="true" />
            </summary>
            <div className="foldContent">
              <p>Live-updating snippet based on your current widget settings.</p>

              <div className="codeHeader">
                <div className="tabRow" role="tablist" aria-label="Snippet files">
                  {snippetFiles.map((file) => {
                    const isActive = activeSnippet?.name === file.name;
                    return (
                      <button
                        key={file.name}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={isActive ? 'tabButton tabButtonActive' : 'tabButton'}
                        onClick={() => setActiveSnippetFile(file.name)}
                      >
                        {file.name}
                      </button>
                    );
                  })}
                </div>

                <button className="copyButton" type="button" onClick={copySnippet} disabled={!activeSnippet}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <pre className="codeBlock">
                <code>{activeSnippet?.content ?? ''}</code>
              </pre>
            </div>
          </details>
        </aside>
      </main>
    </div>
  );
}
