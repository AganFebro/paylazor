import type { PaylazorConfig } from './types';

export const DEFAULT_PAYLAZOR_CONFIG: PaylazorConfig = {
  rpcUrl: 'https://api.devnet.solana.com',
  portalUrl: 'https://portal.lazor.sh',
  paymasterUrl: 'https://kora.devnet.lazorkit.com',
  usdcMint: 'USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT',
  merchantAddress: '7MWBWrYEeLVqd6jpGAdbhzxdAF8oEAakjUej6cp9kPvP',
  usdcDecimals: 6,
  clusterSimulation: 'devnet',
};

