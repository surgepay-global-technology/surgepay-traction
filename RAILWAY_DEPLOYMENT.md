# Deployment - Railway Alternative

## Deploy to Railway (Alternative to Vercel)

Railway offers $5/month free credit which is good for moderate traffic apps.

### Quick Deploy

1. **Install Railway CLI**
```bash
npm i -g @railway/cli
```

2. **Login**
```bash
railway login
```

3. **Initialize Project**
```bash
cd /Users/obatech/surgepay-tracion
railway init
```

4. **Add Environment Variables**
```bash
# Link to your project first
railway link

# Add variables from your .env
railway variables set SUPABASE_URL="https://poskwztelomhbolngkbw.supabase.co"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your_key"
railway variables set ALCHEMY_TOKEN="your_token"
# ... add all other variables
```

5. **Deploy**
```bash
railway up
```

6. **Get Public URL**
```bash
railway domain
```

### Via Railway Dashboard

1. Go to https://railway.app
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Next.js
6. Add environment variables in "Variables" tab
7. Deploy happens automatically
8. Get domain from "Settings" → "Domains"

### Railway Config

Railway auto-detects Next.js, but you can create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Cost Estimate
- $5 free credit/month
- Typical usage: ~$3-4/month for this dashboard
- Starts charging after free credit exhausted
