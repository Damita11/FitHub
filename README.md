# FitSync - Trainers & Users Platform

A full-stack fitness platform where certified trainers create fitness plans and users purchase & follow these plans. Built with Node.js, Express, PostgreSQL, Prisma, and React.

## 🎯 Project Overview

FitSync is a comprehensive platform that connects fitness trainers with users through subscription-based fitness plans. The platform features role-based access control, subscription management, trainer following functionality, and personalized feeds.

## ✨ Features

### Authentication & Authorization
- **User & Trainer Signup/Login**: Separate registration flows for regular users and trainers
- **JWT Token Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Role-Based Access Control**: Different permissions for users and trainers

### Trainer Features
- **Create Fitness Plans**: Trainers can create plans with title, description, price, and duration
- **Manage Plans**: Edit and delete their own fitness plans
- **View Subscribers**: See how many users have subscribed to each plan
- **Trainer Dashboard**: Dedicated dashboard for managing plans

### User Features
- **Browse Plans**: View all available fitness plans with preview information
- **Subscribe to Plans**: Purchase subscriptions to access full plan details
- **Follow Trainers**: Follow/unfollow trainers to see their plans in personalized feed
- **Personalized Feed**: View plans from followed trainers
- **View Plan Details**: Access full plan details for subscribed plans, preview for others

### Access Control
- **Preview Mode**: Non-subscribers see only title, trainer name, and price
- **Full Access**: Subscribed users can view complete plan descriptions
- **Subscription Expiry**: Automatic expiration based on plan duration

## 🏗️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Prisma** - ORM for database management
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## 📁 Project Structure

```
fitnesshub/
├── backend/
│   ├── config/
│   │   └── database.js          # Prisma client configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── planController.js    # Fitness plan CRUD operations
│   │   ├── subscriptionController.js  # Subscription management
│   │   ├── followController.js  # Follow/unfollow functionality
│   │   ├── feedController.js    # Personalized feed logic
│   │   └── userController.js    # User profile operations
│   ├── middleware/
│   │   └── auth.js              # Authentication & authorization middleware
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── planRoutes.js       # Plan management routes
│   │   ├── subscriptionRoutes.js  # Subscription routes
│   │   ├── followRoutes.js     # Follow routes
│   │   ├── feedRoutes.js       # Feed routes
│   │   └── userRoutes.js       # User routes
│   ├── utils/
│   │   └── auth.js             # Authentication utilities
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── server.js               # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx  # Protected route component
│   │   ├── config/
│   │   │   └── api.js           # Axios configuration
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Home page with plan previews
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Signup.jsx       # Signup page
│   │   │   ├── TrainerDashboard.jsx  # Trainer plan management
│   │   │   ├── PlanDetails.jsx  # Individual plan view
│   │   │   ├── UserFeed.jsx    # Personalized user feed
│   │   │   └── TrainerProfile.jsx  # Trainer profile page
│   │   ├── utils/
│   │   │   └── auth.js         # Frontend auth utilities
│   │   ├── App.jsx             # Main app component with routing
│   │   └── main.jsx            # React entry point
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

### Tables

1. **Users** - Stores user accounts (both regular users and trainers)
   - id, email, password, name, role, timestamps

2. **Trainers** - Trainer-specific information
   - id, userId (FK), certification, bio, specialization, timestamps

3. **FitnessPlans** - Fitness plans created by trainers
   - id, trainerId (FK), title, description, price, duration, timestamps

4. **Subscriptions** - User subscriptions to plans
   - id, userId (FK), planId (FK), purchasedAt, expiresAt, status, timestamps
   - Unique constraint on (userId, planId)

5. **Follows** - User-trainer follow relationships
   - id, userId (FK), trainerId (FK), createdAt
   - Unique constraint on (userId, trainerId)

See `DATABASE_SCHEMA.md` for detailed schema documentation.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitnesshub
   ```

2. **Set up the backend**

   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/FitSync?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate

   # (Optional) Open Prisma Studio to view data
   npm run prisma:studio
   ```

5. **Set up the frontend**

   ```bash
   cd ../frontend
   npm install
   ```

6. **Configure frontend environment**

   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**

   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will run on `http://localhost:5173` (or another port if 5173 is taken)

