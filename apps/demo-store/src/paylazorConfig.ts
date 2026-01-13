import type { PaylazorConfig } from '@febro28/paylazor';

export const paylazorConfig = {
  rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL,
  portalUrl: import.meta.env.VITE_LAZORKIT_PORTAL_URL,
  paymasterUrl: import.meta.env.VITE_LAZORKIT_PAYMASTER_URL,
  usdcMint: import.meta.env.VITE_USDC_MINT,
  merchantAddress: import.meta.env.VITE_MERCHANT_ADDRESS,
  usdcDecimals: Number(import.meta.env.VITE_USDC_DECIMALS),
  clusterSimulation: import.meta.env.VITE_CLUSTER_SIMULATION as PaylazorConfig['clusterSimulation'],
} satisfies Partial<PaylazorConfig>;

const REQUIRED_ENV = [
  'VITE_SOLANA_RPC_URL',
  'VITE_LAZORKIT_PORTAL_URL',
  'VITE_LAZORKIT_PAYMASTER_URL',
  'VITE_USDC_MINT',
  'VITE_MERCHANT_ADDRESS',
  'VITE_USDC_DECIMALS',
  'VITE_CLUSTER_SIMULATION',
] as const;

export function getMissingPaylazorEnv(): string[] {
  return REQUIRED_ENV.filter((key) => {
    const value = import.meta.env[key];
    return typeof value !== 'string' || value.trim().length === 0;
  });
}
