// Validate session cookie (HMAC-signed JWT-like token)
const crypto = require('crypto');

function verifyToken(token, secret) {
  try {
    const [h, b, s] = token.split('.');
    if (!h || !b || !s) return null;
    const data = `${h}.${b}`;
    const sig = crypto.createHmac('sha256', secret).update(data).digest('base64')
      .replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    if (sig !== s) return null;
    const payload = JSON.parse(Buffer.from(b, 'base64').toString('utf8'));
    if (payload.exp && Math.floor(Date.now()/1000) > payload.exp) return null;
    return payload;
  } catch { return null; }
}

exports.handler = async (event) => {
  const cookie = event.headers.cookie || "";
  const match = cookie.match(/(?:^|; )sess=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  if (!token) return { statusCode: 401, body: "No token" };
  const payload = verifyToken(token, process.env.JWT_SECRET);
  if (!payload) return { statusCode: 401, body: "Invalid token" };
  return { statusCode: 200, body: JSON.stringify({ ok:true, email: payload.email }) };
};
