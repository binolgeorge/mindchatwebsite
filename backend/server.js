// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        customer_email TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        stripe_payment_intent_id TEXT,
        stripe_session_id TEXT,
        tracking_number TEXT,
        shipping_address TEXT NOT NULL,
        items TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or use SMTP settings
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to send email
function sendEmail(to, subject, html) {
    if (!process.env.EMAIL_USER) {
        console.log('Email not configured. Would send:', { to, subject });
        return Promise.resolve();
    }
    
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    });
}

// Generate order ID
function generateOrderId() {
    return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { name, email, phone, address, city, state, zipcode, product, quantity, total } = req.body;
        
        // Generate order ID
        const orderId = generateOrderId();
        
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product === 'muse2' ? 'Muse 2 EEG Headset' : 'EEG Product',
                        description: 'MindChat compatible EEG headset',
                    },
                    unit_amount: Math.round(total * 100), // Convert to cents
                },
                quantity: quantity,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout.html`,
            customer_email: email,
            metadata: {
                order_id: orderId,
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                shipping_address: `${address}, ${city}, ${state} ${zipcode}`,
                product: product,
                quantity: quantity.toString()
            }
        });
        
        // Save order to database
        const shippingAddress = `${address}, ${city}, ${state} ${zipcode}`;
        const items = JSON.stringify([{
            name: product === 'muse2' ? 'Muse 2 EEG Headset' : 'EEG Product',
            quantity: quantity,
            price: (total / quantity).toFixed(2)
        }]);
        
        db.run(
            `INSERT INTO orders (order_id, customer_email, customer_name, product_name, quantity, total_amount, status, stripe_session_id, shipping_address, items)
             VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
            [orderId, email, name, product === 'muse2' ? 'Muse 2 EEG Headset' : 'EEG Product', quantity, total, session.id, shippingAddress, items],
            (err) => {
                if (err) {
                    console.error('Database error:', err);
                } else {
                    // Send notification to admin when order is created (before payment)
                    if (process.env.ADMIN_EMAIL) {
                        sendEmail(
                            process.env.ADMIN_EMAIL,
                            `New Order Pending Payment - ${orderId}`,
                            `
                            <h2>New Order Created!</h2>
                            <p><strong>Order ID:</strong> ${orderId}</p>
                            <p><strong>Customer:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Product:</strong> ${product === 'muse2' ? 'Muse 2 EEG Headset' : 'EEG Product'} x${quantity}</p>
                            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
                            <p><strong>Status:</strong> Pending Payment</p>
                            <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
                            <p><a href="${process.env.FRONTEND_URL}/admin.html">View in Admin Panel</a></p>
                            `
                        );
                    }
                }
            }
        );
        
        res.json({ sessionId: session.id, orderId });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for Stripe
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.order_id;
        
        // Update order status
        db.run(
            `UPDATE orders SET status = 'paid', stripe_payment_intent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?`,
            [session.payment_intent, orderId],
            (err) => {
                if (err) {
                    console.error('Database update error:', err);
                } else {
                    // Send confirmation email to customer
                    db.get(`SELECT * FROM orders WHERE order_id = ?`, [orderId], (err, order) => {
                        if (!err && order) {
                            sendEmail(
                                order.customer_email,
                                'Order Confirmation - MindChat',
                                `
                                <h2>Thank you for your order!</h2>
                                <p>Your order #${order.order_id} has been confirmed.</p>
                                <p><strong>Total:</strong> $${order.total_amount.toFixed(2)}</p>
                                <p>We'll send you tracking information once your order ships.</p>
                                <p>Track your order: <a href="${process.env.FRONTEND_URL}/order-tracking.html">Click here</a></p>
                                `
                            );
                            
                            // Send notification email to admin
                            if (process.env.ADMIN_EMAIL) {
                                sendEmail(
                                    process.env.ADMIN_EMAIL,
                                    `New Order Received - ${order.order_id}`,
                                    `
                                    <h2>New Order Received!</h2>
                                    <p><strong>Order ID:</strong> ${order.order_id}</p>
                                    <p><strong>Customer:</strong> ${order.customer_name}</p>
                                    <p><strong>Email:</strong> ${order.customer_email}</p>
                                    <p><strong>Product:</strong> ${order.product_name} x${order.quantity}</p>
                                    <p><strong>Total:</strong> $${order.total_amount.toFixed(2)}</p>
                                    <p><strong>Shipping Address:</strong> ${order.shipping_address}</p>
                                    <p><a href="${process.env.FRONTEND_URL}/admin.html">View in Admin Panel</a></p>
                                    `
                                );
                            }
                        }
                    });
                }
            }
        );
    }
    
    res.json({ received: true });
});

