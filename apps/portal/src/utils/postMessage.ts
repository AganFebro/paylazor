export function getReferrerOrigin(): string | null {
  try {
    if (!document.referrer) return null;
    return new URL(document.referrer).origin;
  } catch {
    return null;
  }
}

export function getPostMessageTargetOrigin(): string {
  return getReferrerOrigin() ?? '*';
}

export function isAllowedReferrerOrigin(origin: string | null): boolean {
  const raw = import.meta.env.VITE_PORTAL_ALLOWED_ORIGINS as string | undefined;
  if (!raw || raw.trim().length === 0) return true;

  const allowed = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (allowed.length === 0) return true;
  if (!origin) return false;
  return allowed.includes(origin);
}

