// Standalone challenge for the native student app. No account form, secrets,
// cookies, analytics, redirect target or other caller-controlled HTML.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const ar = url.searchParams.get('lang') !== 'en';
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || '';
  const valid = (action === 'login' || action === 'register') && /^[A-Za-z0-9_-]{1,128}$/.test(key);
  const label = ar ? 'التحقق من المستخدم' : 'Human verification';
  const unavailable = ar ? 'التحقق غير متاح حالياً.' : 'Verification is currently unavailable.';
  const script = valid ? `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer></script>
<script nonce="NONCE">window.addEventListener('load',()=>{try{turnstile.render('#challenge',{sitekey:${JSON.stringify(key)},action:${JSON.stringify(action)},language:'${ar?'ar':'en'}',size:'flexible',callback:(token)=>{window.MathWorldCaptcha?.postMessage(token)},'error-callback':()=>{document.getElementById('status').textContent=${JSON.stringify(unavailable)}}})}catch{document.getElementById('status').textContent=${JSON.stringify(unavailable)}}});</script>` : '';
  const nonce = crypto.randomUUID();
  return new Response(`<!doctype html><html lang="${ar?'ar':'en'}" dir="${ar?'rtl':'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${label}</title></head><body><main><h1>${label}</h1><div id="challenge"></div><p id="status" role="status">${valid?'':unavailable}</p></main>${script.replace('NONCE',nonce)}</body></html>`,{
    headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; connect-src https://challenges.cloudflare.com; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`}
  });
}
