/**
 * Public-repo safety lint (brief section 2.2). Fails on emails, phone numbers, 9-digit sequences,
 * URLs outside content/allowed-domains.json, and on CONTENT_FORBIDDEN_TERMS (a repo secret, never a file).
 */
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const SCAN = ['content', 'config', 'src', 'public', 'README.md', 'CONTRIBUTING.md', 'index.html'];
const EXT = /\.(json|md|ts|tsx|html|txt|css|svg)$/;

const allowed: string[] = (
  JSON.parse(readFileSync(join(root, 'content/allowed-domains.json'), 'utf8')) as { domains: string[] }
).domains;

export const RULES = {
  email: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  phone: /(?<![\d.])(?:\+972[-\s]?\d{1,2}|0(?:[2-489]|5\d|7\d))[-\s]?\d{3}[-\s]?\d{4}(?![\d])/g,
  nineDigits: /(?<!\d)\d{9}(?!\d)/g,
  url: /https?:\/\/[^\s"'<>)\]]+/g,
};

export function hostAllowed(url: string, domains: string[]): boolean {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return domains.some((d) => host === d || host.endsWith(`.${d}`));
}

export function lintText(text: string, domains: string[], forbidden: string[]): string[] {
  const issues: string[] = [];
  for (const m of text.matchAll(RULES.email)) issues.push(`email-like: ${m[0]}`);
  for (const m of text.matchAll(RULES.phone)) issues.push(`phone-like: ${m[0]}`);
  for (const m of text.matchAll(RULES.nineDigits)) issues.push(`9-digit number: ${m[0]}`);
  for (const m of text.matchAll(RULES.url))
    if (!hostAllowed(m[0], domains)) issues.push(`URL not allowed: ${m[0]}`);
  const lower = text.toLowerCase();
  for (const term of forbidden)
    if (lower.includes(term.toLowerCase())) issues.push('forbidden term (from secret)');
  return issues;
}

function walk(p: string, out: string[]) {
  const abs = join(root, p);
  let st;
  try {
    st = statSync(abs);
  } catch {
    return;
  }
  if (st.isDirectory()) for (const f of readdirSync(abs)) walk(join(p, f), out);
  else if (EXT.test(p)) out.push(p);
}

// Code files legitimately reference W3C/schema URLs only in comments; allow-list them here, not in content.
const CODE_URL_ALLOW = ['www.w3.org', 'json-schema.org'];

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const forbidden = (process.env.CONTENT_FORBIDDEN_TERMS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (forbidden.length === 0) console.log('CONTENT_FORBIDDEN_TERMS not set: skipping forbidden-terms check.');
  const files: string[] = [];
  SCAN.forEach((p) => walk(p, files));
  let failed = 0;
  for (const f of files) {
    const isCode = /\.(ts|tsx|css|svg)$/.test(f);
    const domains = isCode ? [...allowed, ...CODE_URL_ALLOW] : allowed;
    const issues = lintText(readFileSync(join(root, f), 'utf8'), domains, forbidden);
    if (issues.length) {
      failed++;
      console.error(`${relative(root, join(root, f))}:\n  ${issues.join('\n  ')}`);
    }
  }
  if (failed) {
    console.error(`content-lint failed in ${failed} file(s).`);
    process.exit(1);
  }
  console.log(`content-lint OK (${files.length} files).`);
}
