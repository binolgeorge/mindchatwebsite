# Admin Order Management - Complete Guide

## How Admin Knows About New Orders

### Method 1: Admin Panel (Real-time) ⭐ RECOMMENDED
**URL**: http://localhost:3000/admin.html

- **Auto-refreshes every 30 seconds**
- Shows all orders in a table
- Color-coded status badges
- Click "Refresh" to update immediately

### Method 2: Email Notifications (Instant)
When you add `ADMIN_EMAIL` to your `.env` file, you'll receive emails:
- ✅ When order is created (pending payment)
- ✅ When payment is confirmed
- ✅ When order is cancelled
- ✅ When refund is processed

**Setup**: Add to `backend/.env`:
```
ADMIN_EMAIL=your-admin-email@example.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Method 3: Stripe Dashboard
**URL**: https://dashboard.stripe.com/test/payments

Stripe shows:
- ✅ Payment transactions
- ✅ Payment amounts
- ✅ Payment status
- ❌ **Does NOT show**: Shipping addresses, order details, tracking numbers

**Use Stripe for**: Payment verification, refund processing
**Use Admin Panel for**: Complete order management

## Admin Panel Features

### View All Orders
- See all orders in one table
- View customer details
- See order amounts and dates
- Filter by status (via API)

### Update Order Status
1. Click "Update" button on any order
2. Select new status:
   - **Pending** → Waiting for payment
   - **Paid** → Payment received
   - **Processing** → Preparing order
   - **Shipped** → Order shipped (add tracking number)
   - **Delivered** → Order completed
   - **Cancelled** → Order cancelled
3. Add tracking number (when shipping)
4. Customer automatically gets email notification

### Process Refunds
1. Click "Refund" button (only shows for paid/processing orders)
2. Enter amount (or leave empty for full refund)
3. Refund processed through Stripe
4. Customer gets email confirmation
5. Order status updates to "refunded"

## Complete Order Workflow

### Step 1: Order Placed
- Customer fills checkout form
- Order created in database (status: "pending")
- Admin gets email notification (if configured)
- Order appears in admin panel

### Step 2: Payment Confirmed
- Customer completes Stripe checkout
- Stripe webhook updates order to "paid"
- Admin gets email notification
- Order shows as "paid" in admin panel

### Step 3: Admin Processes Order
- Admin opens admin panel
- Sees new order with "paid" status
- Updates status to "processing"
- Prepares shipment

### Step 4: Admin Ships Order
- Admin updates status to "shipped"
- Adds tracking number (e.g., USPS tracking)
- Customer automatically gets email with tracking info
- Order shows tracking number in admin panel

### Step 5: Order Delivered
- Admin updates status to "delivered"
- Order marked as complete

## Stripe Dashboard vs Admin Panel

| Feature | Stripe Dashboard | Your Admin Panel |
|---------|------------------|------------------|
| Payment Info | ✅ Yes | ✅ Yes |
| Customer Email | ✅ Yes | ✅ Yes |
| Shipping Address | ❌ No | ✅ Yes |
| Product Details | ❌ No | ✅ Yes |
| Order Quantities | ❌ No | ✅ Yes |
| Tracking Numbers | ❌ No | ✅ Yes |
| Order Status | ❌ No | ✅ Yes |
| Refund Processing | ✅ Yes | ✅ Yes |
| Order History | ✅ Yes | ✅ Yes |

**Recommendation**: Use both!
- **Stripe Dashboard**: For payment verification and financial records
- **Admin Panel**: For order fulfillment and customer service

## Setting Up Admin Email Notifications

1. **Get Gmail App Password** (if using Gmail):
   - Go to https://myaccount.google.com/apppasswords
   - Generate app password for "Mail"
   - Copy the password

2. **Update `backend/.env`**:
   ```
   ADMIN_EMAIL=admin@yourdomain.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

3. **Restart backend server**:
   ```bash
   cd backend
   npm start
   ```

4. **Test**: Place a test order and check admin email

## Admin Panel Access

**Local Development**: http://localhost:3000/admin.html

**Production**: https://yourdomain.com/admin.html

⚠️ **Security Note**: Currently no authentication. For production, add:
- Login/password protection
- IP whitelist
- Or use a proper admin framework

## Quick Reference

### Admin Panel URL
```
http://localhost:3000/admin.html
```

### API Endpoints (for custom integrations)
```
GET  /api/admin/orders              # Get all orders
POST /api/admin/orders/:id/status   # Update order status
POST /api/admin/orders/:id/refund   # Process refund
```

### Stripe Dashboard
```
https://dashboard.stripe.com/test/payments  # Test mode
https://dashboard.stripe.com/payments      # Live mode
```

## Troubleshooting

### Admin not receiving emails?
- Check `ADMIN_EMAIL` is set in `.env`
- Check `EMAIL_USER` and `EMAIL_PASS` are correct
- Check spam folder
- Verify email service is working

### Orders not showing in admin panel?
- Check backend is running on port 3001
- Check browser console for errors
- Verify API endpoint is accessible
- Click "Refresh" button

### Can't update order status?
- Check backend is running
- Check browser console for errors
- Verify order exists in database
- Check network tab for API errors

---

**You're all set!** Open http://localhost:3000/admin.html to start managing orders.



