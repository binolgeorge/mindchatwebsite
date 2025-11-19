// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again after 15 minutes'
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';
const JWT_EXPIRY = process.env.SESSION_TIMEOUT || '24h';

// Admin credentials (in production, use database with hashed passwords)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'MindChat2025!Secure#Admin';

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
}

// Admin login endpoint
app.post('/api/admin/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Debug logging (remove in production)
        console.log('Login attempt:', { 
            receivedUsername: username, 
            receivedPassword: password ? '***' : 'missing',
            expectedUsername: ADMIN_USERNAME,
            usernameMatch: username === ADMIN_USERNAME,
            passwordMatch: password === ADMIN_PASSWORD
        });

        // Validate credentials
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // Generate JWT token
            const token = jwt.sign(
                { username: username, role: 'admin' },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRY }
            );

            res.json({
                success: true,
                token: token,
                expiresIn: JWT_EXPIRY,
                user: {
                    username: username,
                    role: 'admin'
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Token validation endpoint
app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

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
        discount_amount REAL DEFAULT 0,
        final_amount REAL NOT NULL,
        coupon_code TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        stripe_payment_intent_id TEXT,
        stripe_session_id TEXT,
        tracking_number TEXT,
        shipping_address TEXT NOT NULL,
        items TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Coupons table
    db.run(`CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
        discount_value REAL NOT NULL,
        min_purchase REAL DEFAULT 0,
        max_discount REAL,
        valid_from DATETIME NOT NULL,
        valid_to DATETIME NOT NULL,
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Stock table
    db.run(`CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT UNIQUE NOT NULL,
        product_name TEXT NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        reserved_quantity INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Initialize default stock for Muse 2
    db.run(`INSERT OR IGNORE INTO stock (product_id, product_name, stock_quantity) 
            VALUES ('muse2', 'Muse 2 EEG Headset', 100)`);
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
        const { name, email, phone, address, city, state, zipcode, product, quantity, total, coupon_code } = req.body;
        
        // Check stock availability
        db.get('SELECT * FROM stock WHERE product_id = ?', [product], async (err, stock) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!stock) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            const available = stock.stock_quantity - stock.reserved_quantity;
            if (available < quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock. Only ${available} units available.` 
                });
            }
            
            // Calculate discount if coupon provided
            let discountAmount = 0;
            let finalAmount = total;
            let validCouponCode = null;
            
            if (coupon_code) {
                db.get('SELECT * FROM coupons WHERE code = ? AND active = 1', [coupon_code.toUpperCase()], (err, coupon) => {
                    if (!err && coupon) {
                        const now = new Date();
                        const validFrom = new Date(coupon.valid_from);
                        const validTo = new Date(coupon.valid_to);
                        
                        if (now >= validFrom && now <= validTo) {
                            if (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) {
                                if (total >= coupon.min_purchase) {
                                    if (coupon.discount_type === 'percentage') {
                                        discountAmount = (total * coupon.discount_value) / 100;
                                        if (coupon.max_discount && discountAmount > coupon.max_discount) {
                                            discountAmount = coupon.max_discount;
                                        }
                                    } else {
                                        discountAmount = coupon.discount_value;
                                    }
                                    finalAmount = total - discountAmount;
                                    validCouponCode = coupon.code;
                                }
                            }
                        }
                    }
                    createOrder();
                });
            } else {
                createOrder();
            }
            
            async function createOrder() {
                try {
                    // Generate order ID
                    const orderId = generateOrderId();
                    
                    // Reserve stock temporarily
                    db.run(
                        'UPDATE stock SET reserved_quantity = reserved_quantity + ? WHERE product_id = ?',
                        [quantity, product]
                    );
                    
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
                                unit_amount: Math.round(finalAmount * 100), // Convert to cents
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
                            quantity: quantity.toString(),
                            coupon_code: validCouponCode || '',
                            discount_amount: discountAmount.toString()
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
                        `INSERT INTO orders (order_id, customer_email, customer_name, product_name, quantity, total_amount, discount_amount, final_amount, coupon_code, status, stripe_session_id, shipping_address, items)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
                        [orderId, email, name, product === 'muse2' ? 'Muse 2 EEG Headset' : 'EEG Product', quantity, total, discountAmount, finalAmount, validCouponCode, session.id, shippingAddress, items],
                        (err) => {
                            if (err) {
                                console.error('Database error:', err);
                            } else {
                                // Update coupon usage count if used
                                if (validCouponCode) {
                                    db.run('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?', [validCouponCode]);
                                }
                                
                                // Send notification to admin
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
                                        <p><strong>Subtotal:</strong> $${total.toFixed(2)}</p>
                                        ${discountAmount > 0 ? `<p><strong>Discount (${validCouponCode}):</strong> -$${discountAmount.toFixed(2)}</p>` : ''}
                                        <p><strong>Total:</strong> $${finalAmount.toFixed(2)}</p>
                                        <p><strong>Status:</strong> Pending Payment</p>
                                        <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
                                        <p><a href="${process.env.FRONTEND_URL}/admin.html">View in Admin Panel</a></p>
                                        `
                                    );
                                }
                            }
                        }
                    );
                    
                    res.json({ sessionId: session.id, orderId, discountAmount, finalAmount });
                } catch (error) {
                    console.error('Stripe error:', error);
                    res.status(500).json({ error: error.message });
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
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
        
        // Update order status and deduct stock
        db.get(`SELECT * FROM orders WHERE order_id = ?`, [orderId], (err, order) => {
            if (err || !order) {
                console.error('Order not found:', orderId);
                return;
            }
            
            // Deduct stock
            const productId = order.product_name.includes('Muse 2') ? 'muse2' : order.product_name.toLowerCase().replace(/\s+/g, '');
            db.run(
                `UPDATE stock SET 
                 stock_quantity = stock_quantity - ?,
                 reserved_quantity = reserved_quantity - ?,
                 updated_at = CURRENT_TIMESTAMP
                 WHERE product_id = ?`,
                [order.quantity, order.quantity, productId],
                (err) => {
                    if (err) {
                        console.error('Error deducting stock:', err);
                    }
                }
            );
            
            // Update order status
            db.run(
                `UPDATE orders SET status = 'paid', stripe_payment_intent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?`,
                [session.payment_intent, orderId],
                (err) => {
                    if (err) {
                        console.error('Database update error:', err);
                    } else {
                        // Send confirmation email to customer
                        const emailContent = `
                            <h2>Thank you for your order!</h2>
                            <p>Your order #${order.order_id} has been confirmed.</p>
                            <p><strong>Subtotal:</strong> $${order.total_amount.toFixed(2)}</p>
                            ${order.discount_amount > 0 ? `<p><strong>Discount (${order.coupon_code || 'Coupon'}):</strong> -$${order.discount_amount.toFixed(2)}</p>` : ''}
                            <p><strong>Total:</strong> $${(order.final_amount || order.total_amount).toFixed(2)}</p>
                            <p>We'll send you tracking information once your order ships.</p>
                            <p>Track your order: <a href="${process.env.FRONTEND_URL}/order-tracking.html">Click here</a></p>
                        `;
                        sendEmail(
                            order.customer_email,
                            'Order Confirmation - MindChat',
                            emailContent
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
                
                // Release stock and update order status
                const productId = order.product_name.includes('Muse 2') ? 'muse2' : order.product_name.toLowerCase().replace(/\s+/g, '');
                db.run(
                    `UPDATE stock SET 
                     stock_quantity = stock_quantity + ?,
                     reserved_quantity = reserved_quantity - ?,
                     updated_at = CURRENT_TIMESTAMP
                     WHERE product_id = ?`,
                    [order.quantity, order.quantity, productId],
                    (err) => {
                        if (err) {
                            console.error('Error releasing stock:', err);
                        }
                    }
                );
                
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
            // Just cancel if no payment - release reserved stock
            const productId = order.product_name.includes('Muse 2') ? 'muse2' : order.product_name.toLowerCase().replace(/\s+/g, '');
            
            db.run(
                `UPDATE stock SET reserved_quantity = reserved_quantity - ? WHERE product_id = ?`,
                [order.quantity, productId],
                (err) => {
                    if (err) {
                        console.error('Error releasing stock:', err);
                    }
                }
            );
            
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
app.get('/api/admin/orders', authenticateToken, (req, res) => {
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
app.get('/api/admin/orders/:orderId', authenticateToken, (req, res) => {
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
app.post('/api/admin/orders/:orderId/status', authenticateToken, (req, res) => {
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
app.post('/api/admin/orders/:orderId/refund', authenticateToken, async (req, res) => {
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

// ==================== COUPON MANAGEMENT ====================

// Get all coupons
app.get('/api/admin/coupons', authenticateToken, (req, res) => {
    db.all('SELECT * FROM coupons ORDER BY created_at DESC', (err, coupons) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ coupons });
    });
});

// Get coupon by code
app.get('/api/admin/coupons/:code', authenticateToken, (req, res) => {
    const { code } = req.params;
    db.get('SELECT * FROM coupons WHERE code = ?', [code], (err, coupon) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        res.json({ coupon });
    });
});

// Create coupon
app.post('/api/admin/coupons', authenticateToken, (req, res) => {
    const { code, discount_type, discount_value, min_purchase, max_discount, valid_from, valid_to, usage_limit, active } = req.body;
    
    if (!code || !discount_type || !discount_value || !valid_from || !valid_to) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    db.run(
        `INSERT INTO coupons (code, discount_type, discount_value, min_purchase, max_discount, valid_from, valid_to, usage_limit, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [code.toUpperCase(), discount_type, discount_value, min_purchase || 0, max_discount, valid_from, valid_to, usage_limit, active !== undefined ? active : 1],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Coupon code already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, id: this.lastID });
        }
    );
});

// Update coupon
app.put('/api/admin/coupons/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { code, discount_type, discount_value, min_purchase, max_discount, valid_from, valid_to, usage_limit, active } = req.body;
    
    db.run(
        `UPDATE coupons SET 
         code = ?, discount_type = ?, discount_value = ?, min_purchase = ?, max_discount = ?,
         valid_from = ?, valid_to = ?, usage_limit = ?, active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [code.toUpperCase(), discount_type, discount_value, min_purchase || 0, max_discount, valid_from, valid_to, usage_limit, active, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Coupon not found' });
            }
            res.json({ success: true });
        }
    );
});

// Delete coupon
app.delete('/api/admin/coupons/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM coupons WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        res.json({ success: true });
    });
});

// Get coupon metrics
app.get('/api/admin/coupons/:code/metrics', authenticateToken, (req, res) => {
    const { code } = req.params;
    
    db.get('SELECT * FROM coupons WHERE code = ?', [code], (err, coupon) => {
        if (err || !coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }
        
        db.all(
            `SELECT COUNT(*) as total_orders, 
                    SUM(discount_amount) as total_discount,
                    SUM(final_amount) as total_revenue
             FROM orders WHERE coupon_code = ? AND status != 'cancelled'`,
            [code],
            (err, stats) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({
                    coupon,
                    metrics: {
                        total_orders: stats[0]?.total_orders || 0,
                        total_discount: stats[0]?.total_discount || 0,
                        total_revenue: stats[0]?.total_revenue || 0,
                        usage_count: coupon.used_count,
                        usage_limit: coupon.usage_limit
                    }
                });
            }
        );
    });
});

// Validate coupon (public endpoint for checkout)
app.post('/api/coupons/validate', (req, res) => {
    const { code, amount } = req.body;
    
    if (!code || !amount) {
        return res.status(400).json({ error: 'Code and amount required' });
    }
    
    db.get('SELECT * FROM coupons WHERE code = ? AND active = 1', [code.toUpperCase()], (err, coupon) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!coupon) {
            return res.status(404).json({ error: 'Invalid coupon code' });
        }
        
        const now = new Date();
        const validFrom = new Date(coupon.valid_from);
        const validTo = new Date(coupon.valid_to);
        
        if (now < validFrom || now > validTo) {
            return res.status(400).json({ error: 'Coupon has expired or is not yet valid' });
        }
        
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }
        
        if (amount < coupon.min_purchase) {
            return res.status(400).json({ error: `Minimum purchase of $${coupon.min_purchase} required` });
        }
        
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (amount * coupon.discount_value) / 100;
            if (coupon.max_discount && discount > coupon.max_discount) {
                discount = coupon.max_discount;
            }
        } else {
            discount = coupon.discount_value;
        }
        
        res.json({
            valid: true,
            discount: parseFloat(discount.toFixed(2)),
            final_amount: parseFloat((amount - discount).toFixed(2))
        });
    });
});

// ==================== STOCK MANAGEMENT ====================

// Get stock
app.get('/api/admin/stock', authenticateToken, (req, res) => {
    db.all('SELECT * FROM stock ORDER BY product_name', (err, stock) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ stock });
    });
});

// Update stock
app.put('/api/admin/stock/:productId', authenticateToken, (req, res) => {
    const { productId } = req.params;
    const { stock_quantity } = req.body;
    
    if (stock_quantity === undefined || stock_quantity < 0) {
        return res.status(400).json({ error: 'Valid stock quantity required' });
    }
    
    // Check current stock to ensure we don't set below reserved
    db.get('SELECT * FROM stock WHERE product_id = ?', [productId], (err, currentStock) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!currentStock) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        if (stock_quantity < currentStock.reserved_quantity) {
            return res.status(400).json({ 
                error: `Stock cannot be set below reserved quantity (${currentStock.reserved_quantity} units reserved)` 
            });
        }
        
        db.run(
            'UPDATE stock SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?',
            [stock_quantity, productId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Product not found' });
                }
                res.json({ success: true });
            }
        );
    });
});

// Check stock availability (public endpoint)
app.get('/api/stock/:productId', (req, res) => {
    const { productId } = req.params;
    db.get('SELECT * FROM stock WHERE product_id = ?', [productId], (err, stock) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!stock) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({
            available: stock.stock_quantity - stock.reserved_quantity,
            total: stock.stock_quantity,
            reserved: stock.reserved_quantity
        });
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Seed dummy data endpoint (for development/testing)
app.post('/api/admin/seed-orders', authenticateToken, (req, res) => {
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

