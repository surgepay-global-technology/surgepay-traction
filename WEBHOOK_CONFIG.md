# SurgePay Webhook Configuration

## Coinbase Webhook

**Production URL**: `https://api.surgepay.tech/coinbase/webhook/events`
**Signing Key**: `whsec_u9tJawau7DANMgx8yL0Bx4VU`

### Current Dashboard Webhook Endpoint:
- Development: `http://localhost:3000/api/coinbase/webhook`
- Production: `https://your-railway-url.railway.app/api/coinbase/webhook`

### To Configure:

1. **In Coinbase Dashboard:**
   - Go to Developer Settings → Webhooks
   - Update webhook URL to your deployed dashboard URL
   - Use signing key: `whsec_u9tJawau7DANMgx8yL0Bx4VU`

2. **Events Received:**
   - Webhook events are logged to Supabase `webhook_events` table
   - Events are processed and can trigger business logic

---

## Alchemy Webhooks

### Ethereum Webhook
- **Webhook ID**: `wh_jb7o0gyy39d0u8f1`
- **Signing Key**: `whsec_Jm8ojPgfT7vlaAqW1pefEoA0`
- **Endpoint**: `/api/alchemy/webhook`

### Solana Webhook
- **Webhook ID**: `wh_r1xh37u74wiulcss`
- **Signing Key**: `whsec_PR4jSRJszGvWF5kbFHB6DrTh`
- **Endpoint**: `/api/alchemy/webhook` (can create separate endpoint if needed)

---

## Webhook Event Flow

```
Coinbase/Alchemy → Dashboard Webhook Endpoint
                 ↓
            Verify Signature
                 ↓
            Store in Supabase (webhook_events table)
                 ↓
            Process Event (trigger business logic)
                 ↓
            Return 200 OK
```

---

## Testing Webhooks Locally

Use a tool like [ngrok](https://ngrok.com) to expose localhost for testing:

```bash
ngrok http 3000
```

Then use the ngrok URL in your webhook configuration:
```
https://your-id.ngrok.io/api/coinbase/webhook
```
