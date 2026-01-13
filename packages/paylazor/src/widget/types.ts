import type { PaylazorError } from './errors';

export type PaylazorAutoCreateAtas = 'none' | 'recipient' | 'both';

export type PaylazorTheme = 'system' | 'default' | 'dark' | 'midnight';

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
  /**
   * Visual theme for the widget.
   * - `system` (default): follows the user's `prefers-color-scheme`
   * - `default`: always light
   * - `dark`: neutral dark
   * - `midnight`: dark blue/purple
   */
  theme?: PaylazorTheme;
  /**
   * When enabled, shows extra diagnostic fields like recipient and ATA addresses.
   */
  debug?: boolean;
  onSuccess?: (result: { signature: string }) => void;
  onError?: (error: PaylazorError) => void;
};
