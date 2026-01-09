import { paylazorError } from './errors';
import type { PaylazorError } from './errors';

export function parseFixedDecimalToBigInt(input: string, decimals: number): bigint | PaylazorError {
  const trimmed = input.trim();
  if (!trimmed) return paylazorError('AMOUNT_INVALID', 'Amount is required');
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return paylazorError('AMOUNT_INVALID', 'Amount must be a positive decimal string');

  const [whole, frac = ''] = trimmed.split('.');
  if (frac.length > decimals) return paylazorError('AMOUNT_INVALID', `Amount has too many decimal places (max ${decimals})`);

  const fracPadded = frac.padEnd(decimals, '0');
  const normalized = `${whole}${fracPadded}`.replace(/^0+/, '') || '0';
  try {
    return BigInt(normalized);
  } catch (cause) {
    return paylazorError('AMOUNT_INVALID', 'Amount is invalid', cause);
  }
}

export function formatFixedDecimal(amountBaseUnits: bigint, decimals: number): string {
  const sign = amountBaseUnits < 0n ? '-' : '';
  const x = amountBaseUnits < 0n ? -amountBaseUnits : amountBaseUnits;
  const s = x.toString();
  const whole = s.length > decimals ? s.slice(0, s.length - decimals) : '0';
  const frac = s.length > decimals ? s.slice(s.length - decimals) : s.padStart(decimals, '0');
  const fracTrimmed = frac.replace(/0+$/, '');
  return fracTrimmed ? `${sign}${whole}.${fracTrimmed}` : `${sign}${whole}`;
}

