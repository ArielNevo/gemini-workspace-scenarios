/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// SITE_CONFIG lets the e2e suite build with a test-only config (tests/e2e/site.config.e2e.json).
const siteConfigPath = fileURLToPath(
  new URL(process.env.SITE_CONFIG ?? './config/site.config.json', import.meta.url),
);
const siteConfig = JSON.parse(readFileSync(siteConfigPath, 'utf8')) as {
  siteTitle: string;
  robots: string;
};

function list(value: string | undefined): string {
  return (value ?? '').split(/\s+/).filter(Boolean).join(' ');
}

/**
 * Injects title, robots and (for production builds only) a strict CSP meta tag.
 * The dev server needs inline scripts for HMR, so CSP is applied to `vite build` output only.
 */
function headPlugin(env: Record<string, string>, isBuild: boolean): Plugin {
  const aiOn = env.VITE_ENABLE_AI_ASSIST === 'true';
  const connect = ["'self'", aiOn ? list(env.VITE_CSP_EXTRA_CONNECT) : ''].filter(Boolean).join(' ');
  const script = ["'self'", aiOn ? list(env.VITE_CSP_EXTRA_SCRIPT) : ''].filter(Boolean).join(' ');
  const frame = aiOn && list(env.VITE_CSP_EXTRA_FRAME) ? list(env.VITE_CSP_EXTRA_FRAME) : "'none'";
  const csp = [
    "default-src 'self'",
    `script-src ${script}`,
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connect}`,
    `frame-src ${frame}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ');
  return {
    name: 'site-head',
    transformIndexHtml(html) {
      let out = html
        .replace('%SITE_TITLE%', siteConfig.siteTitle)
        .replace('%ROBOTS%', siteConfig.robots || 'noindex,nofollow');
      if (isBuild) {
        out = out.replace('<!--CSP-->', `<meta http-equiv="Content-Security-Policy" content="${csp}" />`);
      }
      return out;
    },
  };
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const base = env.VITE_BASE_PATH || '/';
  return {
    base,
    plugins: [react(), headPlugin(env, command === 'build')],
    resolve: { alias: { '@site-config': siteConfigPath } },
    build: {
      target: 'es2022',
      sourcemap: false,
    },
    test: {
      environment: 'node',
      include: ['tests/unit/**/*.test.{ts,tsx}'],
    },
  };
});
