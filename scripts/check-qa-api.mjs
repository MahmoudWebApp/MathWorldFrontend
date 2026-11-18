// Local-only safety gate. A QA run must not silently use the production
// backend default; browsing is safe, but testing answers/admin flows mutates DB.
import { readFileSync, existsSync } from 'node:fs';

function readValue(path, key) {
  if (!existsSync(path)) return undefined;
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  let result;
  for (const line of lines) {
    const matched = line.match(/^\s*(?:export\s+)?([A-Za-z_][\w]*)\s*=\s*(.*)$/);
    if (matched?.[1] !== key) continue;
    let value = matched[2].trim();
    if ((value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '').trim();
    }
    result = value;
  }
  return result;
}

const key = 'NEXT_PUBLIC_API_BASE_URL';
// Next.js loading precedence for development:
// process.env, .env.development.local, .env.local, .env.development, .env.
const source = [
  process.env[key],
  readValue('.env.development.local', key),
  readValue('.env.local', key),
  readValue('.env.development', key),
  readValue('.env', key),
].find(value => typeof value === 'string' && value.trim());

if (!source) {
  console.error('QA blocked: specify NEXT_PUBLIC_API_BASE_URL in .env.local as a dedicated staging https://hostname/api.');
  process.exit(1);
}

let url;
try { url = new URL(source.trim()); }
catch {
  console.error('QA blocked: API URL must be an absolute HTTPS staging URL.');
  process.exit(1);
}

const host = url.hostname.toLowerCase().replace(/\.$/, '');
const production = new Set([
  'mathwordbackend.onrender.com',
  'mathwords.netlify.app',
  'math-world-frontend.vercel.app',
]);
if (
  url.protocol !== 'https:' ||
  url.pathname !== '/api' ||
  url.search || url.hash || url.username || url.password ||
  production.has(host) || host === 'localhost' ||
  host.endsWith('.localhost') || host.endsWith('.local') ||
  !host.includes('.') || !/^[a-z0-9.-]+$/i.test(host)
) {
  console.error('QA blocked: configure a dedicated non-production HTTPS API ending in /api. Never use the live backend.');
  process.exit(1);
}

console.log(`QA backend check passed: ${host} (not a known production URL).`);
console.log('This checks configuration only; confirm the service actually runs the feature backend branch and staging database.');
