// Netlify Function: verify Gumroad license and set signed cookie
// Env vars required: GUMROAD_PRODUCT_ID, JWT_SECRET
const crypto = require('crypto');

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}

function signToken(payload, secret, expiresInSeconds = 7200) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now()/1000);
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };
  const headerB64 = base64url(JSON.stringify(header));
  const bodyB64 = base64url(JSON.stringify(body));
  const data = `${headerB64}.${bodyB64}`;
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64')
    .replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return `${data}.${sig}`;
}

exports.handler = async (event) => {
  try {
    const { email, licenseKey } = JSON.parse(event.body || "{}");
    if (!email || !licenseKey) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Missing fields" }) };
    }

    const verifyRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: process.env.GUMROAD_PRODUCT_ID,
        license_key: licenseKey,
        increment_uses_count: true
      })
    });

    const data = await verifyRes.json();
    if (!data.success || !data.purchase) {
      return { statusCode: 401, body: JSON.stringify({ ok: false }) };
    }

    const purchaseEmail = (data.purchase.email || "").toLowerCase();
    if (purchaseEmail !== email.toLowerCase()) {
      return { statusCode: 401, body: JSON.stringify({ ok: false }) };
    }

    const token = signToken({ email: purchaseEmail }, process.env.JWT_SECRET, 2 * 60 * 60);
    const cookie = `sess=${token}; HttpOnly; Secure; Path=/; Max-Age=7200; SameSite=Lax`;

    return {
      statusCode: 200,
      headers: { "Set-Cookie": cookie, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "Server error" }) };
  }
};
