# Inventus — POS & Inventory Management System

Inventus is a full-stack Point of Sale (POS) and Inventory Management system designed for small to medium-sized businesses. It enables real-time sales processing, stock management, expense tracking, and business analytics — all in one streamlined platform.

---

## 🚀 Features

### 🧾 Point of Sale (POS)
- Fast product search with debounce
- Barcode scanning support
- Keyboard shortcuts for rapid checkout
- Real-time cart updates
- Receipt generation (print-ready, 80mm format)
- Offline sales queue with auto-sync

### 📦 Inventory Management
- Product CRUD operations
- Category and supplier management
- Purchase tracking (auto stock increase)
- Low-stock alerts
- Stock integrity enforcement (no negative stock)

### 💰 Sales & Expenses
- Multi-item sales transactions
- Automatic stock deduction on sale
- Expense tracking
- Sales history and filtering

### 📊 Dashboard & Analytics
- Revenue, expenses, and profit overview
- Time-based filters (today, week, month)
- Sales trends visualization
- Revenue vs expenses charts
- Low-stock monitoring

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access:
  - OWNER
  - MANAGER
  - CASHIER
- Secure logout with token invalidation

### ⚡ Performance & UX
- React Query (TanStack) for caching
- Loading states and error handling
- Skeleton loaders
- Paginated API responses

### 🧪 Testing & Reliability
- Django test suite (36+ tests)
- Inventory integrity tests
- Permission enforcement tests
- Sales flow validation

### 🔄 CI/CD
- GitHub Actions pipeline
- Backend tests on push/PR
- Frontend build verification
- Linting (flake8 + ESLint)
- Optional deploy hooks (Render + Vercel)

---

## 🏗️ Tech Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL (production)
- SimpleJWT
- WhiteNoise

### Frontend
- React (Vite)
- React Router
- React Query
- Recharts

### DevOps
- Render (backend)
- Vercel (frontend)
- GitHub Actions (CI/CD)

---

## 📁 Project Structure

backend/
  posapi/
    settings/
      base.py
      dev.py
      prod.py
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

## 🛠️ Setup Instructions

### Backend

cd backend  
python -m venv venv  
source venv/bin/activate  (or venv\Scripts\activate on Windows)  
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
- Build: ./build.sh  
- Start: gunicorn posapi.wsgi:application  

### Frontend (Vercel)
- Build: npm run build  
- Output: dist  

---

## 🔐 Security Notes

- Do NOT commit .env files
- Rotate secrets before production
- Use HTTPS in production
- Restrict CORS properly

---

## 📈 Future Improvements

- Multi-tenant SaaS support
- Payment integration (Paystack)
- Advanced analytics
- Mobile optimization

---

## 📄 License

Proprietary — All rights reserved.

---

## 🤝 Acknowledgements

Built with a focus on real-world usability, performance, and reliability.