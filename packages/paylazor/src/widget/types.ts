import type { PaylazorError } from './errors';

export type PaylazorAutoCreateAtas = 'none' | 'recipient' | 'both';

export type PaylazorCurrency = 'USDC' | 'SOL';

export type PaylazorConfig = {
  rpcUrl: string;
  portalUrl: string;
  paymasterUrl: string;
  usdcMint: string;
  merchantAddress: string;
  usdcDecimals: number;
  clusterSimulation: 'devnet' | 'mainnet';
};

export type PaylazorCheckoutProps = {
  amount: string;
  recipient?: string;
  memo?: string;
  config?: Partial<PaylazorConfig>;
  enabledCurrencies?: PaylazorCurrency[];
  defaultCurrency?: PaylazorCurrency;
  onCurrencyChange?: (currency: PaylazorCurrency) => void;
  autoCreateAtas?: PaylazorAutoCreateAtas;
  onSuccess?: (result: { signature: string }) => void;
  onError?: (error: PaylazorError) => void;
};
