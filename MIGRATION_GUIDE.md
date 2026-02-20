# MERN Stack Migration Guide

## Overview
The application has been refactored from a client-side IndexedDB app to a full MERN stack application with a Node.js/Express backend and MongoDB database.

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/socialAnalyticsDB
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

### 3. Start MongoDB
Make sure MongoDB is running on `mongodb://127.0.0.1:27017`

### 4. Start Backend Server
```bash
cd server
npm run dev
```

## Frontend Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The `.env` file is already configured with:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Frontend
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Dashboards
- `POST /api/dashboard` - Create dashboard (protected)
- `GET /api/dashboard` - Get user dashboards (protected)
- `GET /api/dashboard/:id` - Get dashboard (protected)
- `PUT /api/dashboard/:id` - Update dashboard (protected)
- `DELETE /api/dashboard/:id` - Delete dashboard (protected)

### Posts
- `GET /api/dashboard/:dashboardId/posts` - Get posts with pagination/filters (protected)
- `PUT /api/dashboard/posts/:postId` - Update post (protected)
- `DELETE /api/dashboard/posts/:postId` - Delete post (protected)

### Upload
- `POST /api/upload/:dashboardId?overwrite=true` - Upload CSV/JSON file (protected)

### Analytics
- `GET /api/analytics/:dashboardId` - Get analytics data (protected)

## Changes Made

### Removed
- IndexedDB (`idb` package usage)
- Client-side data processing (moved to backend)
- Local storage for data (now uses MongoDB)

### Added
- Express.js backend server
- MongoDB with Mongoose
- JWT authentication
- File upload handling (multer)
- CSV/JSON parsing on server
- Server-side sentiment analysis
- Server-side prediction calculations
- API client (axios) in frontend

### Updated
- All data operations now use API calls
- Authentication uses JWT tokens
- File uploads go through API
- Analytics calculated server-side

## Testing

1. Start MongoDB
2. Start backend: `cd server && npm run dev`
3. Start frontend: `npm run dev`
4. Register a new user
5. Create a dashboard and upload a CSV file
6. View analytics

## Production Deployment

1. Set `NODE_ENV=production` in server `.env`
2. Use a secure `JWT_SECRET`
3. Configure MongoDB connection string for production
4. Build frontend: `npm run build`
5. Serve frontend static files through Express or separate server
