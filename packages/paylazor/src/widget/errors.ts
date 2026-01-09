export type PaylazorErrorCode =
  | 'CONFIG_INVALID'
  | 'WALLET_NOT_CONNECTED'
  | 'AMOUNT_INVALID'
  | 'INSUFFICIENT_FUNDS'
  | 'TRANSFER_BUILD_FAILED'
  | 'PAYMENT_FAILED';

export type PaylazorCheckoutResult = {
  signature: string;
};

export type PaylazorError = {
  code: PaylazorErrorCode;
  message: string;
  cause?: unknown;
};

export function paylazorError(code: PaylazorErrorCode, message: string, cause?: unknown): PaylazorError {
  return { code, message, cause };
}
