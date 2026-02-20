# Backend Server

Express.js backend for Social Media Analytics Dashboard.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/socialAnalyticsDB
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

3. Start MongoDB (make sure it's running on localhost:27017)

4. Start the server:
```bash
npm run dev
```

## API Documentation

See main README.md for API endpoint documentation.

## Features

- JWT Authentication
- MongoDB with Mongoose
- File Upload (CSV/JSON)
- Sentiment Analysis
- Emotion Detection
- Engagement Prediction
- Analytics Calculation