// Track order
app.get('/api/orders/track', (req, res) => {
    const { orderNumber, email } = req.query;
    
    db.get(
        `SELECT * FROM orders WHERE order_id = ? AND customer_email = ?`,
        [orderNumber, email],
        (err, order) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            res.json({ order });
        }
    );
});

// Get order by Stripe session ID
app.get('/api/orders/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    db.get(
        `SELECT * FROM orders WHERE stripe_session_id = ?`,
        [sessionId],
        (err, order) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            res.json({ order });
        }
    );
});

// Cancel order
app.post('/api/orders/:orderId/cancel', async (req, res) => {
    const { orderId } = req.params;
    
    db.get(`SELECT * FROM orders WHERE order_id = ?`, [orderId], async (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        if (!['pending', 'paid', 'processing'].includes(order.status)) {
            return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
        }
        
        // If payment was made, process refund
        if (order.stripe_payment_intent_id && order.status === 'paid') {
            try {
                const refund = await stripe.refunds.create({
                    payment_intent: order.stripe_payment_intent_id,
                });
                
                // Update order status
                db.run(
                    `UPDATE orders SET status = 'refunded', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?`,
                    [orderId],
                    (err) => {
                        if (err) {
                            console.error('Database update error:', err);
                        } else {
                            sendEmail(
                                order.customer_email,
                                'Order Cancelled - Refund Processed',
                                `
                                <h2>Your order has been cancelled</h2>
                                <p>Order #${order.order_id} has been cancelled and a refund has been processed.</p>
                                <p>Refund amount: $${order.total_amount.toFixed(2)}</p>
                                <p>Refunds typically take 5-10 business days to appear in your account.</p>
                                `
                            );
                        }
                    }
                );
                
                res.json({ message: 'Order cancelled and refund processed', refundId: refund.id });
            } catch (refundError) {
                console.error('Refund error:', refundError);
                return res.status(500).json({ error: 'Failed to process refund' });
            }
        } else {
            // Just cancel if no payment
            db.run(
                `UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?`,
                [orderId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    
                    sendEmail(
                        order.customer_email,
                        'Order Cancelled',
                        `<h2>Your order has been cancelled</h2><p>Order #${order.order_id} has been cancelled.</p>`
                    );
                    
                    res.json({ message: 'Order cancelled' });
                }
            );
        }
    });
});

// Admin: Get all orders
app.get('/api/admin/orders', (req, res) => {
    const { status, limit = 1000, dateFrom, dateTo } = req.query;
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    
    if (dateFrom) {
        query += ' AND DATE(created_at) >= ?';
        params.push(dateFrom);
    }
    
    if (dateTo) {
        query += ' AND DATE(created_at) <= ?';
        params.push(dateTo);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (limit && limit < 10000) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
    }
    
    db.all(query, params, (err, orders) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ orders });
    });
});

// Admin: Get single order by ID
app.get('/api/admin/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    db.get(
        `SELECT * FROM orders WHERE order_id = ?`,
        [orderId],
        (err, order) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            res.json({ order });
        }
    );
});

// Admin: Update order status
app.post('/api/admin/orders/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;
    
    let query = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];
    
    if (trackingNumber) {
        query += ', tracking_number = ?';
        params.push(trackingNumber);
    }
    
    query += ' WHERE order_id = ?';
    params.push(orderId);
    
    db.run(query, params, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Send shipping notification
        if (status === 'shipped' && trackingNumber) {
            db.get(`SELECT * FROM orders WHERE order_id = ?`, [orderId], (err, order) => {
                if (!err && order) {
                    sendEmail(
                        order.customer_email,
                        'Your Order Has Shipped!',
                        `
                        <h2>Your order is on the way!</h2>
                        <p>Order #${order.order_id} has been shipped.</p>
                        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
                        <p><a href="https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}">Track your package</a></p>
                        `
                    );
                }
            });
        }
        
        res.json({ message: 'Order status updated' });
    });
});

