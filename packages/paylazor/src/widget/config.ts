import { paylazorError, type PaylazorError } from './errors';
import type { PaylazorConfig } from './types';

export const DEFAULT_PAYLAZOR_CONFIG = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  paymasterUrl: 'https://kora.devnet.lazorkit.com',
} satisfies Pick<PaylazorConfig, 'rpcUrl' | 'portalUrl' | 'paymasterUrl'>;

function parseUsdcDecimals(input: string): number | PaylazorError {
  const n = Number(input);
  if (!Number.isInteger(n) || n < 0 || n > 18) {
    return paylazorError('CONFIG_INVALID', 'Invalid USDC decimals; must be an integer between 0 and 18');
  }
  return n;
}

function parseClusterSimulation(input: string): 'devnet' | 'mainnet' | PaylazorError {
  if (input === 'devnet' || input === 'mainnet') return input;
  return paylazorError('CONFIG_INVALID', 'Invalid clusterSimulation; must be "devnet" or "mainnet"');
}

export function resolvePaylazorConfig(overrides?: Partial<PaylazorConfig>): PaylazorConfig | PaylazorError {
  const cfg: Partial<PaylazorConfig> = { ...DEFAULT_PAYLAZOR_CONFIG, ...(overrides || {}) };

  const usdcMint = cfg.usdcMint;
  if (!usdcMint) {
    return paylazorError(
      'CONFIG_INVALID',
      'Missing USDC mint. Set config.usdcMint (recommended: load from your app .env).'
    );
  }

  const merchantAddress = cfg.merchantAddress;
  if (!merchantAddress) {
    return paylazorError(
      'CONFIG_INVALID',
      'Missing merchant address. Set config.merchantAddress (recommended: load from your app .env).'
    );
  }

  if (cfg.usdcDecimals === undefined || cfg.usdcDecimals === null) {
    return paylazorError(
      'CONFIG_INVALID',
      'Missing USDC decimals. Set config.usdcDecimals (recommended: load from your app .env).'
    );
  }
  const usdcDecimals = parseUsdcDecimals(String(cfg.usdcDecimals));
  if (typeof usdcDecimals !== 'number') return usdcDecimals;

  if (!cfg.clusterSimulation) {
    return paylazorError(
      'CONFIG_INVALID',
      'Missing cluster simulation. Set config.clusterSimulation (recommended: load from your app .env).'
    );
  }
  const clusterSimulation = parseClusterSimulation(String(cfg.clusterSimulation));
  if (typeof clusterSimulation !== 'string') return clusterSimulation;

  return {
    rpcUrl: String(cfg.rpcUrl),
    portalUrl: String(cfg.portalUrl),
    paymasterUrl: String(cfg.paymasterUrl),
    usdcMint,
    merchantAddress,
    usdcDecimals,
    clusterSimulation,
    errorFaqUrl: typeof cfg.errorFaqUrl === 'string' && cfg.errorFaqUrl.trim().length > 0 ? cfg.errorFaqUrl : undefined,
  };
}
