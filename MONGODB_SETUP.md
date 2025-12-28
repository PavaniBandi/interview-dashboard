# MongoDB Setup Guide

This guide will help you set up MongoDB for the Interview Dashboard application.

## Option 1: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Create a new cluster (choose the FREE tier - M0)
4. Choose a cloud provider and region closest to you

### Step 2: Configure Database Access
1. Go to **Database Access** → **Add New Database User**
2. Create a username and password (save these!)
3. Set user privileges to "Atlas admin" or "Read and write to any database"

### Step 3: Configure Network Access
1. Go to **Network Access** → **Add IP Address**
2. For development: Click "Add Current IP Address"
3. For production: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ Only do this if you have proper authentication in place

### Step 4: Get Connection String
1. Go to **Clusters** → Click **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `interview-dashboard` (or your preferred database name)

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/interview-dashboard?retryWrites=true&w=majority
```

### Step 5: Set Environment Variable
Create a `.env` file in the `server` directory:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/interview-dashboard?retryWrites=true&w=majority
PORT=5000
```

## Option 2: Local MongoDB (For Development)

### Step 1: Install MongoDB
- **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- **Mac**: `brew install mongodb-community`
- **Linux**: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

### Step 2: Start MongoDB
```bash
# Windows
net start MongoDB

# Mac/Linux
brew services start mongodb-community
# or
mongod --config /usr/local/etc/mongod.conf
```

### Step 3: Set Environment Variable
Create a `.env` file in the `server` directory:
```
MONGODB_URI=mongodb://localhost:27017/interview-dashboard
PORT=5000
```

## Next Steps

After setting up MongoDB, follow the backend setup instructions in the main README.

