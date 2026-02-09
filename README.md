# MindChat - Mental Health Support Platform

A comprehensive mental health monitoring and support platform that combines EEG brain monitoring, AI coaching, and evidence-based mental wellness tools.

## 🧠 About MindChat

MindChat is an innovative mental health platform that integrates wearable EEG technology (Muse 2 headset) with AI-powered coaching to provide objective, data-driven mental wellness support. Our platform helps users track their mental state, receive personalized recommendations, and access professional support when needed.

## 🌟 Key Features

- **Brain Monitoring Integration**: Real-time EEG data capture using Muse 2 headset
- **AI Coach**: Personalized mental health recommendations based on neural biomarkers
- **Evidence-Based Approach**: Built on peer-reviewed neuroscience and psychology research
- **Validated Assessments**: PHQ-9, GAD-7, PSS-10, and other clinical-grade questionnaires
- **Provider Dashboard**: Healthcare professionals can monitor and support their patients
- **Concussion Awareness**: Post-impact neural monitoring support (non-diagnostic)
- **E-commerce Integration**: Direct purchase of Muse 2 EEG headsets

## 📁 Project Structure

```
mindchatwebsite-main/
├── index.html              # Landing page
├── about.html              # Team and company information
├── science.html            # Scientific foundation and research
├── buy.html                # Muse headset purchase page
├── checkout.html           # E-commerce checkout
├── contact.html            # Contact form
├── order-tracking.html     # Order status tracking
├── order-success.html      # Order confirmation page
├── admin.html              # Admin order management
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   └── main.js             # Frontend JavaScript
├── images/                 # Static images
├── backend/
│   ├── server.js           # Node.js/Express backend (e-commerce)
│   └── database.sqlite     # Order database
├── mindchat-backend-main/  # Python/FastAPI backend (main app)
└── mindchat-frontend-main/ # React web dashboard

```

## 🚀 Quick Start

### E-commerce Backend (Node.js)

1. Navigate to backend folder:
```bash
cd backend
npm install
```

2. Set up environment variables (create `.env`):
```env
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

3. Start the backend:
```bash
node server.js
```
Backend runs on `http://localhost:3001`

### Main Website

Simply open `index.html` in a web browser, or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000
```

### React Dashboard (Optional)

1. Navigate to frontend folder:
```bash
cd mindchat-frontend-main
npm install
```

2. Configure backend URL in `public/config.js`:
```javascript
window.ENV = {
  BACKEND_URL: "http://localhost:8000"
};
```

3. Start development server:
```bash
npm run dev
```

### Python Backend (Optional)

1. Navigate to backend folder:
```bash
cd mindchat-backend-main
pip install -r requirements.txt
```

2. Set up environment variables (create `.env`):
```env
DATABASE_URL=sqlite:///./mindchat_local.db
SECRET_KEY=your_secret_key
SENDGRID_API_KEY=your_sendgrid_key
STRIPE_SECRET_KEY=your_stripe_key
```

3. Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

## 🛠 Technology Stack

### Frontend
- **HTML/CSS/JavaScript**: Static marketing website
- **React + TypeScript**: Provider dashboard
- **Vite**: Build tool for React app
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components

### Backend
- **Node.js + Express**: E-commerce backend
- **Python + FastAPI**: Main application backend
- **SQLite**: Local development database
- **PostgreSQL**: Production database (recommended)

### Integration & Services
- **Stripe**: Payment processing
- **SendGrid**: Email notifications
- **Nodemailer**: Order confirmation emails
- **Muse SDK**: EEG headset integration

### Mobile App
- **React Native + Expo**: Mobile application
- **Redux Toolkit**: State management
- **React Native Paper**: UI components

## 🧪 Key Research Areas

MindChat is built on peer-reviewed evidence across:
1. Validated self-report scales (PHQ-9, GAD-7, PSS-10)
2. EEG biomarkers and alpha asymmetry
3. Wearable EEG technology (Muse)
4. Concussion and mild TBI biomarkers
5. CBT and digital interventions
6. Mindfulness and lifestyle factors
7. Pharmacology and treatment approaches
8. Anxiety disorders and social anxiety
9. Diagnostic guides and epidemiology

*See `science.html` for complete reference list*

## 🛒 E-commerce Features

- Product catalog (Muse 2 headset)
- Stripe checkout integration
- Order tracking system
- Email notifications
- Admin order management dashboard
- Guest checkout (no login required)

## 📱 Provider Dashboard

- Patient management
- Test results visualization
- EEG data analysis
- Conversation history
- Report generation
- Marketplace for equipment

## ⚠️ Important Disclaimer

MindChat is a **mental wellness support tool** and is NOT:
- A diagnostic tool
- A replacement for professional medical care
- FDA-approved medical device
- A treatment for any condition

**Always consult qualified healthcare professionals for diagnosis and treatment.**

## 🔐 Security Features

- JWT authentication
- Password hashing (bcrypt)
- HTTPS support
- Environment variable protection
- Input validation
- CORS configuration
- Rate limiting (backend)

## 📄 License

Copyright © 2026 MindChat. All rights reserved.

