# SurgePay Dashboard - API Endpoints

## Overview
Complete list of available API endpoints for your dashboard.

## 🔍 Transaction Endpoints (Supabase)

### Get Transaction Stats by Currency
```bash
GET /api/transactions/stats-by-currency
```
Returns transaction totals grouped by currency (USDC, NGN).

**Response:**
```json
{
  "data": [
    {
      "currency": "USDC",
      "total_transaction_count": 150,
      "total_amount": 75000.50
    },
    {
      "currency": "NGN",
      "total_transaction_count": 230,
      "total_amount": 12500000.00
    }
  ]
}
```

### Get Transaction Stats by Type
```bash
GET /api/transactions/stats-by-type
```
Returns transaction totals grouped by transaction type.

**Response:**
```json
{
  "data": [
    {
      "transaction_type": "credit",
      "successful_tx_count": 200,
      "total_amount": 100000.00
    },
    {
      "transaction_type": "debit",
      "successful_tx_count": 180,
      "total_amount": 87500.50
    }
  ]
}
```

### Get Recent Transactions
```bash
GET /api/transactions/recent?limit=10&offset=0&currency=USDC
```

**Query Parameters:**
- `limit` (optional, default: 100) - Number of transactions to return
- `offset` (optional, default: 0) - Pagination offset
- `currency` (optional) - Filter by currency (USDC, NGN)

**Response:**
```json
{
  "data": [...transactions...],
  "pagination": {
    "total": 500,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## 💰 Alchemy Wallet Endpoints

### Get Wallet Info (via Alchemy)
```bash
GET /api/wallets/info?address=0x...
```

**Query Parameters:**
- `address` (required) - Ethereum wallet address

**Response:**
```json
{
  "data": {
    "address": "0x1234...",
    "ethBalance": "1.2500",
    "tokenBalances": [
      {
        "contractAddress": "0xabc...",
        "tokenBalance": "100.50",
        "symbol": "USDC",
        "name": "USD Coin",
        "decimals": 6
      }
    ],
    "transactionCount": 45
  }
}
```

### Check Active Wallets (via Alchemy)
```bash
GET /api/wallets/active?addresses=0x123...,0x456...,0x789...
```

**Query Parameters:**
- `addresses` (required) - Comma-separated list of wallet addresses

**Response:**
```json
{
  "data": {
    "total": 3,
    "active": 2,
    "wallets": [
      {
        "address": "0x123...",
        "balance": "1.2500",
        "transactionCount": 45,
        "isActive": true
      }
    ]
  }
}
```

---

## 🏦 Coinbase Wallet Endpoints

### Get Server Wallet Info
```bash
GET /api/coinbase/wallet
```
Returns info for your configured `COINBASE_SERVER_WALLET`.

**Response:**
```json
{
  "data": {
    "wallet": {
      "id": "...",
      "name": "Primary Wallet",
      "balance": {
        "amount": "1234.56",
        "currency": "USD"
      }
    },
    "transactions": [...],
    "transactionCount": 25
  }
}
```

### Get All Coinbase Wallets
```bash
GET /api/coinbase/wallets
```
Returns all wallets/accounts from your Coinbase account.

**Response:**
```json
{
  "data": {
    "total": 5,
    "active": 3,
    "wallets": [
      {
        "id": "...",
        "name": "Wallet 1",
        "balance": {
          "amount": "100.00",
          "currency": "USD"
        }
      }
    ]
  }
}
```

---

## 📊 Combined Metrics Endpoint

### Get All Metrics
```bash
GET /api/metrics
```
Returns combined metrics from Supabase, Alchemy, and Coinbase.

**Response:**
```json
{
  "data": {
    "supabase": {
      "byCurrency": {
        "USDC": { "count": 150, "total": 75000.50 },
        "NGN": { "count": 230, "total": 12500000.00 }
      },
      "byType": {
        "credit": { "count": 200, "total": 100000.00 },
        "debit": { "count": 180, "total": 87500.50 }
      },
      "totalTransactions": 380
    },
    "alchemy": {
      "message": "Use /api/wallets/info?address=0x... to query specific wallets",
      "activeWallets": 0
    },
    "coinbase": {
      "balance": {
        "amount": "1234.56",
        "currency": "USD"
      },
      "name": "Primary Wallet"
    },
    "timestamp": "2024-02-07T..."
  }
}
```

---

## 🔔 Webhook Endpoints

### Alchemy Webhook Receiver
```bash
POST /api/alchemy/webhook
```
Receives and processes Alchemy webhook events (address activity, mined transactions, etc.)

**Headers:**
- `x-alchemy-signature` - Webhook signature for verification

**Event Types:**
- `ADDRESS_ACTIVITY` - Wallet address activity
- `MINED_TRANSACTION` - Transaction confirmed
- `DROPPED_TRANSACTION` - Transaction dropped
- `NFT_ACTIVITY` - NFT transfers

### Coinbase Webhook Receiver
```bash
POST /api/coinbase/webhook
```
Receives and processes Coinbase webhook events.

**Headers:**
- `x-cc-webhook-signature` - Webhook signature for verification

### Health Check
Both webhook endpoints support GET requests for health checks:
```bash
GET /api/alchemy/webhook
GET /api/coinbase/webhook
```

---

## 🚀 Quick Start

### 1. Fill in Environment Variables

Make sure your `.env` file has all required values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Alchemy
ALCHEMY_TOKEN=your-alchemy-token
ALCHEMY_SIGNING_KEY=your-alchemy-signing-key
ALCHEMY_NETWORK=base-mainnet

# Coinbase
COINBASE_WEBHOOK_SIGNING_KEY=your-coinbase-webhook-key
COINBASE_AUTH_TOKEN=your-coinbase-auth-token
COINBASE_API_KEY_ID=your-api-key-id
COINBASE_SECRET_KEY=your-secret-key
COINBASE_SERVER_WALLET=your-wallet-id
```

