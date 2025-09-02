exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      "Set-Cookie": "sess=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax"
    },
    body: JSON.stringify({ ok: true })
  };
};
