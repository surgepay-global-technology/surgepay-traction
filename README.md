# SurgePay Dashboard

A comprehensive transaction analytics and wallet monitoring dashboard built with Next.js, integrating Supabase for transaction data and Alchemy for blockchain wallet queries.

## Features

- 📊 **Transaction Analytics**: View transaction statistics by currency and type
- 💰 **Wallet Monitoring**: Query active wallets and their balances via Alchemy
- 🔔 **Webhook Integration**: Secure Coinbase webhook handling with signature verification
- 🎨 **Modern UI**: Clean, responsive dashboard with dark mode support
- 🚀 **Easy Deployment**: One-click deployment to Railway

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Alchemy SDK
- **Webhooks**: Svix for Coinbase signature verification

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Alchemy API key
- Coinbase webhook signing key (optional, for webhook functionality)

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd surgepay-tracion
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Alchemy Configuration
ALCHEMY_API_KEY=your-alchemy-api-key
ALCHEMY_NETWORK=base-mainnet  # or eth-mainnet, polygon-mainnet, etc.

# Coinbase Webhook Configuration
COINBASE_WEBHOOK_SIGNING_KEY=whsec_u9tJawau7DANMgx8yL0Bx4VU
COINBASE_AUTH_TOKEN=CdskTLSH0lkQn5d-P_ieoJpcl9RjetBN

# Dashboard Authentication (optional)
DASHBOARD_PASSWORD=your-secure-password
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## API Endpoints

### Transaction Endpoints

- **GET** `/api/transactions/stats-by-currency` - Get transaction statistics grouped by currency
- **GET** `/api/transactions/stats-by-type` - Get transaction statistics grouped by type
- **GET** `/api/transactions/recent?limit=10&offset=0&currency=USDC` - Get recent transactions

### Wallet Endpoints

- **GET** `/api/wallets/info?address=0x...` - Get detailed wallet information (balance, tokens, tx count)
- **GET** `/api/wallets/active?addresses=0x...,0x...` - Check multiple wallets for activity

### Webhook Endpoint

- **POST** `/api/coinbase/webhook` - Coinbase webhook receiver with signature verification
- **GET** `/api/coinbase/webhook` - Health check endpoint

## Database Schema

The dashboard expects a `wallet_transactions` table in Supabase with the following structure:

```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'maplerad',
  provider_transaction_id TEXT UNIQUE NOT NULL,
  transaction_type TEXT NOT NULL,
  status TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL,
  description TEXT,
  reference TEXT,
  counterparty JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  transaction_date TIMESTAMPTZ NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  kyc_profile_id UUID REFERENCES kyc_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Deployment to Railway

### Option 1: Using Railway CLI

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Add environment variables:
```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL=your-value
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-value
railway variables set ALCHEMY_API_KEY=your-value
railway variables set ALCHEMY_NETWORK=base-mainnet
railway variables set COINBASE_WEBHOOK_SIGNING_KEY=your-value
railway variables set COINBASE_AUTH_TOKEN=your-value
```

4. Deploy:
```bash
railway up
```

### Option 2: Using Railway Dashboard

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Add environment variables in the Railway dashboard
4. Railway will automatically detect Next.js and deploy

### Post-Deployment

After deployment, Railway will provide a URL like `https://your-app.railway.app`.

**Important**: Update your Coinbase webhook URL to:
```
https://your-app.railway.app/api/coinbase/webhook
```

## Webhook Configuration

### Coinbase Commerce Webhook Setup

1. Go to Coinbase Commerce Dashboard → Settings → Webhook subscriptions
2. Add your webhook URL: `https://your-domain.com/api/coinbase/webhook`
3. Copy the webhook signing key and add it to your environment variables
4. The dashboard automatically verifies signatures using Svix

### Supported Webhook Events

- `charge:created`
- `charge:confirmed`
- `charge:failed`
- `charge:delayed`
- `charge:pending`
- `charge:resolved`
- `wallet:payment:received`

## Dashboard Features

### Transaction Overview
- Total transaction count across all currencies
- Currency-specific transaction totals (USDC, NGN)
- Visual statistics with formatted amounts

### Transactions by Type
- Breakdown of successful transactions by type
- Transaction counts and total amounts per type
- Sortable table view

### Wallet Monitor
- Real-time wallet balance checking via Alchemy
- ETH balance display
- Token balances with metadata (symbol, name, decimals)
- Transaction count per wallet

### Recent Transactions
- Last 10 transactions from Supabase
- Filterable by status and currency
- Detailed transaction information

## Development

### Project Structure

```
surgepay-tracion/
├── app/
│   ├── api/
│   │   ├── transactions/     # Transaction API routes
│   │   ├── wallets/          # Wallet API routes
│   │   └── coinbase/         # Webhook handlers
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Dashboard page
├── components/
│   ├── Header.tsx
│   ├── TransactionStats.tsx
│   ├── TransactionsByType.tsx
│   ├── RecentTransactions.tsx
│   └── WalletInfo.tsx
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── alchemy.ts            # Alchemy SDK config
│   ├── coinbase.ts           # Webhook verification
│   └── utils.ts              # Helper functions
└── public/                   # Static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Supported Networks (Alchemy)

- `eth-mainnet` - Ethereum Mainnet
- `eth-sepolia` - Ethereum Sepolia Testnet
- `base-mainnet` - Base Mainnet (default)
- `base-sepolia` - Base Sepolia Testnet
- `polygon-mainnet` - Polygon Mainnet
- `arbitrum-mainnet` - Arbitrum Mainnet
- `optimism-mainnet` - Optimism Mainnet

Change the network by updating `ALCHEMY_NETWORK` in your `.env` file.

## Troubleshooting

### Supabase Connection Issues

- Verify your `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Ensure your Supabase project is active
- Check that the `wallet_transactions` table exists

### Alchemy API Errors

- Verify your `ALCHEMY_API_KEY` is correct
- Check you're using a valid network name
- Ensure the wallet address format is correct (0x...)

### Webhook Signature Verification Fails

- Ensure `COINBASE_WEBHOOK_SIGNING_KEY` starts with `whsec_`
- Check that the webhook URL in Coinbase matches your deployed URL
- Verify that the webhook is receiving POST requests

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## Security Considerations

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- The service role key should only be used server-side
- Enable Row Level Security (RLS) in Supabase for production
- Consider adding authentication for the dashboard in production

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact support.

---

Built with ❤️ using Next.js, Supabase, and Alchemy
