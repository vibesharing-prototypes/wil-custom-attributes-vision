const PASSWORD = 'ARCisAwesome';
const COOKIE_NAME = 'arc_proto_auth';
const COOKIE_VALUE = 'granted_arc_2026';

export const config = { matcher: ['/(.*)',] };

export default function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Password gate must not run for static assets. Otherwise favicon (and similar)
  // requests get HTML, the icon fails to decode, and hosts like Vercel show their default.
  if (pathname === "/favicon.ico" || pathname.startsWith("/assets/")) {
    return;
  }

  // Handle password form submission
  if (url.searchParams.has('pwd')) {
    const pwd = url.searchParams.get('pwd');
    const redirectUrl = new URL(pathname, request.url);
    redirectUrl.searchParams.delete('pwd');

    if (pwd === PASSWORD) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': redirectUrl.toString(),
          'Set-Cookie': `${COOKIE_NAME}=${COOKIE_VALUE}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        },
      });
    }

    return new Response(getPasswordPage(true), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Allow through if auth cookie is present
  const cookies = request.headers.get('cookie') || '';
  if (cookies.includes(`${COOKIE_NAME}=${COOKIE_VALUE}`)) {
    return;
  }

  return new Response(getPasswordPage(false), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function getPasswordPage(showError) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico?v=diligent" />
  <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=diligent" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Schema and Roles</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: #1a1a2e;
    }

    .card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }

    .logo-mark {
      width: 32px;
      height: 32px;
      background: #1a1a2e;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-mark svg {
      width: 18px;
      height: 18px;
      fill: #fff;
    }

    .logo-text {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a2e;
      letter-spacing: -0.01em;
    }

    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
    }

    .subtitle {
      font-size: 14px;
      color: #666;
      margin-bottom: 28px;
      line-height: 1.5;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #444;
      margin-bottom: 6px;
    }

    input[type="password"] {
      width: 100%;
      padding: 10px 12px;
      border: 1.5px solid ${showError ? '#d32f2f' : '#ddd'};
      border-radius: 6px;
      font-size: 14px;
      color: #1a1a2e;
      background: ${showError ? '#fff5f5' : '#fff'};
      outline: none;
      transition: border-color 0.15s;
    }

    input[type="password"]:focus {
      border-color: #1a1a2e;
    }

    .error {
      font-size: 13px;
      color: #d32f2f;
      margin-top: 6px;
      display: ${showError ? 'block' : 'none'};
    }

    button {
      width: 100%;
      margin-top: 20px;
      padding: 11px;
      background: #1a1a2e;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s;
      letter-spacing: 0.01em;
    }

    button:hover { background: #2d2d4e; }
    button:active { background: #0f0f1e; }

    .footer {
      margin-top: 16px;
      font-size: 12px;
      color: #aaa;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-mark">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L20 8.5v7l-8 4-8-4v-7l8-4.32z"/>
        </svg>
      </div>
      <span class="logo-text">Diligent</span>
    </div>

    <h1>Protected prototype</h1>
    <p class="subtitle">Enter the access password to view this prototype.</p>

    <form method="GET" action="">
      <label for="pwd">Password</label>
      <input
        type="password"
        id="pwd"
        name="pwd"
        placeholder="Enter password"
        autocomplete="current-password"
        autofocus
      />
      <span class="error">Incorrect password. Please try again.</span>
      <button type="submit">Continue</button>
    </form>

    <p class="footer">ARC Core · Custom Attributes prototype</p>
  </div>
</body>
</html>`;
}
