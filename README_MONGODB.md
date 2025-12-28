# MongoDB Integration Guide

This guide explains how to switch from localStorage to MongoDB for data storage.

## Quick Start

### 1. Set Up MongoDB

Follow the instructions in [MONGODB_SETUP.md](./MONGODB_SETUP.md) to:
- Create a MongoDB Atlas account (free tier available)
- Or install MongoDB locally
- Get your connection string

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/interview-dashboard?retryWrites=true&w=majority
PORT=5000
```

### 4. Start the Backend Server

```bash
cd server
npm run dev
```

The server will run on `http://localhost:5000`

### 5. Update Frontend to Use MongoDB

Edit `src/App.jsx` and change:

```jsx
// FROM:
import { AppProvider } from './context/AppContext';

// TO:
import { AppProvider } from './context/AppContext.mongodb';
```

### 6. Start the Frontend

```bash
npm run dev
```

The frontend will proxy API requests to the backend server.

## Project Structure

```
interview-dashboard/
├── server/              # Backend API
│   ├── models/         # MongoDB models
│   ├── server.js       # Express server
│   └── package.json
├── src/
│   ├── context/
│   │   ├── AppContext.jsx          # localStorage version
│   │   └── AppContext.mongodb.jsx  # MongoDB version
│   └── services/
│       └── api.js                   # API client
└── ...
```

## API Endpoints

- `GET /api/panelists` - Get all panelists
- `POST /api/panelists` - Create panelist
- `PUT /api/panelists/:id` - Update panelist
- `DELETE /api/panelists/:id` - Delete panelist
- `GET /api/interviews` - Get all interviews
- `POST /api/interviews` - Create interview
- `DELETE /api/interviews/:id` - Delete interview

## Switching Back to LocalStorage

If you want to switch back to localStorage:

1. In `src/App.jsx`, change back to:
   ```jsx
   import { AppProvider } from './context/AppContext';
   ```

2. Stop the backend server

## Deployment

### Backend Deployment

Deploy the `server/` directory to:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS/GCP/Azure

Make sure to set the `MONGODB_URI` environment variable in your hosting platform.

### Frontend Deployment

Deploy the frontend as usual (Vercel, Netlify, etc.) and set:
- `VITE_API_URL` environment variable to your backend URL
- Or keep the default `/api` proxy (only works if frontend and backend are on same domain)

## Troubleshooting

### Connection Issues
- Check your MongoDB connection string
- Verify network access in MongoDB Atlas
- Ensure the server is running

### CORS Errors
- The server includes CORS middleware
- If issues persist, check your frontend URL is allowed

### Data Not Loading
- Check browser console for errors
- Verify API endpoints are accessible
- Check server logs for errors

