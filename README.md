# Social Media Analytics Dashboard - MERN Stack

A full-stack social media analytics dashboard with AI-powered insights, sentiment analysis, and engagement predictions.

## Features

- 🔐 JWT Authentication
- 📊 Real-time Analytics Dashboard
- 🤖 AI-Powered Insights
- 📈 Engagement Predictions
- 💬 Sentiment Analysis
- 😊 Emotion Detection
- #️⃣ Hashtag Intelligence
- 📁 CSV/JSON Data Import
- 🎨 Modern Dark UI

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Framer Motion
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (File Upload)
- CSV Parser
- Sentiment Analysis

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (running on localhost:27017)

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd social-glow-stats-main
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Install Backend Dependencies**
```bash
cd server
npm install
cd ..
```

4. **Configure Environment Variables**

Backend (`server/.env`):
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/socialAnalyticsDB
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

Frontend (`.env`):
```
VITE_API_URL=http://localhost:5000/api
```

**Note**: Copy `.env.example` to `.env` and `server/.env.example` to `server/.env` for a quick start.

5. **Start MongoDB**
Make sure MongoDB is running on `mongodb://127.0.0.1:27017`

6. **Start Backend Server**
```bash
cd server
npm run dev
```

7. **Start Frontend (in a new terminal)**
```bash
npm run dev
```

8. **Open Browser**
Navigate to `http://localhost:3000`

## Production Deployment

This project is configured for deployment on **Render** (backend) and **Vercel** (frontend).

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Checklist

**Backend (Render):**
- Set `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL`
- **DO NOT** set `PORT` (Render auto-assigns)
- Start command: `node server.js`

**Frontend (Vercel):**
- Set `VITE_API_URL` to your Render backend URL (e.g., `https://your-backend.onrender.com/api`)
- Build command: `npm run build`
- Output directory: `dist`

## Usage

1. **Register** a new account
2. **Create** a dashboard
3. **Upload** a CSV or JSON file with social media data
4. **View** analytics, insights, and predictions

## CSV Format

The system accepts various column name formats. Required fields:
- Post ID (id, post_id, postId)
- Caption (caption, text, post_text)
- Likes (likes, likes_count)
- Comments (comments_count, comments)
- Shares (shares, shares_count)
- Timestamp (timestamp, date, created_at)

See `csv/README.md` for sample files and formats.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Dashboards
- `POST /api/dashboard` - Create dashboard
- `GET /api/dashboard` - Get user dashboards
- `GET /api/dashboard/:id` - Get dashboard
- `PUT /api/dashboard/:id` - Update dashboard
- `DELETE /api/dashboard/:id` - Delete dashboard

### Posts
- `GET /api/dashboard/:dashboardId/posts` - Get posts
- `PUT /api/dashboard/posts/:postId` - Update post
- `DELETE /api/dashboard/posts/:postId` - Delete post

### Upload
- `POST /api/upload/:dashboardId?overwrite=true` - Upload CSV/JSON

### Analytics
- `GET /api/analytics/:dashboardId` - Get analytics

## Project Structure

```
├── server/                 # Backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth & error handling
│   ├── utils/             # Utilities
│   └── server.js          # Entry point
├── src/                   # Frontend
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # API & utilities
│   └── contexts/          # React contexts
└── csv/                   # Demo CSV files
```

## License

MIT
