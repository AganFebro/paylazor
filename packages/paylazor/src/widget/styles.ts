let stylesInjected = false;

const CSS = `
.paylazor-root{
  --pz-bg:#fff;
  --pz-bg-subtle:#fbfcfe;
  --pz-text:#0b1220;
  --pz-muted:rgba(15,23,42,.72);
  --pz-border:rgba(15,23,42,.12);
  --pz-border-subtle:rgba(15,23,42,.08);
  --pz-shadow:0 14px 38px rgba(2,8,23,.10);
  --pz-primary:#0b1220;
  --pz-primary-hover:#111b33;
  --pz-primary-contrast:#fff;
  --pz-danger:#b91c1c;
  --pz-danger-bg:rgba(185,28,28,.06);
  --pz-danger-border:rgba(185,28,28,.20);
  --pz-success:#16a34a;
  --pz-success-bg:rgba(22,163,74,.06);
  --pz-success-border:rgba(22,163,74,.18);
  --pz-ring:rgba(59,130,246,.35);
  --pz-dot:rgba(15,23,42,.35);

  font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";
  color:var(--pz-text);
  line-height:1.4;
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}

.paylazor-root[data-theme="dark"]{
  --pz-bg:#0b1220;
  --pz-bg-subtle:#0a1020;
  --pz-text:#e5e7eb;
  --pz-muted:rgba(229,231,235,.72);
  --pz-border:rgba(148,163,184,.18);
  --pz-border-subtle:rgba(148,163,184,.12);
  --pz-shadow:0 18px 44px rgba(0,0,0,.45);
  --pz-primary:#e5e7eb;
  --pz-primary-hover:#ffffff;
  --pz-primary-contrast:#0b1220;
  --pz-ring:rgba(56,189,248,.25);
  --pz-dot:rgba(229,231,235,.45);
}

.paylazor-root[data-theme="midnight"]{
  --pz-bg:#0a0b1a;
  --pz-bg-subtle:#0c1030;
  --pz-text:#eef2ff;
  --pz-muted:rgba(224,231,255,.72);
  --pz-border:rgba(167,139,250,.22);
  --pz-border-subtle:rgba(167,139,250,.14);
  --pz-shadow:0 20px 55px rgba(0,0,0,.55);
  --pz-primary:#7c3aed;
  --pz-primary-hover:#8b5cf6;
  --pz-primary-contrast:#ffffff;
  --pz-ring:rgba(167,139,250,.28);
  --pz-dot:rgba(196,181,253,.55);
}

.paylazor-card{
  width:100%;
  max-width:460px;
  border:1px solid var(--pz-border);
  border-radius:18px;
  padding:18px;
  background:linear-gradient(180deg,var(--pz-bg) 0%,var(--pz-bg-subtle) 100%);
  box-shadow:var(--pz-shadow);
}

.paylazor-title{
  font-weight:750;
  font-size:16px;
  letter-spacing:-.01em;
  margin:0 0 6px;
}

.paylazor-sub{
  margin:0 0 14px;
  color:var(--pz-muted);
  font-size:13px;
  line-height:1.35;
}

.paylazor-row{
  display:grid;
  grid-template-columns:120px 1fr;
  align-items:start;
  gap:12px;
  padding:8px 0;
}

.paylazor-row + .paylazor-row{
  border-top:1px solid var(--pz-border-subtle);
}

.paylazor-label{
  color:var(--pz-muted);
  font-size:12px;
  letter-spacing:.02em;
}

.paylazor-value{
  font-weight:650;
  font-size:13px;
  overflow-wrap:anywhere;
  word-break:break-word;
  text-align:right;
}

.paylazor-actions{
  display:flex;
  gap:10px;
  margin-top:16px;
  flex-wrap:wrap;
}

.paylazor-btn{
  appearance:none;
  border:1px solid var(--pz-border);
  background:rgba(255,255,255,.9);
  color:var(--pz-text);
  border-radius:12px;
  padding:10px 14px;
  font-weight:750;
  font-size:14px;
  cursor:pointer;
  transition:background-color .15s ease,border-color .15s ease,transform .02s ease,box-shadow .15s ease;
}

.paylazor-btn:hover{
  border-color:rgba(15,23,42,.18);
  background:#fff;
}

.paylazor-btn:active{
  transform:translateY(1px);
}

.paylazor-btn:focus-visible{
  outline:none;
  box-shadow:0 0 0 4px var(--pz-ring);
}

.paylazor-btnPrimary{
  background:linear-gradient(180deg,var(--pz-primary) 0%,#070d19 100%);
  border-color:rgba(2,8,23,.85);
  color:var(--pz-primary-contrast);
}

.paylazor-btnPrimary:hover{
  background:linear-gradient(180deg,var(--pz-primary-hover) 0%,#0b1220 100%);
  border-color:rgba(2,8,23,.92);
}

.paylazor-btn:disabled{
  opacity:.6;
  cursor:not-allowed;
  transform:none;
}

.paylazor-badge{
  display:inline-flex;
  align-items:center;
  gap:8px;
  border:1px solid var(--pz-border);
  border-radius:999px;
  padding:6px 10px;
  font-size:12px;
  color:var(--pz-muted);
  background:rgba(2,8,23,.02);
}

.paylazor-badge::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:999px;
  background:var(--pz-dot);
}

.paylazor-error{
  margin-top:12px;
  border:1px solid var(--pz-danger-border);
  background:var(--pz-danger-bg);
  color:#7f1d1d;
  border-radius:14px;
  padding:12px;
  font-size:13px;
}

.paylazor-success{
  margin-top:12px;
  border:1px solid var(--pz-success-border);
  background:var(--pz-success-bg);
  color:#14532d;
  border-radius:14px;
  padding:12px;
  font-size:13px;
}

.paylazor-error a,
.paylazor-success a{
  color:inherit;
  text-decoration:underline;
  text-underline-offset:2px;
}

.paylazor-mono{
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
  font-size:12px;
  overflow-wrap:anywhere;
  word-break:break-word;
  background:rgba(2,8,23,.04);
  border:1px solid var(--pz-border-subtle);
  border-radius:10px;
  padding:3px 6px;
}

@media (max-width: 420px){
  .paylazor-row{grid-template-columns:1fr;gap:6px}
  .paylazor-value{text-align:left}
}

@media (prefers-color-scheme: dark){
  .paylazor-root[data-theme="system"]{
    --pz-bg:#0b1220;
    --pz-bg-subtle:#0a1020;
    --pz-text:#e5e7eb;
    --pz-muted:rgba(229,231,235,.72);
    --pz-border:rgba(148,163,184,.18);
    --pz-border-subtle:rgba(148,163,184,.12);
    --pz-shadow:0 18px 44px rgba(0,0,0,.45);
    --pz-primary:#e5e7eb;
    --pz-primary-hover:#ffffff;
    --pz-primary-contrast:#0b1220;
    --pz-ring:rgba(56,189,248,.25);
    --pz-dot:rgba(229,231,235,.45);
  }

  .paylazor-root[data-theme="system"] .paylazor-btn{background:rgba(2,8,23,.15)}
  .paylazor-root[data-theme="system"] .paylazor-btn:hover{background:rgba(2,8,23,.28);border-color:rgba(148,163,184,.25)}
  .paylazor-root[data-theme="system"] .paylazor-btnPrimary{
    background:linear-gradient(180deg,#e5e7eb 0%,#cbd5e1 100%);
    border-color:rgba(148,163,184,.35);
  }
  .paylazor-root[data-theme="system"] .paylazor-btnPrimary:hover{
    background:linear-gradient(180deg,#ffffff 0%,#e5e7eb 100%);
    border-color:rgba(148,163,184,.50);
  }

  .paylazor-root[data-theme="system"] .paylazor-badge{background:rgba(148,163,184,.08)}

  .paylazor-root[data-theme="system"] .paylazor-mono{
    background:rgba(148,163,184,.10);
    border-color:rgba(148,163,184,.14);
  }
}

.paylazor-root[data-theme="dark"] .paylazor-btn{background:rgba(2,8,23,.15)}
.paylazor-root[data-theme="dark"] .paylazor-btn:hover{background:rgba(2,8,23,.28);border-color:rgba(148,163,184,.25)}
.paylazor-root[data-theme="dark"] .paylazor-btnPrimary{
  background:linear-gradient(180deg,#e5e7eb 0%,#cbd5e1 100%);
  border-color:rgba(148,163,184,.35);
  color:#0b1220;
}
.paylazor-root[data-theme="dark"] .paylazor-btnPrimary:hover{
  background:linear-gradient(180deg,#ffffff 0%,#e5e7eb 100%);
  border-color:rgba(148,163,184,.50);
}
.paylazor-root[data-theme="dark"] .paylazor-badge{background:rgba(148,163,184,.08)}
.paylazor-root[data-theme="dark"] .paylazor-mono{
  background:rgba(148,163,184,.10);
  border-color:rgba(148,163,184,.14);
}

.paylazor-root[data-theme="midnight"] .paylazor-btn{
  background:rgba(124,58,237,.08);
  border-color:rgba(167,139,250,.24);
}
.paylazor-root[data-theme="midnight"] .paylazor-btn:hover{
  background:rgba(124,58,237,.14);
  border-color:rgba(196,181,253,.34);
}
.paylazor-root[data-theme="midnight"] .paylazor-btnPrimary{
  background:linear-gradient(180deg,#7c3aed 0%,#4c1d95 100%);
  border-color:rgba(196,181,253,.28);
  color:#ffffff;
}
.paylazor-root[data-theme="midnight"] .paylazor-btnPrimary:hover{
  background:linear-gradient(180deg,#8b5cf6 0%,#5b21b6 100%);
  border-color:rgba(196,181,253,.40);
}
.paylazor-root[data-theme="midnight"] .paylazor-badge{background:rgba(167,139,250,.10)}
.paylazor-root[data-theme="midnight"] .paylazor-mono{
  background:rgba(124,58,237,.12);
  border-color:rgba(167,139,250,.18);
}
`;

export function injectPaylazorStyles(): void {
  if (stylesInjected) return;
  if (typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.setAttribute('data-paylazor', 'true');
  style.textContent = CSS;
  document.head.appendChild(style);
  stylesInjected = true;
}

