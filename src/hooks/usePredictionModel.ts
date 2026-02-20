import { useMemo } from 'react';
import type { ProcessedPost } from '@/lib/db';

export interface PredictionResult {
  predictedPerformance: 'High 🚀' | 'Medium ⚡' | 'Low 📉';
  confidenceScore: number;
}

export function usePredictionModel(posts: ProcessedPost[]) {
  const avgEngagement = useMemo(() => {
    if (posts.length === 0) return 0;
    return posts.reduce((sum, p) => sum + p.engagementScore, 0) / posts.length;
  }, [posts]);

  const predictPost = (post: ProcessedPost): PredictionResult => {
    if (posts.length === 0) {
      return { predictedPerformance: 'Medium ⚡', confidenceScore: 0 };
    }

    const thresholdHigh = avgEngagement * 1.2;
    const thresholdLow = avgEngagement * 0.8;

    let predictedPerformance: 'High 🚀' | 'Medium ⚡' | 'Low 📉';
    let confidenceScore: number;

    if (post.engagementScore >= thresholdHigh) {
      predictedPerformance = 'High 🚀';
      const deviation = (post.engagementScore - avgEngagement) / avgEngagement;
      confidenceScore = Math.min(95, Math.max(60, 60 + (deviation * 100)));
    } else if (post.engagementScore <= thresholdLow) {
      predictedPerformance = 'Low 📉';
      const deviation = (avgEngagement - post.engagementScore) / avgEngagement;
      confidenceScore = Math.min(95, Math.max(60, 60 + (deviation * 100)));
    } else {
      predictedPerformance = 'Medium ⚡';
      const deviation = Math.abs(post.engagementScore - avgEngagement) / avgEngagement;
      confidenceScore = Math.max(50, 70 - (deviation * 50));
    }

    return { predictedPerformance, confidenceScore: Math.round(confidenceScore) };
  };

  return { avgEngagement, predictPost };
}

