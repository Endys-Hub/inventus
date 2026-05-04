# Inventus — POS & Inventory Management SaaS

Inventus is a full-stack **multi-tenant Point of Sale (POS) and Inventory Management system** built for small to medium-sized businesses. It enables business owners to manage sales, inventory, staff, and operations from a single, streamlined platform.

Inventus is designed not just as a tool — but as a **scalable SaaS product** ready for real-world business use.

---

## 🚀 Core Features

### 🧾 Point of Sale (POS)
- Fast product search with debounce
- Real-time cart updates
- Multi-item checkout
- Receipt generation (print-ready)
- Automatic stock deduction
- Payment method tracking

---

### 📦 Inventory Management
- Product CRUD operations
- Category management
- Supplier management
- Purchase tracking (auto stock increase)
- Low-stock alerts
- Strict stock validation (no negative stock)

---

### 👥 Staff Management
- Business owners can onboard staff directly from the app
- Create Managers and Cashiers
- Automatic business assignment
- Role-based system enforcement
- No developer involvement required

---

### 🔐 Authentication & Authorization
- JWT-based authentication (access + refresh tokens)
- Role-based access control:
  - OWNER
  - MANAGER
  - CASHIER
- Protected routes on frontend
- Secure logout + token handling

---

### 🔑 Password Recovery
- Forgot password flow implemented
- Token-based password reset
- Secure validation using Django’s token system
- Email-ready architecture (manual token flow for now)
- Auto-filled reset flow for better UX

---

### 📊 Dashboard & Analytics
- Revenue overview
- Expense tracking
- Profit insights
- Time filters (daily, weekly, monthly)
- Low-stock monitoring
- Sales performance tracking

---

### 💰 Sales & Expenses
- Multi-item sales transactions
- Expense tracking system
- Sales history with filtering
- Real-time updates

---

### 📱 UX & Responsiveness
- Fully mobile responsive
- Optimized layouts for all screen sizes
- Loading states and feedback
- Error handling with fallback UI
- Smooth navigation and consistent layout

---

### 🌐 Landing Page
- SaaS-style marketing entry point
- Product explanation before login
- Clear call-to-action (Register / Login)
- Improves conversion and first impression

---

### ⚡ Performance & Reliability
- Optimized API responses
- Efficient state handling
- Safe async operations
- Prevention of duplicate submissions
- Stable session handling (no random logouts)

---

### 🧪 Testing & Quality
- Django test suite (36+ tests)
- Permission validation tests
- Inventory integrity enforcement
- Sales flow validation
- CI linting and build checks

---

### 🔄 CI/CD
- GitHub Actions pipeline
- Backend test execution on push/PR
- Frontend linting and build validation
- Automated deployment workflows

---

## 🏗️ Tech Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL (production)
- SimpleJWT (authentication)
- WhiteNoise (static files)

### Frontend
- React (Vite)
- React Router
- Context API
- Axios (API communication)
- Recharts (analytics)

### DevOps
- Render (backend hosting)
- Vercel (frontend hosting)
- GitHub Actions (CI/CD)

---

## 📁 Project Structure

backend/
  posapi/
    settings/
      base.py
      dev.py
      prod.py
      test.py
  inventory/
  sales/
  users/
  expenses/

frontend/
  src/
    components/
    pages/
    services/
    hooks/
    context/

---

## ⚙️ Environment Variables

### Backend (.env)

SECRET_KEY=your_secret_key  
DATABASE_URL=your_database_url  
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app  
CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app  

---

### Frontend (.env.production)

VITE_API_BASE_URL=https://your-backend.onrender.com  

---

## 🛠️ Local Setup

### Backend

cd backend  
python -m venv venv  
venv\Scripts\activate  (Windows)  
source venv/bin/activate  (Mac/Linux)  
pip install -r requirements.txt  
python manage.py migrate  
python manage.py runserver  

---

### Frontend

cd frontend  
npm install  
npm run dev  

---

## 🧪 Running Tests

cd backend  
python manage.py test --settings=posapi.settings.test  

---

## 🚀 Deployment

### Backend (Render)
- Build Command: ./build.sh  
- Start Command: gunicorn posapi.wsgi:application  

### Frontend (Vercel)
- Build Command: npm run build  
- Output Directory: dist  

---

## 🔐 Security Notes

- Never commit .env files
- Use HTTPS in production
- Configure CORS and CSRF properly
- Rotate secrets periodically
- Validate user permissions on all endpoints

---

## 📈 Product Capabilities

Inventus is built as a **multi-tenant SaaS system**, meaning:

- Each business operates in isolation
- Users only access data within their business
- Owners control staff and operations
- System scales across multiple businesses

---

## 🚧 Roadmap

- Email integration (SendGrid / Resend)
- Staff invitation via email
- Payment integration (Paystack)
- Subscription billing system
- Advanced analytics dashboard
- Mobile app version

---

## 📄 License

Proprietary — All rights reserved.

---

## 🤝 Acknowledgements

Inventus is built with a focus on:
- Real-world business workflows
- Simplicity and usability
- Performance and scalability
- Production readiness

---

## 💡 Vision

Inventus is designed to help businesses:
- Stay organized  
- Reduce losses  
- Improve visibility  
- Grow with confidence  