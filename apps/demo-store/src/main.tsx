import { Buffer } from 'buffer';
import './styles.css';

// Ensure Node-ish globals exist before any LazorKit modules are evaluated.
// (Static ESM imports are evaluated before module body, so we load App dynamically.)
const g = globalThis as unknown as { global?: unknown; Buffer?: unknown; process?: { env?: Record<string, string> } };
g.global ||= globalThis;
g.Buffer ||= Buffer;
g.process ||= { env: {} };
g.process.env ||= {};

async function bootstrap() {
  const [{ StrictMode }, { createRoot }, { default: App }] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('./App'),
  ]);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void bootstrap();
