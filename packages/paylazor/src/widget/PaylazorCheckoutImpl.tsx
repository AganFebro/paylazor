import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { LazorkitProvider, Paymaster, useWallet } from '@lazorkit/wallet';
import { createAssociatedTokenAccountIdempotentInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';

import { resolvePaylazorConfig } from './config';
import { paylazorError, type PaylazorError } from './errors';
import type { PaylazorCheckoutProps, PaylazorConfig, PaylazorAutoCreateAtas, PaylazorTheme } from './types';
import { buildUsdcTransferInstructions } from './solana';
import { formatFixedDecimal, parseFixedDecimalToBigInt } from './units';

type Step = 'idle' | 'connecting' | 'confirm' | 'paying' | 'success' | 'error';

function isPaylazorError(value: unknown): value is PaylazorError {
  return (
    !!value &&
    typeof value === 'object' &&
    'code' in value &&
    typeof (value as { code?: unknown }).code === 'string' &&
    'message' in value &&
    typeof (value as { message?: unknown }).message === 'string'
  );
}

function safePublicKey(input: string, label: string): PublicKey | PaylazorError {
  try {
    return new PublicKey(input);
  } catch (cause) {
    return paylazorError('CONFIG_INVALID', `Invalid ${label}`, cause);
  }
}

export default function PaylazorCheckoutImpl(props: PaylazorCheckoutProps) {
  const {
    amount,
    recipient,
    memo,
    config: configOverrides,
    autoCreateAtas = 'both',
    theme,
    debug,
    onSuccess,
    onError,
  } = props;

  const themeAttr: PaylazorTheme = theme ?? 'system';
  const isDebug = debug === true;

  const configOrError = useMemo(() => resolvePaylazorConfig(configOverrides), [configOverrides]);
  const configError = useMemo<PaylazorError | null>(
    () => (isPaylazorError(configOrError) ? configOrError : null),
    [configOrError]
  );
  const config = useMemo<PaylazorConfig | null>(() => (isPaylazorError(configOrError) ? null : configOrError), [configOrError]);
  const [step, setStep] = useState<Step>('idle');
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<PaylazorError | null>(null);
  const [lastPortalError, setLastPortalError] = useState<{ error: string; details?: string } | null>(null);
  const lastPortalErrorRef = useRef<{ error: string; details?: string } | null>(null);

  useEffect(() => {
    if (!config) return;
    const portalHost = safeHost(config.portalUrl);
    function onMessage(event: MessageEvent) {
      let originHost: string;
      try {
        originHost = new URL(event.origin).host;
      } catch {
        return;
      }
      if (originHost !== portalHost) return;

      let data: unknown = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data) as unknown;
        } catch {
          return;
        }
      }
      if (!data || typeof data !== 'object') return;

      const maybeError =
        (data as { error?: unknown; message?: unknown; reason?: unknown }).error ??
        (data as { message?: unknown }).message ??
        (data as { reason?: unknown }).reason;
      const errorText =
        typeof maybeError === 'string'
          ? maybeError
          : typeof maybeError === 'object' && maybeError && 'message' in maybeError && typeof (maybeError as any).message === 'string'
            ? (maybeError as any).message
            : null;
      if (!errorText || errorText.trim().length === 0) return;

      const maybeDetails =
        (data as { details?: unknown; stack?: unknown }).details ?? (data as { stack?: unknown }).stack;
      const portalError = {
        error: errorText,
        details: typeof maybeDetails === 'string' && maybeDetails.trim().length > 0 ? maybeDetails : undefined,
      };
      lastPortalErrorRef.current = portalError;
      setLastPortalError(portalError);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [config]);

  useEffect(() => {
    if (!configError) return;
    onError?.(configError);
  }, [configError, onError]);

  if (!config) {
    const shownError = configError ?? paylazorError('CONFIG_INVALID', 'Missing required configuration.');
    return (
      <div className="paylazor-root" data-theme={themeAttr}>
        <div className="paylazor-card">
          <p className="paylazor-title">Pay with Solana (USDC)</p>
          <p className="paylazor-sub">Missing required configuration.</p>
          <div className="paylazor-error">
            <div style={{ fontWeight: 650, marginBottom: 4 }}>{shownError.code}</div>
            <div>{shownError.message}</div>
            <div style={{ marginTop: 6 }}>
              {configOverrides?.errorFaqUrl ? (
                <a href={configOverrides.errorFaqUrl} target="_blank" rel="noreferrer">
                  See GitHub for error FAQ
                </a>
              ) : (
                <span>See GitHub for error FAQ</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LazorkitProvider
      rpcUrl={config.rpcUrl}
      portalUrl={config.portalUrl}
      paymasterConfig={{ paymasterUrl: config.paymasterUrl }}
    >
      <PaylazorCheckoutInner
        amount={amount}
        recipient={recipient}
        memo={memo}
        config={config}
        themeAttr={themeAttr}
        debug={isDebug}
        autoCreateAtas={autoCreateAtas}
        step={step}
        setStep={setStep}
        signature={signature}
        setSignature={setSignature}
        error={error}
        lastPortalError={lastPortalError}
        clearLastPortalError={() => {
          lastPortalErrorRef.current = null;
          setLastPortalError(null);
        }}
        getLastPortalError={() => lastPortalErrorRef.current}
        setError={(e) => {
          setError(e);
          if (e) onError?.(e);
        }}
        onSuccess={(sig) => {
          setSignature(sig);
          onSuccess?.({ signature: sig });
        }}
      />
    </LazorkitProvider>
  );
}

function PaylazorCheckoutInner(args: {
  amount: string;
  recipient?: string;
  memo?: string;
  config: PaylazorConfig;
  themeAttr: PaylazorTheme;
  debug: boolean;
  autoCreateAtas: PaylazorAutoCreateAtas;
  step: Step;
  setStep: (s: Step) => void;
  signature: string | null;
  setSignature: (s: string | null) => void;
  error: PaylazorError | null;
  lastPortalError: { error: string; details?: string } | null;
  clearLastPortalError: () => void;
  getLastPortalError: () => { error: string; details?: string } | null;
  setError: (e: PaylazorError | null) => void;
  onSuccess: (sig: string) => void;
}) {
  const { smartWalletPubkey, isConnected, isLoading, wallet, connect, disconnect, signAndSendTransaction } = useWallet();

  const recipientAddress = args.recipient || args.config.merchantAddress;
  const walletAddress = smartWalletPubkey?.toBase58() ?? null;
  const usdcAtaAddress = useMemo(() => {
    if (!smartWalletPubkey) return null;
    try {
      const mint = new PublicKey(args.config.usdcMint);
      return getAssociatedTokenAddressSync(mint, smartWalletPubkey, true).toBase58();
    } catch {
      return null;
    }
  }, [args.config.usdcMint, smartWalletPubkey]);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [usdcBalanceBaseUnits, setUsdcBalanceBaseUnits] = useState<bigint | null>(null);
  const [usdcAtaStatus, setUsdcAtaStatus] = useState<'unknown' | 'missing' | 'present'>('unknown');
  const [lastRecipientAtaMissing, setLastRecipientAtaMissing] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  const amountBaseUnitsOrError = useMemo(() => parseFixedDecimalToBigInt(args.amount, args.config.usdcDecimals), [
    args.amount,
    args.config.usdcDecimals,
  ]);

  const amountBaseUnits = typeof amountBaseUnitsOrError === 'bigint' ? amountBaseUnitsOrError : null;
  const amountError = typeof amountBaseUnitsOrError === 'bigint' ? null : amountBaseUnitsOrError;

  const canPay = isConnected && !!smartWalletPubkey && !!amountBaseUnits && amountBaseUnits > 0n;

  useEffect(() => {
    if (args.step !== 'idle') return;
    if (isConnected) args.setStep('confirm');
  }, [args.step, args.setStep, isConnected]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!smartWalletPubkey) return;
    try {
      const connection = new Connection(args.config.rpcUrl);
      const mint = new PublicKey(args.config.usdcMint);
      const ata = getAssociatedTokenAddressSync(mint, smartWalletPubkey, true);
      const res = await connection.getTokenAccountBalance(ata);
      if (!mountedRef.current) return;
      const uiAmount = res.value.uiAmountString ?? res.value.amount;
      setUsdcBalance(uiAmount);
      setUsdcBalanceBaseUnits(BigInt(res.value.amount));
      setUsdcAtaStatus('present');
    } catch {
      try {
        const connection = new Connection(args.config.rpcUrl);
        const mint = new PublicKey(args.config.usdcMint);
        const ata = getAssociatedTokenAddressSync(mint, smartWalletPubkey, true);
        const info = await connection.getAccountInfo(ata);
        if (!mountedRef.current) return;
        if (!info) {
          setUsdcBalance('0');
          setUsdcBalanceBaseUnits(0n);
          setUsdcAtaStatus('missing');
          return;
        }
      } catch {
        // ignore
      }
      if (!mountedRef.current) return;
      setUsdcBalance(null);
      setUsdcBalanceBaseUnits(null);
      setUsdcAtaStatus('unknown');
    }
  }, [args.config.rpcUrl, args.config.usdcMint, smartWalletPubkey]);

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

  async function handleConnect() {
    args.clearLastPortalError();
    args.setError(null);
    args.setStep('connecting');
    try {
      const walletInfo = await connect({ feeMode: 'paymaster' });
      const smartWalletPubkey = safePublicKey(walletInfo.smartWallet, 'smart wallet address');
      if (!isPaylazorError(smartWalletPubkey)) {
        await waitForAccount({
          rpcUrl: args.config.rpcUrl,
          pubkey: smartWalletPubkey,
          timeoutMs: 15_000,
        });
      }
      args.setStep('confirm');
    } catch (cause) {
      args.setError(paylazorError('PAYMENT_FAILED', 'Failed to connect with passkey portal', cause));
      args.setStep('error');
    }
  }

  async function handleDisconnect() {
    args.setError(null);
    try {
      await disconnect();
      args.setSignature(null);
      args.setStep('idle');
    } catch (cause) {
      args.setError(paylazorError('PAYMENT_FAILED', 'Failed to disconnect', cause));
      args.setStep('error');
    }
  }

  async function handlePay() {
    args.clearLastPortalError();
    args.setError(null);
    args.setStep('paying');
    setLastRecipientAtaMissing(false);

    if (!smartWalletPubkey) {
      args.setError(paylazorError('WALLET_NOT_CONNECTED', 'Wallet is not connected'));
      args.setStep('error');
      return;
    }
    if (!hasValidWalletSession(wallet)) {
      try {
        await disconnect();
      } catch {
        // ignore disconnect errors; we still want to ask the user to reconnect
      }
      args.setError(
        paylazorError(
          'PAYMENT_FAILED',
          'Wallet session is missing required metadata. Please reconnect with passkey.',
          wallet
        )
      );
      args.setStep('idle');
      return;
    }
    if (!amountBaseUnits || amountBaseUnits <= 0n) {
      args.setError(amountError || paylazorError('AMOUNT_INVALID', 'Amount must be greater than 0'));
      args.setStep('error');
      return;
    }
    if (usdcBalanceBaseUnits !== null && usdcBalanceBaseUnits < amountBaseUnits) {
      const balanceText = usdcBalance ?? '0';
      args.setError(
        paylazorError(
          'INSUFFICIENT_FUNDS',
          `Insufficient USDC balance (have ${balanceText}, need ${args.amount}). Fund the USDC ATA and retry.`
        )
      );
      args.setStep('error');
      return;
    }

    const mintOrError = safePublicKey(args.config.usdcMint, 'USDC mint');
    if (isPaylazorError(mintOrError)) {
      args.setError(mintOrError);
      args.setStep('error');
      return;
    }

    const recipientOrError = safePublicKey(recipientAddress, 'merchant address');
    if (isPaylazorError(recipientOrError)) {
      args.setError(recipientOrError);
      args.setStep('error');
      return;
    }

    const fromAta = getAssociatedTokenAddressSync(mintOrError, smartWalletPubkey, true);
    const toAta = getAssociatedTokenAddressSync(mintOrError, recipientOrError, true);

    try {
      const connection = new Connection(args.config.rpcUrl);
      const [fromInfo, toInfo] = await connection.getMultipleAccountsInfo([fromAta, toAta]);

      if (!fromInfo && args.autoCreateAtas !== 'both') {
        args.setError(
          paylazorError(
            'PAYMENT_FAILED',
            'USDC token account for this wallet is missing. Set autoCreateAtas="both" (or create/fund the ATA) and retry.'
          )
        );
        args.setStep('error');
        return;
      }
      if (!toInfo && args.autoCreateAtas === 'none') {
        setLastRecipientAtaMissing(true);
        args.setError(
          paylazorError(
            'PAYMENT_FAILED',
            'Recipient USDC token account is missing. Set autoCreateAtas="recipient" (or "both") and retry.'
          )
        );
        args.setStep('error');
        return;
      }

      const shouldCreateFromAta = !fromInfo && args.autoCreateAtas === 'both';
      const shouldCreateToAta = !toInfo && (args.autoCreateAtas === 'both' || args.autoCreateAtas === 'recipient');

      if (shouldCreateFromAta || shouldCreateToAta) {
        const paymaster = new Paymaster({ paymasterUrl: args.config.paymasterUrl });
        const payer = await paymaster.getPayer();
        const tx = new Transaction();
        tx.feePayer = payer;
        tx.recentBlockhash = await paymaster.getBlockhash();
        if (shouldCreateFromAta) {
          tx.add(createAssociatedTokenAccountIdempotentInstruction(payer, fromAta, smartWalletPubkey, mintOrError));
        }
        if (shouldCreateToAta) {
          tx.add(createAssociatedTokenAccountIdempotentInstruction(payer, toAta, recipientOrError, mintOrError));
        }
        await paymaster.signAndSend(tx);
        await Promise.all([
          shouldCreateFromAta ? waitForAccount({ rpcUrl: args.config.rpcUrl, pubkey: fromAta, timeoutMs: 15_000 }) : null,
          shouldCreateToAta ? waitForAccount({ rpcUrl: args.config.rpcUrl, pubkey: toAta, timeoutMs: 15_000 }) : null,
        ]);
        await refreshBalance();
      }
    } catch (cause) {
      args.setError(paylazorError('PAYMENT_FAILED', 'Failed to prepare token accounts via paymaster', cause));
      args.setStep('error');
      return;
    }

    let instructions: ReturnType<typeof buildUsdcTransferInstructions>['instructions'];
    try {
      ({ instructions } = buildUsdcTransferInstructions({
        payer: undefined,
        owner: smartWalletPubkey,
        recipient: recipientOrError,
        usdcMint: mintOrError,
        amountBaseUnits,
        decimals: args.config.usdcDecimals,
        autoCreateAtas: 'none',
      }));
    } catch (cause) {
      args.setError(paylazorError('TRANSFER_BUILD_FAILED', 'Failed to build USDC transfer', cause));
      args.setStep('error');
      return;
    }

    try {
      const sig = await retry(() => signAndSendTransactionCompat(signAndSendTransaction, instructions, args.config.clusterSimulation), {
        retries: 2,
        delayMs: 800,
        shouldRetry: (e) => isPossiblyUninitializedWalletError(e),
      });
      args.onSuccess(sig);
      args.setStep('success');
    } catch (cause) {
      if (isInvalidSessionError(cause)) {
        try {
          await disconnect();
        } catch {
          // ignore
        }
        args.setError(
          paylazorError(
            'PAYMENT_FAILED',
            'Wallet session is invalid. Please reconnect with passkey and try again.',
            cause
          )
        );
        args.setStep('idle');
        return;
      }
      const portalError = args.getLastPortalError();
      const portalHint = portalError
        ? `Portal error: ${portalError.error}${portalError.details ? ` (${portalError.details})` : ''}`
        : null;
      const underlying = formatUnderlyingError(cause);
      if (portalHint && (cause instanceof Error ? cause.message : String(cause)).toLowerCase().includes('sign')) {
        args.setError(
          paylazorError('PAYMENT_FAILED', `Signing failed. ${portalHint}${underlying ? ` (${underlying})` : ''}`, cause)
        );
        args.setStep('error');
        return;
      }
      args.setError(
        paylazorError(
          'PAYMENT_FAILED',
          `${portalHint ? `Payment failed. ${portalHint}` : 'Payment failed'}${underlying ? ` (${underlying})` : ''}`,
          cause
        )
      );
      args.setStep('error');
    }
  }

  const displayAmount = amountBaseUnits ? formatFixedDecimal(amountBaseUnits, args.config.usdcDecimals) : args.amount;

  return (
    <div className="paylazor-root" data-theme={args.themeAttr}>
      <div className="paylazor-card">
        <p className="paylazor-title">Pay with Solana (USDC)</p>
        <p className="paylazor-sub">Passkey checkout powered by LazorKit. Default network: Devnet.</p>

        <div className="paylazor-row">
          <span className="paylazor-label">Amount</span>
          <span className="paylazor-value">{displayAmount} USDC</span>
        </div>
        {args.debug ? (
          <div className="paylazor-row">
            <span className="paylazor-label">Recipient</span>
            <span className="paylazor-value paylazor-mono">{recipientAddress}</span>
          </div>
        ) : null}
        {walletAddress ? (
          <div className="paylazor-row">
            <span className="paylazor-label">Wallet</span>
            <span className="paylazor-value paylazor-mono">{walletAddress}</span>
          </div>
        ) : null}
        {args.debug && usdcAtaAddress ? (
          <div className="paylazor-row">
            <span className="paylazor-label">USDC ATA</span>
            <span className="paylazor-value paylazor-mono">{usdcAtaAddress}</span>
          </div>
        ) : null}
        {usdcBalance !== null ? (
          <div className="paylazor-row">
            <span className="paylazor-label">USDC Balance</span>
            <span className="paylazor-value">{usdcBalance}</span>
          </div>
        ) : null}
        {usdcAtaStatus === 'missing' && usdcAtaAddress ? (
          <div className="paylazor-error">
            USDC token account not found. Create the wallet’s USDC token account, then fund it with USDC.
            {args.debug && usdcAtaAddress ? (
              <div className="paylazor-mono" style={{ marginTop: 6 }}>
                {usdcAtaAddress}
              </div>
            ) : null}
          </div>
        ) : null}
        {lastRecipientAtaMissing ? (
          <div className="paylazor-error">Recipient USDC token account not found. Ask the merchant to create their USDC ATA.</div>
        ) : null}
        {args.memo ? (
          <div className="paylazor-row">
            <span className="paylazor-label">Memo</span>
            <span className="paylazor-value paylazor-mono">{args.memo}</span>
          </div>
        ) : null}

        <div className="paylazor-actions">
          {!isConnected ? (
            <button className="paylazor-btn paylazor-btnPrimary" onClick={handleConnect} disabled={isLoading} type="button">
              {args.step === 'connecting' ? 'Connecting…' : 'Continue with passkey'}
            </button>
          ) : (
            <>
              <button
                className="paylazor-btn paylazor-btnPrimary"
                onClick={handlePay}
                disabled={!canPay || isLoading || !!amountError}
                type="button"
              >
                {args.step === 'paying' ? 'Paying…' : 'Pay now'}
              </button>
              <button className="paylazor-btn" onClick={handleDisconnect} disabled={isLoading} type="button">
                Disconnect
              </button>
            </>
          )}
        </div>

        {amountError ? <div className="paylazor-error">{amountError.message}</div> : null}

        {args.error ? (
          <div className="paylazor-error">
            <div style={{ fontWeight: 650, marginBottom: 4 }}>{args.error.code}</div>
            <div>{args.error.message}</div>
            <div style={{ marginTop: 6 }}>
              {args.config.errorFaqUrl ? (
                <a href={args.config.errorFaqUrl} target="_blank" rel="noreferrer">
                  See GitHub for error FAQ
                </a>
              ) : (
                <span>See GitHub for error FAQ</span>
              )}
            </div>
          </div>
        ) : null}

        {args.step === 'success' && args.signature ? (
          <div className="paylazor-success">
            <div style={{ fontWeight: 650, marginBottom: 4 }}>Payment submitted</div>
            <div className="paylazor-mono">{args.signature}</div>
          </div>
        ) : null}

        <div style={{ marginTop: 12 }}>
          <span className="paylazor-badge">Portal: {safeHost(args.config.portalUrl)}</span>
        </div>
      </div>
    </div>
  );
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function formatUnderlyingError(error: unknown): string | null {
  if (error instanceof Error) {
    const name = typeof error.name === 'string' && error.name.trim().length > 0 ? error.name : 'Error';
    const message = typeof error.message === 'string' && error.message.trim().length > 0 ? error.message : null;
    const cause = (error as { cause?: unknown }).cause;
    const causeText = cause ? formatUnderlyingError(cause) : null;
    const head = name !== 'Error' ? name : null;
    const main = head && message ? `${head}: ${message}` : head || message || null;
    if (main && causeText) return `${main} | cause: ${causeText}`;
    return main;
  }
  if (typeof error === 'string' && error.trim().length > 0) return error;
  return null;
}

async function waitForAccount(args: { rpcUrl: string; pubkey: PublicKey; timeoutMs: number }): Promise<void> {
  const connection = new Connection(args.rpcUrl);
  const startedAt = Date.now();
  while (Date.now() - startedAt < args.timeoutMs) {
    const info = await connection.getAccountInfo(args.pubkey);
    if (info) return;
    await sleep(500);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPossiblyUninitializedWalletError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('lastNonce') ||
    message.includes("reading 'toString'") ||
    message.includes("Cannot read properties of undefined")
  );
}

function isInvalidSessionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('Received type undefined') && message.includes('first argument must be one of type');
}

function hasValidWalletSession(wallet: unknown): boolean {
  if (!wallet || typeof wallet !== 'object') return false;
  const w = wallet as { credentialId?: unknown; passkeyPubkey?: unknown; smartWallet?: unknown };
  if (typeof w.credentialId !== 'string' || w.credentialId.trim().length === 0) return false;
  if (typeof w.smartWallet !== 'string' || w.smartWallet.trim().length === 0) return false;
  if (!Array.isArray(w.passkeyPubkey) || w.passkeyPubkey.length === 0) return false;
  return true;
}

async function retry<T>(
  fn: () => Promise<T>,
  opts: { retries: number; delayMs: number; shouldRetry: (e: unknown) => boolean }
): Promise<T> {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= opts.retries || !opts.shouldRetry(e)) throw e;
      attempt += 1;
      await sleep(opts.delayMs);
    }
  }
}

function signAndSendTransactionCompat(
  signAndSendTransaction: (payload: {
    instructions: any[];
    transactionOptions?: { feeToken?: string; clusterSimulation?: 'devnet' | 'mainnet' };
  }) => Promise<string>,
  instructions: any[],
  clusterSimulation: 'devnet' | 'mainnet'
): Promise<string> {
  return signAndSendTransaction({
    instructions,
    transactionOptions: {
      clusterSimulation,
    },
  });
}
