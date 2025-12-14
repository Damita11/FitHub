# MongoDB Atlas Setup Guide

## Step 1: Get Your MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create an account
3. Create a new cluster (or use an existing one)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string (it will look like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

## Step 2: Update Your .env File

1. Open `backend/.env` file
2. Replace the `DATABASE_URL` with your MongoDB Atlas connection string:
   ```env
   DATABASE_URL="mongodb+srv://your-username:your-password@cluster.mongodb.net/fitplanhub?retryWrites=true&w=majority"
   ```
   
   **Important:** 
   - Replace `your-username` with your MongoDB username
   - Replace `your-password` with your MongoDB password
   - Replace `cluster` with your actual cluster name
   - The database name `fitplanhub` will be created automatically

## Step 3: Configure Network Access

1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development) or add your specific IP
4. Click "Confirm"

## Step 4: Create Database User (if not already created)

1. In MongoDB Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password
5. Set privileges to "Read and write to any database" (or specific database)
6. Click "Add User"

## Step 5: Run Prisma Migrations

After setting up your connection string, run:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

Or if you prefer to push the schema without migrations (MongoDB doesn't require migrations):

```bash
cd backend
npx prisma db push
```

## Step 6: Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Troubleshooting

### Connection Issues
- Make sure your IP address is whitelisted in MongoDB Atlas
- Verify your username and password are correct
- Check that your cluster is running (not paused)

### Authentication Errors
- Ensure the database user has proper permissions
- Verify the connection string format is correct

### Prisma Errors
- Make sure you've run `npm run prisma:generate` after updating the schema
- Try `npx prisma db push` instead of migrations for MongoDB
