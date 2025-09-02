# Tarkov Randomizer (Hosted) — Gumroad Licensed (Netlify)

This is a minimal, production-ready starter to host a **Tarkov randomizer web app** behind a Gumroad license gate on **Netlify**.

## What you get
- **Gumroad licensing** via a Netlify Function (`/netlify/functions/verify.js`)
- **Session cookie** (`sess`) signed with HMAC-SHA256 (JWT-style) to keep users logged in for 2 hours
- **Auth check** function to validate cookie before loading the app
- **Login page** and **protected app** structure (client only loads the tool after validation)
- **Dark, Tarkov-inspired UI** and a functional randomizer with common toggles

## Quick start
1. Create a **Gumroad product** and enable **License Keys**. Grab the **Product ID**.
2. On Netlify:
   - Add **Environment variables**: `GUMROAD_PRODUCT_ID` (from step 1) and `JWT_SECRET` (random long key).
3. Deploy this folder to Netlify (connect Git or drag-and-drop).
4. Visit `/login` to test. Use your purchased license key + the email used at checkout.

## Notes
- This starter avoids external Node dependencies. It uses Node 18+ `fetch` and `crypto` (HMAC) to sign tokens.
- Security model: client **always** calls `/auth-check` first; only after success do we load the tool UI. No raw code for the app is embedded in the login page.

## Structure
```
public/
  index.html         # Marketing/landing page
  login.html         # License login form
  assets/style.css   # Shared styles
  app/
    index.html       # Protected app shell (loads UI only after auth)
    app.js           # Randomizer logic + UI bootstrap

netlify/
  functions/
    verify.js        # POST: verifies Gumroad license, sets signed cookie
    auth_check.js    # GET: validates cookie (signed HMAC), returns 200/401
    logout.js        # POST: clears cookie

netlify.toml         # Build + function config + headers
README.md
```

## Hardening ideas (later)
- Use Netlify **Edge Functions** to gate `/app/*` at the edge (reads cookies, redirects unauthenticated).
- Add **rate limiting** / device binding (e.g., store a device hash on first login).
- Add a **pro tier** (extra toggles) as a second Gumroad product ID.

---
