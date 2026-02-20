import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  dashboardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dashboard',
    required: true,
    index: true,
  },
  postId: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  likes: {
    type: Number,
    default: 0,
    min: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  shares: {
    type: Number,
    default: 0,
    min: 0,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  comments: {
    type: [String],
    default: [],
  },
  sentimentScore: {
    type: Number,
    default: 0,
  },
  sentimentLabel: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral',
  },
  emotionLabel: {
    type: String,
    enum: ['Happy', 'Angry', 'Excited', 'Neutral'],
    default: 'Neutral',
  },
  engagementScore: {
    type: Number,
    default: 0,
    index: true,
  },
  predictedPerformance: {
    type: String,
    enum: ['High 🚀', 'Medium ⚡', 'Low 📉'],
    default: 'Medium ⚡',
  },
  confidenceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
});

// Indexes for better query performance
postSchema.index({ dashboardId: 1, timestamp: -1 });
postSchema.index({ dashboardId: 1, engagementScore: -1 });

export default mongoose.model('Post', postSchema);
