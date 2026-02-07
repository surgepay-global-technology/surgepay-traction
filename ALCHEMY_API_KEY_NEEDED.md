# ⚠️ IMPORTANT: Get Your Real Alchemy API Key

The current `ALCHEMY_TOKEN` in your `.env` is **NOT a valid Alchemy API key**. It's an authentication token that won't work for API calls.

## How to Get Your Real Alchemy API Key:

1. Go to **[dashboard.alchemy.com](https://dashboard.alchemy.com)**
2. Log in to your account
3. Select your app (or create a new one if needed)
4. Click **"VIEW KEY"** button
5. Copy the **"API KEY"** (NOT the "Auth Token")
6. Update your `.env` file:

```bash
ALCHEMY_TOKEN=your-actual-api-key-here
```

## Current Token Type (Won't Work):
```
CdskTLSH0lkQn5d-P_ieoJpcl9RjetBN  ❌ This is an auth token, not an API key
```

## What You Need:
```
alch_xxxxxxxxxxxxxxxxxxxxxxxxxxxx  ✓ Real API keys start with "alch_"
```

Once you update the `.env` file with the correct API key, restart the dev server and you'll be able to query wallet balances!

---

**Current Status:**
- ✅ Supabase transactions working perfectly
- ✅ Dashboard showing real data (374 NGN + 626 USDC = $22,761.73)
- ⚠️ Alchemy wallet queries need valid API key
