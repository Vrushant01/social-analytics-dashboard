import { useMemo } from 'react';
import type { ProcessedPost } from '@/lib/db';

export interface AIInsight {
  id: string;
  title: string;
  value: string | number;
  description: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function useAIInsights(posts: ProcessedPost[]): AIInsight[] {
  return useMemo(() => {
    if (posts.length === 0) return [];

    const insights: AIInsight[] = [];

    // 1. Best performing post
    const bestPost = posts.reduce((best, post) => 
      post.engagementScore > best.engagementScore ? post : best, posts[0]
    );
    insights.push({
      id: 'best-post',
      title: 'Best Performing Post',
      value: bestPost.engagementScore,
      description: `Post ID: ${bestPost.postId.slice(0, 8)}`,
      icon: '🚀',
    });

    // 2. Best posting day/time
    const dayHourMap: Record<string, { count: number; totalEngagement: number }> = {};
    posts.forEach(post => {
      const date = new Date(post.timestamp);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      const hour = date.getHours();
      const key = `${day}-${hour}`;
      if (!dayHourMap[key]) {
        dayHourMap[key] = { count: 0, totalEngagement: 0 };
      }
      dayHourMap[key].count++;
      dayHourMap[key].totalEngagement += post.engagementScore;
    });

    const bestTimeSlot = Object.entries(dayHourMap).reduce((best, [key, data]) => {
      if (best.data.count === 0) return { key, data };
      const avgEngagement = data.totalEngagement / data.count;
      const bestAvg = best.data.totalEngagement / best.data.count;
      return avgEngagement > bestAvg ? { key, data } : best;
    }, { key: '', data: { count: 0, totalEngagement: 0 } });

    if (bestTimeSlot.key) {
      const [day, hour] = bestTimeSlot.key.split('-');
      insights.push({
        id: 'best-time',
        title: 'Best Posting Time',
        value: `${day} ${hour}:00`,
        description: `Average engagement: ${Math.round(bestTimeSlot.data.totalEngagement / bestTimeSlot.data.count)}`,
        icon: '⏰',
      });
    }

    // 3. Engagement trend
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const firstHalf = sortedPosts.slice(0, Math.floor(sortedPosts.length / 2));
    const secondHalf = sortedPosts.slice(Math.floor(sortedPosts.length / 2));
    
    const firstAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, p) => sum + p.engagementScore, 0) / firstHalf.length 
      : 0;
    const secondAvg = secondHalf.length > 0 
      ? secondHalf.reduce((sum, p) => sum + p.engagementScore, 0) / secondHalf.length 
      : 0;

    const trend = secondAvg > firstAvg * 1.1 ? 'up' : secondAvg < firstAvg * 0.9 ? 'down' : 'neutral';
    const trendPercent = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0;
    
    insights.push({
      id: 'engagement-trend',
      title: 'Engagement Trend',
      value: trend === 'up' ? `↑ ${Math.abs(trendPercent)}%` : trend === 'down' ? `↓ ${Math.abs(trendPercent)}%` : '→ Stable',
      description: trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable',
      icon: trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️',
      trend,
    });

    // 4. Sentiment dominance
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    posts.forEach(post => sentimentCounts[post.sentimentLabel]++);
    const total = posts.length;
    const dominantSentiment = Object.entries(sentimentCounts).reduce((a, b) => 
      sentimentCounts[a[0] as keyof typeof sentimentCounts] > sentimentCounts[b[0] as keyof typeof sentimentCounts] ? a : b
    );
    const percent = Math.round((sentimentCounts[dominantSentiment[0] as keyof typeof sentimentCounts] / total) * 100);
    
    insights.push({
      id: 'sentiment-dominance',
      title: 'Sentiment Dominance',
      value: `${percent}% ${dominantSentiment[0]}`,
      description: `Positive: ${Math.round((sentimentCounts.positive / total) * 100)}%, Neutral: ${Math.round((sentimentCounts.neutral / total) * 100)}%, Negative: ${Math.round((sentimentCounts.negative / total) * 100)}%`,
      icon: dominantSentiment[0] === 'positive' ? '😊' : dominantSentiment[0] === 'negative' ? '😔' : '😐',
    });

    // 5. Correlation between comments and shares
    const commentsShares = posts.map(p => ({ comments: p.commentsCount, shares: p.shares }));
    const avgComments = commentsShares.reduce((sum, p) => sum + p.comments, 0) / commentsShares.length;
    const avgShares = commentsShares.reduce((sum, p) => sum + p.shares, 0) / commentsShares.length;
    
    let covariance = 0;
    let varianceComments = 0;
    commentsShares.forEach(p => {
      const diffComments = p.comments - avgComments;
      const diffShares = p.shares - avgShares;
      covariance += diffComments * diffShares;
      varianceComments += diffComments * diffComments;
    });
    
    const varianceShares = commentsShares.reduce((sum, p) => {
      const diff = p.shares - avgShares;
      return sum + diff * diff;
    }, 0);
    
    const correlation = varianceComments > 0 && varianceShares > 0 
      ? covariance / Math.sqrt(varianceComments * varianceShares)
      : 0;
    
    const correlationStrength = Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.4 ? 'Moderate' : 'Weak';
    const correlationDirection = correlation > 0 ? 'Positive' : 'Negative';
    
    insights.push({
      id: 'correlation',
      title: 'Comments ↔ Shares',
      value: `${correlationStrength} ${correlationDirection}`,
      description: `Correlation: ${correlation.toFixed(2)}`,
      icon: correlation > 0 ? '🔗' : '🔀',
    });

    return insights;
  }, [posts]);
}

