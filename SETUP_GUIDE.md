# Quick Setup Guide

## Step-by-Step Setup

### 1. Install PostgreSQL
- Download and install PostgreSQL from https://www.postgresql.org/download/
- Create a database named `fitplanhub`:
  ```sql
  CREATE DATABASE fitplanhub;
  ```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/fitplanhub?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=5000
NODE_ENV=development
```

Initialize database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Prisma Studio (optional): Run `npm run prisma:studio` in backend folder

## Testing the Application

1. **Create a Trainer Account**
   - Go to Signup
   - Select "Trainer" role
   - Create account and login
   - You'll be redirected to Trainer Dashboard
   - Create a fitness plan

2. **Create a User Account**
   - Go to Signup (or logout if logged in as trainer)
   - Select "User" role
   - Create account and login
   - You'll be redirected to User Feed

3. **Test User Features**
   - Browse plans on landing page
   - Click on a plan to see preview
   - Subscribe to a plan
   - View full plan details after subscription
   - Follow a trainer
   - View personalized feed

## Common Issues

**Database Connection Error**
- Make sure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database exists: `psql -U postgres -c "SELECT datname FROM pg_database;"`

**CORS Errors**
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend/.env matches backend URL

**Authentication Issues**
- Clear browser localStorage
- Check JWT_SECRET is set in backend/.env
- Verify token hasn't expired (default: 7 days)
