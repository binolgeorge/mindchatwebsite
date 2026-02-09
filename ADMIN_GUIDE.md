# Admin Guide - Order Management System

## How Admins Know About New Orders

### Current System:
1. **Admin Panel** - View all orders in real-time
2. **Stripe Dashboard** - See payments (but not full order details)
3. **Database** - All orders stored locally

### Access Admin Panel:
**URL**: http://localhost:3000/admin.html

The admin panel:
- Shows all orders in a table
- Auto-refreshes every 30 seconds
- Displays order status, customer info, amounts
- Allows updating order status
- Allows processing refunds

## Admin Capabilities

### 1. View All Orders
- See all orders in one place
- Filter by status (pending, paid, shipped, etc.)
- See customer details, order amounts, dates

### 2. Update Order Status
- Change status: pending → paid → processing → shipped → delivered
- Add tracking numbers when shipping
- Customer automatically gets email notification

### 3. Process Refunds
- Full refunds (automatic)
- Partial refunds (specify amount)
- Refunds processed through Stripe
- Customer gets email confirmation

## Stripe Dashboard vs Admin Panel

### Stripe Dashboard Shows:
- ✅ Payment transactions
- ✅ Payment status
- ✅ Refund history
- ✅ Customer payment methods
- ❌ Shipping addresses
- ❌ Order details (products, quantities)
- ❌ Tracking numbers
- ❌ Order fulfillment status

### Your Admin Panel Shows:
- ✅ Complete order information
- ✅ Customer shipping details
- ✅ Product details and quantities
- ✅ Order status workflow
- ✅ Tracking numbers
- ✅ Full order history

## Recommended Workflow

1. **New Order Placed**:
   - Admin checks admin panel (http://localhost:3000/admin.html)
   - Or receives email notification (if configured)

2. **Payment Confirmed**:
   - Order status automatically updates to "paid" via webhook
   - Admin sees it in admin panel

3. **Processing Order**:
   - Admin updates status to "processing"
   - Prepares shipment

4. **Shipping**:
   - Admin updates status to "shipped"
   - Adds tracking number
   - Customer gets email automatically

5. **Refunds** (if needed):
   - Admin clicks "Refund" button
   - Processes through Stripe
   - Customer gets email confirmation

## Setting Up Admin Email Notifications

To get email alerts when orders are placed, add to `backend/.env`:

```
ADMIN_EMAIL=your-admin-email@example.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Then admins will receive emails for:
- New orders placed
- Payment confirmations
- Order cancellations

## Security Note

**Important**: The admin panel currently has NO authentication. For production:

1. Add login/password protection
2. Use environment variables for admin credentials
3. Or restrict access by IP address
4. Consider using a proper admin framework

## Quick Access

- **Admin Panel**: http://localhost:3000/admin.html
- **Stripe Dashboard**: https://dashboard.stripe.com/test/payments
- **Backend API**: http://localhost:3001/api/admin/orders



