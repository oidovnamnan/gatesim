---
description: How to run and develop GateSIM eSIM platform
---

# GateSIM Development Workflow

## Prerequisites
- Node.js v18+
- PostgreSQL database (local or cloud: Neon, Supabase)
- Airalo Partner API credentials (optional for development)
- QPay merchant credentials (optional for development)

## Quick Start

// turbo-all

1. Install dependencies
```bash
cd gatesim-app
npm install
```

2. Setup environment variables
```bash
cp env.example .env.local
# Edit .env.local with your credentials
```

3. Setup database
```bash
npx prisma generate
npx prisma db push
```

4. Run development server
```bash
npm run dev
```

5. Open http://localhost:3000

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── packages/      # Package listing API
│   │   ├── checkout/      # Payment APIs
│   │   └── webhooks/      # Payment webhooks
│   ├── packages/          # Package listing page
│   ├── package/[id]/      # Package detail page
│   ├── checkout/          # Checkout flow
│   ├── my-esims/          # User's eSIM list
│   └── profile/           # User profile
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   └── packages/         # Package-related components
├── services/             # External API clients
│   ├── airalo/           # Airalo API client
│   └── payments/         # Payment providers
├── lib/                  # Utility functions
└── config/               # App configuration
```

## Key Files
- `prisma/schema.prisma` - Database schema
- `src/lib/auth.ts` - NextAuth configuration
- `src/services/airalo/client.ts` - Airalo API client
- `src/services/payments/qpay/client.ts` - QPay client

## Environment Variables
Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret
- `AIRALO_CLIENT_ID` - Airalo API client ID
- `AIRALO_CLIENT_SECRET` - Airalo API secret
- `QPAY_USERNAME` - QPay merchant username
- `QPAY_PASSWORD` - QPay merchant password
- `QPAY_INVOICE_CODE` - QPay invoice code

## Testing Payments
In development mode, the app returns mock data when credentials are not set:
- Mock packages are returned from `/api/packages`
- Mock QPay invoices are returned from `/api/checkout/qpay`

## Deployment
```bash
npm run build
npm start
```

For Vercel:
```bash
vercel deploy --prod
```
