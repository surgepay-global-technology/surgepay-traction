# Vercel Deployment Guide for SurgePay Dashboard

## 🚀 Quick Deploy to Vercel (5 minutes)

### Method 1: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from project root**
```bash
cd /Users/obatech/surgepay-tracion
vercel
```

4. **Follow prompts:**
   - Setup and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - Project name? `surgepay-dashboard` (or your choice)
   - Directory? `./` (press enter)
   - Override settings? `N`

5. **Set Environment Variables**
```bash
# Add each variable from your .env file
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ALCHEMY_TOKEN
vercel env add ALCHEMY_API_KEY
vercel env add ALCHEMY_NETWORK
vercel env add ALCHEMY_ETH_SIGNING_KEY
vercel env add ALCHEMY_ETH_WEBHOOK_ID
vercel env add ALCHEMY_SOLANA_SIGNING_KEY
vercel env add ALCHEMY_SOLANA_WEBHOOK_ID
vercel env add COINBASE_WEBHOOK_SIGNING_KEY
vercel env add COINBASE_AUTH_TOKEN
vercel env add COINBASE_API_KEY_ID
vercel env add COINBASE_SECRET_KEY
vercel env add COINBASE_SERVER_WALLET
vercel env add GAS_FEE_RECEIVER
vercel env add BASE_RELAYER_PROGRAM_ID
vercel env add SOLANA_BRIDGE_PROGRAM_ID
vercel env add DEFAULT_GAS_LIMIT
```

6. **Deploy to Production**
```bash
vercel --prod
```

Your app will be live at: `https://surgepay-dashboard.vercel.app` (or similar)

---

### Method 2: Deploy via GitHub + Vercel Dashboard (Recommended for teams)

1. **Push code to GitHub**
```bash
git init
git add .
git commit -m "Initial commit: SurgePay Analytics Dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/surgepay-dashboard.git
git push -u origin main
```

2. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Sign up/Login with GitHub
   - Click "Import Project"
   - Select your `surgepay-dashboard` repository

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)
   - Install Command: `npm install` (auto-filled)

4. **Add Environment Variables**
   Click "Environment Variables" and add all variables from your `.env` file:
   
   ```
   SUPABASE_URL=https://poskwztelomhbolngkbw.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ALCHEMY_TOKEN=your_token_here
   ... (all other env vars)
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

---

## 🔧 Post-Deployment Setup

### Update Webhook URLs

After deployment, update your webhook URLs in Alchemy and Coinbase dashboards:

**Alchemy Webhooks:**
- ETH Webhook URL: `https://your-app.vercel.app/api/alchemy/webhook`
- Solana Webhook URL: `https://your-app.vercel.app/api/alchemy/webhook`

**Coinbase Webhooks:**
- Webhook URL: `https://your-app.vercel.app/api/coinbase/webhook`

### Test Your Deployment

Visit these endpoints to verify:
```bash
# Homepage
https://your-app.vercel.app

# API Health Check
https://your-app.vercel.app/api/transactions/stats-by-currency
```

---

## 🎯 Vercel Dashboard Features

After deployment, you get:

1. **Automatic Deployments**
   - Every `git push` triggers a new deployment
   - Preview URLs for every branch/PR

2. **Environment Variables**
   - Manage from dashboard: Settings → Environment Variables
   - Separate variables for Production, Preview, Development

3. **Analytics**
   - View traffic, performance, errors
   - Free for hobby projects

4. **Custom Domain** (Optional)
   - Settings → Domains
   - Add your custom domain (e.g., `dashboard.surgepay.tech`)
   - Automatic HTTPS/SSL certificates

5. **Logs & Monitoring**
   - Real-time function logs
   - Error tracking
   - Performance insights

---

## 💡 Pro Tips

### Optimize for Production

Already configured in your `package.json`:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### Environment Variable Security

- Never commit `.env` to git (already in `.gitignore`)
- Set variables in Vercel dashboard
- Use different values for preview vs production if needed

### Redeploy After Changes

```bash
# CLI method
vercel --prod

# Or just push to GitHub
git add .
git commit -m "Update dashboard"
git push
```

---

## 🆓 Free Tier Limits

**Vercel Free (Hobby) Plan:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ 100GB-hours serverless function execution
- ✅ 6,000 build minutes/month
- ✅ Automatic SSL
- ✅ Custom domains

**This is more than enough for your dashboard!**

---

## 🔄 Alternative: Railway Deployment

If you prefer Railway (uses credits):

1. Visit: https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables in Variables tab
6. Deploy automatically starts
7. Get public URL from Settings → Domains

**Railway Free Tier:**
- $5 credit/month
- ~500 hours of usage
- Good for testing

---

## 🎉 Recommended Choice

**Use Vercel** - It's specifically optimized for Next.js, has the best free tier, and requires zero configuration. Your dashboard will be blazing fast with their edge network!

## Need Help?

After deployment, if you have issues:
1. Check Vercel function logs in dashboard
2. Verify all environment variables are set
3. Check webhook URLs are updated
4. Test API endpoints individually
