import type { PaylazorError } from './errors';

export type PaylazorAutoCreateAtas = 'none' | 'recipient' | 'both';

export type PaylazorConfig = {
  rpcUrl: string;
  portalUrl: string;
  paymasterUrl: string;
  usdcMint: string;
  merchantAddress: string;
  usdcDecimals: number;
  clusterSimulation: 'devnet' | 'mainnet';
  /**
   * Optional URL to a public FAQ page (e.g., your GitHub docs) shown alongside errors.
   */
  errorFaqUrl?: string;
};

export type PaylazorCheckoutProps = {
  amount: string;
  recipient?: string;
  memo?: string;
  config?: Partial<PaylazorConfig>;
  autoCreateAtas?: PaylazorAutoCreateAtas;
  onSuccess?: (result: { signature: string }) => void;
  onError?: (error: PaylazorError) => void;
};