// Admin: Process refund
app.post('/api/admin/orders/:orderId/refund', async (req, res) => {
    const { orderId } = req.params;
    const { amount, reason, notes } = req.body;
    
    db.get(`SELECT * FROM orders WHERE order_id = ?`, [orderId], async (err, order) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Validation checks
        if (order.status === 'refunded') {
            return res.status(400).json({ error: 'Order has already been refunded' });
        }
        
        if (order.status === 'pending') {
            return res.status(400).json({ error: 'Cannot refund a pending order. Cancel it instead.' });
        }
        
        if (!order.stripe_payment_intent_id) {
            return res.status(400).json({ error: 'No payment to refund. This order was not paid through Stripe.' });
        }
        
        // Validate refund amount
        const orderTotal = parseFloat(order.total_amount);
        let refundAmount = amount ? parseFloat(amount) : orderTotal;
        
        if (isNaN(refundAmount) || refundAmount <= 0) {
            return res.status(400).json({ error: 'Invalid refund amount' });
        }
        
        if (refundAmount > orderTotal) {
            return res.status(400).json({ error: `Refund amount ($${refundAmount.toFixed(2)}) cannot exceed order total ($${orderTotal.toFixed(2)})` });
        }
        
        // Validate reason
        if (!reason) {
            return res.status(400).json({ error: 'Refund reason is required' });
        }
        
        try {
            // Create refund in Stripe
            const refundAmountCents = Math.round(refundAmount * 100);
            
            const refund = await stripe.refunds.create({
                payment_intent: order.stripe_payment_intent_id,
                amount: refundAmountCents,
                reason: 'requested_by_customer', // or 'duplicate', 'fraudulent'
                metadata: {
                    order_id: orderId,
                    refund_reason: reason,
                    refund_notes: notes || '',
                    refund_type: amount ? 'partial' : 'full'
                }
            });
            
            // Create refunds table if it doesn't exist
            db.run(`CREATE TABLE IF NOT EXISTS refunds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                refund_id TEXT NOT NULL,
                amount REAL NOT NULL,
                reason TEXT,
                notes TEXT,
                status TEXT DEFAULT 'completed',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(order_id)
            )`);
            
            // Record refund in database
            db.run(
                `INSERT INTO refunds (order_id, refund_id, amount, reason, notes) VALUES (?, ?, ?, ?, ?)`,
                [orderId, refund.id, refundAmount, reason, notes || null],
                (err) => {
                    if (err) {
                        console.error('Error recording refund:', err);
                    }
                }
            );
            
            // Update order status
            const newStatus = refundAmount === orderTotal ? 'refunded' : order.status; // Only mark as refunded if full refund
            
            db.run(
                `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?`,
                [newStatus, orderId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Database error updating order' });
                    }
                    
                    // Send email notification
                    const refundTypeText = refundAmount === orderTotal ? 'full' : 'partial';
                    const refundReasonText = {
                        'customer_request': 'Customer Request',
                        'defective_item': 'Defective Item',
                        'wrong_item': 'Wrong Item Shipped',
                        'not_delivered': 'Item Not Delivered',
                        'duplicate_order': 'Duplicate Order',
                        'fraudulent': 'Fraudulent Transaction',
                        'other': 'Other'
                    }[reason] || reason;
                    
                    sendEmail(
                        order.customer_email,
                        'Refund Processed - Order #' + orderId,
                        `
                        <h2>Refund Processed</h2>
                        <p>Your ${refundTypeText} refund for order <strong>#${order.order_id}</strong> has been processed.</p>
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                            <p><strong>Refund Amount:</strong> $${refundAmount.toFixed(2)}</p>
                            <p><strong>Reason:</strong> ${refundReasonText}</p>
                            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                            <p><strong>Refund ID:</strong> ${refund.id}</p>
                        </div>
                        <p>Refunds typically take 5-10 business days to appear in your account.</p>
                        <p>If you have any questions, please contact our support team.</p>
                        `
                    );
                    
                    res.json({ 
                        success: true,
                        message: 'Refund processed successfully',
                        refundId: refund.id,
                        amount: refundAmount,
                        type: refundTypeText
                    });
                }
            );
        } catch (refundError) {
            console.error('Refund error:', refundError);
            
            // Provide more specific error messages
            let errorMessage = 'Failed to process refund';
            if (refundError.type === 'StripeCardError') {
                errorMessage = refundError.message;
            } else if (refundError.type === 'StripeInvalidRequestError') {
                errorMessage = 'Invalid refund request: ' + refundError.message;
            }
            
            res.status(500).json({ error: errorMessage });
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Seed dummy data endpoint (for development/testing)
app.post('/api/admin/seed-orders', (req, res) => {
    const { count = 200 } = req.body;
    
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 'William', 'Sophia', 'Richard', 'Isabella', 'Joseph', 'Ava', 'Thomas', 'Mia', 'Charles', 'Charlotte'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA'];
    const statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    const statusWeights = [0.1, 0.15, 0.2, 0.25, 0.2, 0.1]; // Weighted distribution
    
    function getRandomStatus() {
        const rand = Math.random();
        let sum = 0;
        for (let i = 0; i < statuses.length; i++) {
            sum += statusWeights[i];
            if (rand <= sum) return statuses[i];
        }
        return statuses[statuses.length - 1];
    }
    
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    function generateOrderId() {
        return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    
    const orders = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const customerName = `${firstName} ${lastName}`;
        const customerEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
        const city = getRandomElement(cities);
        const state = states[cities.indexOf(city)];
        const zipcode = Math.floor(10000 + Math.random() * 90000);
        const streetNumber = Math.floor(Math.random() * 9999) + 1;
        const streetNames = ['Main St', 'Oak Ave', 'Park Blvd', 'Elm St', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'First St', 'Second Ave', 'Washington Blvd'];
        const street = `${streetNumber} ${getRandomElement(streetNames)}`;
        const shippingAddress = `${street}\n${city}, ${state} ${zipcode}`;
        
        const quantity = Math.floor(Math.random() * 3) + 1;
        const basePrice = 249.00;
        const totalAmount = (basePrice * quantity * (1 + Math.random() * 0.1)).toFixed(2);
        const status = getRandomStatus();
        
        // Generate dates within last 90 days
        const daysAgo = Math.floor(Math.random() * 90);
        const orderDate = new Date(now);
        orderDate.setDate(orderDate.getDate() - daysAgo);
        orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
        
        const orderId = generateOrderId();
        const items = JSON.stringify([{
            name: 'Muse 2 EEG Headset',
            quantity: quantity,
            price: (parseFloat(totalAmount) / quantity).toFixed(2)
        }]);
        
        const trackingNumber = status === 'shipped' || status === 'delivered' 
            ? `USPS${Math.random().toString(36).substr(2, 9).toUpperCase()}` 
            : null;
        
        orders.push({
            order_id: orderId,
            customer_email: customerEmail,
            customer_name: customerName,
            product_name: 'Muse 2 EEG Headset',
            quantity: quantity,
            total_amount: totalAmount,
            status: status,
            tracking_number: trackingNumber,
            shipping_address: shippingAddress,
            items: items,
            created_at: orderDate.toISOString()
        });
    }
    
    // Insert orders in batches
    const batchSize = 50;
    let inserted = 0;
    let errors = 0;
    
    function insertBatch(batch) {
        return new Promise((resolve, reject) => {
            const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const values = batch.flatMap(order => [
                order.order_id,
                order.customer_email,
                order.customer_name,
                order.product_name,
                order.quantity,
                order.total_amount,
                order.status,
                order.tracking_number,
                order.shipping_address,
                order.items,
                order.created_at
            ]);
            
            const query = `INSERT INTO orders (order_id, customer_email, customer_name, product_name, quantity, total_amount, status, tracking_number, shipping_address, items, created_at) VALUES ${placeholders}`;
            
            db.run(query, values, function(err) {
                if (err) {
                    console.error('Error inserting batch:', err);
                    errors += batch.length;
                    resolve();
                } else {
                    inserted += batch.length;
                    resolve();
                }
            });
        });
    }
    
    async function insertAll() {
        for (let i = 0; i < orders.length; i += batchSize) {
            const batch = orders.slice(i, i + batchSize);
            await insertBatch(batch);
        }
        
        res.json({
            success: true,
            message: `Seeded ${inserted} orders successfully`,
            inserted: inserted,
            errors: errors
        });
    }
    
    insertAll();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Stripe configured: ${process.env.STRIPE_SECRET_KEY ? 'Yes' : 'No'}`);
});

