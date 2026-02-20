import { useMemo } from 'react';
import type { ProcessedPost } from '@/lib/db';

export interface HashtagData {
  hashtag: string;
  count: number;
  avgEngagement: number;
  totalEngagement: number;
}

export function useHashtagAnalytics(posts: ProcessedPost[]) {
  return useMemo(() => {
    const hashtagMap: Record<string, { count: number; totalEngagement: number; posts: ProcessedPost[] }> = {};

    posts.forEach(post => {
      const caption = post.caption || '';
      const hashtagRegex = /#[\w]+/g;
      const hashtags = caption.match(hashtagRegex) || [];
      
      const uniqueHashtags = [...new Set(hashtags.map(h => h.toLowerCase()))];
      
      uniqueHashtags.forEach(hashtag => {
        if (!hashtagMap[hashtag]) {
          hashtagMap[hashtag] = { count: 0, totalEngagement: 0, posts: [] };
        }
        hashtagMap[hashtag].count++;
        hashtagMap[hashtag].totalEngagement += post.engagementScore;
        hashtagMap[hashtag].posts.push(post);
      });
    });

    const hashtagData: HashtagData[] = Object.entries(hashtagMap).map(([hashtag, data]) => ({
      hashtag,
      count: data.count,
      avgEngagement: Math.round(data.totalEngagement / data.count),
      totalEngagement: data.totalEngagement,
    }));

    hashtagData.sort((a, b) => b.count - a.count);
    const topHashtags = hashtagData.slice(0, 5);

    hashtagData.sort((a, b) => b.avgEngagement - a.avgEngagement);
    const topByEngagement = hashtagData.slice(0, 5);

    return {
      allHashtags: hashtagData,
      topHashtags,
      topByEngagement,
      totalUniqueHashtags: hashtagData.length,
    };
  }, [posts]);
}

