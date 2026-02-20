import Sentiment from 'sentiment';
import crypto from 'crypto';

const sentiment = new Sentiment();

// Emotion detection keywords
const EMOTION_KEYWORDS = {
  happy: ['happy', 'joy', 'excited', 'amazing', 'wonderful', 'great', 'love', 'awesome', 'fantastic', 'brilliant', 'perfect', 'best', 'celebrate', 'smile', 'laugh', '😊', '😄', '😃', '🎉', '❤️'],
  angry: ['angry', 'mad', 'furious', 'hate', 'terrible', 'awful', 'horrible', 'disgusting', 'annoyed', 'frustrated', 'rage', 'outrage', '😠', '😡', '🤬'],
  excited: ['excited', 'thrilled', 'pumped', 'energetic', 'hyped', 'stoked', 'ecstatic', 'elated', 'fire', 'lit', '🔥', '⚡', '💥'],
  neutral: [],
};

function detectEmotion(text) {
  const lowerText = text.toLowerCase();
  const scores = {
    happy: 0,
    angry: 0,
    excited: 0,
    neutral: 0,
  };

  // Count keyword matches
  Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        scores[emotion]++;
      }
    });
  });

  // Check sentiment score for additional context
  const sentimentResult = sentiment.analyze(text);
  if (sentimentResult.comparative > 0.1) {
    scores.happy += 2;
    scores.excited += 1;
  } else if (sentimentResult.comparative < -0.1) {
    scores.angry += 2;
  } else {
    scores.neutral += 1;
  }

  // Find dominant emotion
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'Neutral';

  const dominantEmotion = Object.entries(scores).find(([, score]) => score === maxScore)?.[0];
  
  switch (dominantEmotion) {
    case 'happy':
      return 'Happy';
    case 'angry':
      return 'Angry';
    case 'excited':
      return 'Excited';
    default:
      return 'Neutral';
  }
}

const COLUMN_MAP = {
  id: 'postId', post_id: 'postId', postId: 'postId', post_Id: 'postId',
  caption: 'caption', post_text: 'caption', text: 'caption', description: 'caption', content: 'caption',
  likes: 'likes', likes_count: 'likes', likesCount: 'likes', like_count: 'likes',
  comments_count: 'commentsCount', commentsCount: 'commentsCount', comment_count: 'commentsCount', comments: 'commentsCount',
  shares: 'shares', shares_count: 'shares', sharesCount: 'shares', share_count: 'shares',
  date: 'timestamp', timestamp: 'timestamp', created_at: 'timestamp', createdAt: 'timestamp', posted_at: 'timestamp', time: 'timestamp',
  comments_text: 'commentTexts', comment: 'commentTexts',
};

function normalizeKey(key) {
  const lower = key.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return COLUMN_MAP[lower] || COLUMN_MAP[key.trim()] || lower;
}

export function normalizeRow(row) {
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    const mapped = normalizeKey(key);
    normalized[mapped] = value;
  }

  const caption = String(normalized.caption || normalized.text || '');
  const sentimentResult = sentiment.analyze(caption);
  const score = sentimentResult.comparative;
  const label = score > 0.05 ? 'positive' : score < -0.05 ? 'negative' : 'neutral';
  const emotionLabel = detectEmotion(caption);
  const likes = parseInt(normalized.likes) || 0;
  const commentsCount = parseInt(normalized.commentscount || normalized.commentsCount) || 0;
  const shares = parseInt(normalized.shares) || 0;

  let comments = [];
  if (normalized.commenttexts || normalized.commentTexts) {
    const ct = normalized.commenttexts || normalized.commentTexts;
    comments = Array.isArray(ct) ? ct : typeof ct === 'string' ? ct.split('|').map((s) => s.trim()).filter(Boolean) : [];
  }

  let timestamp = normalized.timestamp || new Date().toISOString();
  if (typeof timestamp === 'string' && !isNaN(Date.parse(timestamp))) {
    timestamp = new Date(timestamp).toISOString();
  } else if (typeof timestamp === 'number') {
    timestamp = new Date(timestamp * (timestamp < 1e12 ? 1000 : 1)).toISOString();
  } else {
    timestamp = new Date().toISOString();
  }

  return {
    postId: String(normalized.postid || normalized.postId || crypto.randomUUID().slice(0, 8)),
    caption,
    likes,
    commentsCount,
    shares,
    timestamp,
    comments,
    sentimentScore: score,
    sentimentLabel: label,
    emotionLabel,
    engagementScore: likes + commentsCount + shares,
  };
}

export function calculatePrediction(engagementScore, avgEngagement) {
  if (!avgEngagement || avgEngagement === 0) {
    return { predictedPerformance: 'Medium ⚡', confidenceScore: 50 };
  }

  const thresholdHigh = avgEngagement * 1.2;
  const thresholdLow = avgEngagement * 0.8;

  let predictedPerformance;
  let confidenceScore;

  if (engagementScore >= thresholdHigh) {
    predictedPerformance = 'High 🚀';
    const deviation = (engagementScore - avgEngagement) / avgEngagement;
    confidenceScore = Math.min(95, Math.max(60, 60 + (deviation * 100)));
  } else if (engagementScore <= thresholdLow) {
    predictedPerformance = 'Low 📉';
    const deviation = (avgEngagement - engagementScore) / avgEngagement;
    confidenceScore = Math.min(95, Math.max(60, 60 + (deviation * 100)));
  } else {
    predictedPerformance = 'Medium ⚡';
    const deviation = Math.abs(engagementScore - avgEngagement) / avgEngagement;
    confidenceScore = Math.max(50, 70 - (deviation * 50));
  }

  return {
    predictedPerformance,
    confidenceScore: Math.round(confidenceScore),
  };
}
