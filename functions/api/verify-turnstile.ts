const CLOUDFLARE_TEST_TOKENS = [
  'XXXX.DUMMY.TOKEN.XXXX', // always pass
];
const CLOUDFLARE_TEST_SECRET_KEYS = [
  '1x0000000000000000000000000000000AA', // always pass
  '2x0000000000000000000000000000000AB', // always fail
  '3x0000000000000000000000000000000FF', // token already spent
];

export const onRequestPost = async (context) => {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { token } = body;
    const secretKey = env.TURNSTILE_SECRET_KEY;

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token missing' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY is not set');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    if (CLOUDFLARE_TEST_SECRET_KEYS.includes(secretKey)) {
      console.log('[Turnstile] Using test secret key - bypass verification');
      return new Response(JSON.stringify({ success: true, note: 'test-mode' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();

    if (data.success) {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Robot detection failed' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
