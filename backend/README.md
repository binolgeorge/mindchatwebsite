# MindChat E-Commerce Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

**Required:**
- `STRIPE_SECRET_KEY` - Get from https://dashboard.stripe.com/apikeys
- `STRIPE_PUBLISHABLE_KEY` - Get from https://dashboard.stripe.com/apikeys
- `FRONTEND_URL` - Your website URL (e.g., https://mindchatapp.com)

**Optional:**
- `EMAIL_USER` - For sending order confirmations
- `EMAIL_PASS` - Email app password
- `STRIPE_WEBHOOK_SECRET` - For production webhooks

### 3. Get Stripe API Keys

1. Sign up at https://stripe.com
2. Go to Developers > API Keys
3. Copy your **Publishable key** and **Secret key**
4. For testing, use the test keys (start with `pk_test_` and `sk_test_`)

### 4. Set Up Stripe Webhook (For Production)

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret to `.env`

### 5. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### Public Endpoints

- `POST /api/create-checkout-session` - Create Stripe checkout session
- `GET /api/orders/track?orderNumber=XXX&email=XXX` - Track order
- `POST /api/orders/:orderId/cancel` - Cancel order
- `POST /api/webhook` - Stripe webhook (for payment confirmations)

### Admin Endpoints

- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/orders/:orderId/status` - Update order status
- `POST /api/admin/orders/:orderId/refund` - Process refund

## Database

Uses SQLite by default. Database file: `database.sqlite`

To use PostgreSQL instead:
1. Install `pg` package: `npm install pg`
2. Update database connection in `server.js`

## Deployment

### Recommended Platforms:
- **Railway** (easiest) - https://railway.app
- **Heroku** - https://heroku.com
- **Render** - https://render.com
- **DigitalOcean App Platform** - https://www.digitalocean.com/products/app-platform

### Environment Variables to Set:
- All variables from `.env.example`

### Important Notes:
- Set `FRONTEND_URL` to your actual domain
- Configure webhook URL in Stripe dashboard
- Use production Stripe keys (not test keys)


