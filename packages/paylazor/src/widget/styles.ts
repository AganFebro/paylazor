let stylesInjected = false;

const CSS = `
.paylazor-root{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";color:#0b1220}
.paylazor-card{border:1px solid rgba(15,23,42,.12);border-radius:14px;padding:16px;max-width:420px;background:#fff;box-shadow:0 10px 25px rgba(2,8,23,.06)}
.paylazor-title{font-weight:650;font-size:16px;margin:0 0 8px}
.paylazor-sub{margin:0 0 12px;color:rgba(15,23,42,.75);font-size:13px;line-height:1.35}
.paylazor-row{display:flex;justify-content:space-between;gap:12px;margin:8px 0}
.paylazor-label{color:rgba(15,23,42,.72);font-size:13px}
.paylazor-value{font-weight:600;font-size:13px;word-break:break-all;text-align:right}
.paylazor-actions{display:flex;gap:10px;margin-top:14px}
.paylazor-btn{appearance:none;border:1px solid rgba(15,23,42,.16);background:#fff;border-radius:12px;padding:10px 12px;font-weight:650;font-size:14px;cursor:pointer}
.paylazor-btnPrimary{background:#0b1220;border-color:#0b1220;color:#fff}
.paylazor-btn:disabled{opacity:.6;cursor:not-allowed}
.paylazor-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(15,23,42,.12);border-radius:999px;padding:4px 10px;font-size:12px;color:rgba(15,23,42,.75);background:rgba(2,8,23,.02)}
.paylazor-segment{display:inline-flex;border:1px solid rgba(15,23,42,.16);border-radius:999px;overflow:hidden}
.paylazor-segBtn{appearance:none;border:0;background:transparent;padding:6px 10px;font-weight:650;font-size:12px;cursor:pointer;color:rgba(15,23,42,.8)}
.paylazor-segBtn.isActive{background:#0b1220;color:#fff}
.paylazor-segBtn:disabled{opacity:.6;cursor:not-allowed}
.paylazor-error{margin-top:10px;border:1px solid rgba(185,28,28,.2);background:rgba(185,28,28,.06);color:#7f1d1d;border-radius:12px;padding:10px;font-size:13px}
.paylazor-success{margin-top:10px;border:1px solid rgba(22,163,74,.18);background:rgba(22,163,74,.06);color:#14532d;border-radius:12px;padding:10px;font-size:13px}
.paylazor-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px}
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
