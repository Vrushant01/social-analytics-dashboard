# Deployment Guide - Render (Backend) + Vercel (Frontend)

This guide will help you deploy the Social Media Analytics Dashboard to production.

## Prerequisites

- Render account (for backend)
- Vercel account (for frontend)
- MongoDB Atlas account (or MongoDB instance)
- GitHub repository with your code

## Backend Deployment (Render)

### 1. Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository and branch

### 2. Configure Build Settings

- **Name**: `social-analytics-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your production branch)
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### 3. Configure Environment Variables

Add the following environment variables in Render:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/socialAnalyticsDB?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Important Notes:**
- **DO NOT** set `PORT` - Render automatically assigns a port
- Replace `FRONTEND_URL` with your actual Vercel frontend URL
- Use a strong, random `JWT_SECRET` (at least 32 characters)
- Use MongoDB Atlas connection string for `MONGODB_URI`

### 4. Deploy

Click "Create Web Service" and wait for deployment to complete. Note your backend URL (e.g., `https://social-analytics-backend.onrender.com`)

## Frontend Deployment (Vercel)

### 1. Create a New Project on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository

### 2. Configure Project Settings

- **Framework Preset**: Vite
- **Root Directory**: `.` (root)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Configure Environment Variables

Add the following environment variable in Vercel:

```
VITE_API_URL=https://your-render-backend.onrender.com/api
```

**Important:**
- Replace `your-render-backend.onrender.com` with your actual Render backend URL
- Make sure to include `/api` at the end

### 4. Deploy

Click "Deploy" and wait for deployment to complete. Note your frontend URL (e.g., `https://social-analytics-app.vercel.app`)

### 5. Update Backend CORS

After getting your Vercel frontend URL, go back to Render and update the `FRONTEND_URL` environment variable:

```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Redeploy the backend service for the CORS changes to take effect.

## Post-Deployment Checklist

- [ ] Backend is accessible at Render URL
- [ ] Frontend is accessible at Vercel URL
- [ ] Frontend can communicate with backend (check browser console)
- [ ] Authentication works (register/login)
- [ ] File upload works
- [ ] Analytics display correctly
- [ ] No CORS errors in browser console
- [ ] Environment variables are set correctly

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Verify `FRONTEND_URL` in Render matches your Vercel URL exactly (including `https://`)
2. Ensure no trailing slashes
3. Redeploy backend after changing `FRONTEND_URL`

### API Connection Issues

1. Verify `VITE_API_URL` in Vercel matches your Render backend URL
2. Ensure `/api` is included at the end
3. Check Render logs for backend errors
4. Verify MongoDB connection string is correct

### Build Failures

1. Check that all dependencies are in `package.json`
2. Verify Node.js version compatibility
3. Check build logs for specific errors

## Environment Variables Reference

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | Random 32+ character string |
| `NODE_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Vercel frontend URL | `https://app.vercel.app` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend.onrender.com/api` |

## Development vs Production

### Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
- Uses `.env` file for frontend
- Uses `server/.env` file for backend

### Production

- Backend runs on Render (auto-assigned port)
- Frontend runs on Vercel
- Uses Vercel environment variables for frontend
- Uses Render environment variables for backend
- No localhost references in code

## Security Notes

- Never commit `.env` files to Git
- Use strong, unique `JWT_SECRET` in production
- Use MongoDB Atlas with proper authentication
- Enable MongoDB IP whitelist for production
- Regularly rotate secrets and credentials