### 2. Run the Development Server

```bash
npm run dev
```

Dashboard will be available at: `http://localhost:3000`

### 3. Test API Endpoints

```bash
# Test Supabase connection
curl http://localhost:3000/api/transactions/stats-by-currency

# Test Alchemy wallet query
curl "http://localhost:3000/api/wallets/info?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

# Test Coinbase wallet
curl http://localhost:3000/api/coinbase/wallet

# Get all metrics
curl http://localhost:3000/api/metrics
```

---

## 📝 Webhook Configuration

### Alchemy Webhooks

1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. Navigate to Webhooks
3. Create a new webhook
4. Set URL to: `https://your-domain.com/api/alchemy/webhook`
5. Copy the signing key to `ALCHEMY_SIGNING_KEY`

### Coinbase Webhooks

1. Go to Coinbase Developer Dashboard
2. Navigate to Webhooks
3. Add webhook URL: `https://your-domain.com/api/coinbase/webhook`
4. Copy the signing key to `COINBASE_WEBHOOK_SIGNING_KEY`

---

## 🐛 Troubleshooting

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Ensure `wallet_transactions` table exists
- Check RLS policies if queries fail

### Alchemy Issues
- Verify `ALCHEMY_TOKEN` is correct
- Check that `ALCHEMY_NETWORK` matches your chain
- Ensure wallet address format is correct (0x...)

### Coinbase Issues
- Verify all Coinbase credentials are set
- Check that `COINBASE_SERVER_WALLET` is a valid wallet/account ID
- Ensure API keys have proper permissions

---

## 🎯 Next Steps

1. **Add Supabase credentials** - Connect to your transaction database
2. **Test wallet queries** - Use the dashboard to query wallet balances
3. **Configure webhooks** - Set up Alchemy and Coinbase webhooks
4. **Deploy to Railway** - One command: `railway up`
5. **Monitor metrics** - Visit `/api/metrics` for a complete overview

---

## 📧 Support

For issues or questions, check the logs or contact support.
