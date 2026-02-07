# Deploy SurgePay Dashboard to Netlify (Free)

Netlify free tier: **100GB bandwidth, 300 build min/month, no credit card.**

---

## Option 1: Deploy with Netlify CLI (fastest)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login (opens browser)
netlify login

# From project folder
cd /Users/obatech/surgepay-tracion

# Create site and deploy
netlify deploy

# When prompted:
# - Create new site? Yes
# - Team: pick your account
# - Site name: surgepay-dashboard (or leave default)
# - Publish directory: .next

# Deploy to production (get live URL)
netlify deploy --prod
```

Your live URL will be like: **https://surgepay-dashboard.netlify.app**

---

## Option 2: Deploy via Netlify Dashboard (Git)

1. Push your code to **GitHub** (if not already).
2. Go to **https://app.netlify.com** → Sign up/Login (GitHub).
3. **Add new site** → **Import an existing project**.
4. **Connect to Git** → Choose your repo (e.g. `surgepay-tracion`).
5. **Build settings** (usually auto-filled):
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: (leave empty)
6. **Environment variables** → Add all from your `.env`:
   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ALCHEMY_TOKEN, etc.
7. **Deploy site**.

---

## One-time: Add Next.js plugin

Netlify needs the Next.js plugin for SSR/API routes. Install once:

```bash
npm i -D @netlify/plugin-nextjs
```

Then commit and push (or run `netlify deploy --prod` again).

---

## Your live URL

After deploy you’ll see something like:

- **https://random-name-12345.netlify.app**  
  or  
- **https://surgepay-dashboard.netlify.app** (if you set that name)

Use that URL to test the dashboard.
