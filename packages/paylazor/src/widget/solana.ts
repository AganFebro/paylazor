import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';

export type BuildUsdcTransferArgs = {
  payer?: PublicKey;
  owner: PublicKey;
  recipient: PublicKey;
  usdcMint: PublicKey;
  amountBaseUnits: bigint;
  decimals: number;
  autoCreateAtas: 'none' | 'recipient' | 'both';
};

export function buildUsdcTransferInstructions(args: BuildUsdcTransferArgs): {
  fromAta: PublicKey;
  toAta: PublicKey;
  instructions: TransactionInstruction[];
} {
  const { payer, owner, recipient, usdcMint, amountBaseUnits, decimals, autoCreateAtas } = args;

  // LazorKit smart wallets are typically PDAs (off-curve), so we must allow off-curve owners.
  const fromAta = getAssociatedTokenAddressSync(usdcMint, owner, true);
  const toAta = getAssociatedTokenAddressSync(usdcMint, recipient, true);

  const instructions: TransactionInstruction[] = [];

  if (autoCreateAtas === 'both') {
    if (!payer) throw new Error('payer is required when autoCreateAtas="both"');
    instructions.push(createAssociatedTokenAccountIdempotentInstruction(payer, fromAta, owner, usdcMint));
    instructions.push(createAssociatedTokenAccountIdempotentInstruction(payer, toAta, recipient, usdcMint));
  } else if (autoCreateAtas === 'recipient') {
    if (!payer) throw new Error('payer is required when autoCreateAtas="recipient"');
    instructions.push(createAssociatedTokenAccountIdempotentInstruction(payer, toAta, recipient, usdcMint));
  }

  instructions.push(createTransferCheckedInstruction(fromAta, usdcMint, toAta, owner, amountBaseUnits, decimals));

  return { fromAta, toAta, instructions };
}