3. **Open your browser**

   Navigate to `http://localhost:5173` to see the application

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user or trainer
- `POST /api/auth/login` - Login user or trainer
- `GET /api/auth/me` - Get current user (protected)

### Fitness Plans
- `GET /api/plans` - Get all plans (public, preview data)
- `GET /api/plans/:id` - Get plan by ID (preview or full based on subscription)
- `POST /api/plans` - Create new plan (trainer only)
- `GET /api/plans/trainer/my-plans` - Get trainer's plans (trainer only)
- `PUT /api/plans/:id` - Update plan (trainer, owner only)
- `DELETE /api/plans/:id` - Delete plan (trainer, owner only)

### Subscriptions
- `POST /api/subscriptions/:planId` - Subscribe to a plan (user only)
- `GET /api/subscriptions` - Get user's subscriptions (user only)
- `GET /api/subscriptions/:id` - Get subscription by ID (user only)

### Follows
- `POST /api/follows/:trainerId` - Follow a trainer (user only)
- `DELETE /api/follows/:trainerId` - Unfollow a trainer (user only)
- `GET /api/follows/following` - Get following list (user only)
- `GET /api/follows/trainer/followers` - Get trainer's followers (trainer only)

### Feed
- `GET /api/feed` - Get personalized feed (user only)

### Users
- `GET /api/users/trainer/:trainerId` - Get trainer profile

## 🎨 Frontend Routes

- `/` - Landing page (public)
- `/login` - Login page
- `/signup` - Signup page
- `/trainer/dashboard` - Trainer dashboard (trainer only)
- `/plans/:id` - Plan details page
- `/feed` - User personalized feed (authenticated users)
- `/trainer/:trainerId` - Trainer profile page

## 🔐 Authentication Flow

1. User signs up/logs in
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage
4. Token is included in Authorization header for protected routes
5. Backend middleware validates token on each request

## 🧪 Testing the Application

### Creating Test Data

1. **Create a Trainer Account**
   - Sign up with role "Trainer"
   - Login to access trainer dashboard
   - Create some fitness plans

2. **Create a User Account**
   - Sign up with role "User"
   - Browse plans on landing page
   - Subscribe to plans
   - Follow trainers
   - View personalized feed

### Sample Workflow

1. Trainer creates account and logs in
2. Trainer creates fitness plans via dashboard
3. User creates account and logs in
4. User browses plans on landing page
5. User views plan details (sees preview)
6. User subscribes to plan (simulated payment)
7. User can now see full plan details
8. User follows trainer
9. User views personalized feed with followed trainer's plans

## 📝 Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `VITE_API_URL` - Backend API base URL

## 🛠️ Development

### Backend Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend Scripts
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📦 Dependencies

### Backend
- express - Web framework
- prisma & @prisma/client - Database ORM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- dotenv - Environment variables
- cors - CORS middleware
- express-validator - Input validation
- nodemon - Development tool

### Frontend
- react & react-dom - UI library
- react-router-dom - Routing
- axios - HTTP client
- vite - Build tool

## 🚨 Important Notes

1. **Database Setup**: Make sure PostgreSQL is running and the database exists before running migrations
2. **JWT Secret**: Use a strong, random secret key in production
3. **CORS**: Backend is configured to accept requests from frontend. Adjust CORS settings for production
4. **Password Requirements**: Minimum 6 characters (can be adjusted in validation)
5. **Subscription Expiry**: Subscriptions automatically expire based on plan duration

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists: `CREATE DATABASE FitSync;`

### Authentication Issues
- Clear localStorage if tokens are corrupted
- Check JWT_SECRET is set correctly
- Verify token expiration (default: 7 days)

### CORS Errors
- Ensure backend CORS is configured correctly
- Check frontend API URL matches backend URL

## 📄 License

This project is created for educational purposes.

## 👤 Author

FitSync Development Team

---

**Note**: This is a demonstration project. For production use, consider:
- Adding input sanitization
- Implementing rate limiting
- Adding comprehensive error handling
- Setting up proper logging
- Adding unit and integration tests
- Implementing real payment gateway integration
- Adding email verification
- Setting up CI/CD pipeline
