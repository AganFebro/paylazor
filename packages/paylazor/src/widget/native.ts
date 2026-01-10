import { SystemProgram, type PublicKey, type TransactionInstruction } from '@solana/web3.js';

export function buildSolTransferInstruction(args: {
  from: PublicKey;
  to: PublicKey;
  lamports: bigint;
}): TransactionInstruction {
  const lamportsNumber = safeBigIntToNumber(args.lamports, 'lamports');
  return SystemProgram.transfer({
    fromPubkey: args.from,
    toPubkey: args.to,
    lamports: lamportsNumber,
  });
}

function safeBigIntToNumber(value: bigint, label: string): number {
  if (value < 0n) throw new Error(`${label} must be >= 0`);
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  if (value > max) throw new Error(`${label} is too large`);
  return Number(value);
}

