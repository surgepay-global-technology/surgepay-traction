# Deploy SurgePay Dashboard to Render (Free)

**Render free tier:** 750 hours/month, spins down after 15 min inactivity (cold start on next visit).

---

## Deploy using Render CLI

You still create the service **once** in the Dashboard (or via Blueprint). After that, use the CLI to trigger deploys from your terminal.

### 1. Install Render CLI

```bash
# macOS (Homebrew)
brew install render

# Or Linux/macOS (install script)
curl -fsSL https://raw.githubusercontent.com/render-oss/cli/refs/heads/main/bin/install.sh | sh
```

### 2. Log in

```bash
render login
```

Your browser opens; click **Generate token**. Back in the terminal, choose your workspace if asked.

### 3. Create the service once (Dashboard)

- Go to **https://dashboard.render.com** → **New** → **Web Service**.
- Connect your GitHub repo (the one with this project).
- Use **Build command:** `npm install && npm run build`, **Start command:** `npm start`, **Instance type:** Free.
- Add all env vars from your `.env` in the **Environment** tab.
- Click **Create Web Service** and wait for the first deploy to finish.

(Alternatively: **New** → **Blueprint**, connect the same repo so Render uses `render.yaml`; then add env vars in the service’s **Environment** tab.)

### 4. Deploy from CLI

```bash
cd /Users/obatech/surgepay-tracion

# List services and pick your dashboard service
render services

# Trigger a deploy (you’ll be prompted to select the service if needed)
render deploys create

# Or wait until deploy finishes
render deploys create --wait
```

After the first time, you can run `render deploys create` (or `render deploys create --wait`) whenever you want to deploy from the CLI.

### 5. Optional: validate blueprint

```bash
render blueprints validate render.yaml
```

---

## Quick deploy (Dashboard only)

1. **Push code to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Add Render config"
   git push origin main
   ```

2. **Go to Render**
   - https://dashboard.render.com
   - Sign up / Log in (GitHub works)

3. **New → Web Service**
   - **Connect repository:** select your `surgepay-tracion` (or repo name)
   - **Name:** `surgepay-dashboard`
   - **Region:** Oregon (or nearest)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance type:** Free

4. **Environment variables**
   - **Environment** tab → **Add Environment Variable**
   - Add each from your `.env`:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `ALCHEMY_TOKEN`
     - `ALCHEMY_API_KEY`
     - `ALCHEMY_NETWORK`
     - `ALCHEMY_ETH_SIGNING_KEY`
     - `ALCHEMY_ETH_WEBHOOK_ID`
     - `ALCHEMY_SOLANA_SIGNING_KEY`
     - `ALCHEMY_SOLANA_WEBHOOK_ID`
     - `COINBASE_WEBHOOK_SIGNING_KEY`
     - `COINBASE_AUTH_TOKEN`
     - `COINBASE_API_KEY_ID`
     - `COINBASE_SECRET_KEY`
     - `COINBASE_SERVER_WALLET`
     - `GAS_FEE_RECEIVER`
     - `BASE_RELAYER_PROGRAM_ID`
     - `SOLANA_BRIDGE_PROGRAM_ID`
     - `DEFAULT_GAS_LIMIT`

5. **Create Web Service**
   - Render will clone, build, and start the app.
   - When it’s live you’ll get a URL like: **https://surgepay-dashboard.onrender.com**

---

## Optional: Deploy from blueprint

If you use **Blueprint** (New → Blueprint), connect the repo that contains `render.yaml`.  
Render will create the web service from it. You still need to add env vars in the Dashboard (Environment tab).

---

## Free tier notes

- **Spins down** after ~15 minutes of no traffic; first request after that may take 30–60 seconds (cold start).
- **750 hours/month** is enough for a dashboard that isn’t hit 24/7.
- **URL:** `https://<service-name>.onrender.com` (e.g. `https://surgepay-dashboard.onrender.com`).

---

## After deploy

1. Open your Render URL and confirm the dashboard loads.
2. Update Alchemy/Coinbase webhook URLs to:  
   `https://surgepay-dashboard.onrender.com/api/...` (or your actual Render URL).
