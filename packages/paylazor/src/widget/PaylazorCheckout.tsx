import { Suspense, lazy, useMemo } from 'react';
import { Buffer } from 'buffer';

import type { PaylazorCheckoutProps } from './types';
import { injectPaylazorStyles } from './styles';

export function PaylazorCheckout(props: PaylazorCheckoutProps) {
  ensureBrowserPolyfills();
  injectPaylazorStyles();

  const Impl = useMemo(() => lazy(() => import('./PaylazorCheckoutImpl')), []);
  return (
    <Suspense
      fallback={
        <div className="paylazor-root">
          <div className="paylazor-card">
            <p className="paylazor-title">Pay with Solana (USDC)</p>
            <p className="paylazor-sub">Loading…</p>
          </div>
        </div>
      }
    >
      <Impl {...props} />
    </Suspense>
  );
}

function ensureBrowserPolyfills(): void {
  // LazorKit bundles rely on a couple of Node-ish globals in browser builds.
  // Keep this minimal and non-invasive.
  const g = globalThis as unknown as {
    global?: unknown;
    Buffer?: unknown;
    process?: { env?: Record<string, string> };
  };

  g.global ||= globalThis;
  g.Buffer ||= Buffer;
  g.process ||= { env: {} };
  g.process.env ||= {};
}
