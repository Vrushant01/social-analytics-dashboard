import Post from '../models/Post.js';
import Dashboard from '../models/Dashboard.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const { dashboardId } = req.params;
    const { sentiment, dateFrom, dateTo } = req.query;

    // Verify dashboard belongs to user
    const dashboard = await Dashboard.findOne({
      _id: dashboardId,
      userId: req.user.id,
    });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found',
      });
    }

    // Build query
    let query = { dashboardId };

    // Apply filters
    if (sentiment && sentiment !== 'all') {
      query.sentimentLabel = sentiment;
    }

    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) {
        query.timestamp.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.timestamp.$lte = endDate;
      }
    }

    // Get posts
    const posts = await Post.find(query).sort({ timestamp: -1 });

    if (posts.length === 0) {
      return res.json({
        success: true,
        data: {
          totalPosts: 0,
          totalLikes: 0,
          avgEngagement: 0,
          sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
          emotionDistribution: { Happy: 0, Excited: 0, Neutral: 0, Angry: 0 },
          engagementOverTime: [],
          hashtagFrequency: [],
          bestPerformingPost: null,
          engagementTrend: 'neutral',
        },
      });
    }

    // Calculate basic stats
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
    const totalEngagement = posts.reduce((sum, p) => sum + p.engagementScore, 0);
    const avgEngagement = totalEngagement / totalPosts;

    // Sentiment distribution
    const sentimentDistribution = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    posts.forEach(post => {
      sentimentDistribution[post.sentimentLabel]++;
    });

    // Emotion distribution
    const emotionDistribution = {
      Happy: 0,
      Excited: 0,
      Neutral: 0,
      Angry: 0,
    };
    posts.forEach(post => {
      const emotion = post.emotionLabel || 'Neutral';
      emotionDistribution[emotion] = (emotionDistribution[emotion] || 0) + 1;
    });

    // Engagement over time (grouped by date)
    const engagementByDate = {};
    posts.forEach(post => {
      const date = new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!engagementByDate[date]) {
        engagementByDate[date] = { engagement: 0, count: 0 };
      }
      engagementByDate[date].engagement += post.engagementScore;
      engagementByDate[date].count++;
    });

    const engagementOverTime = Object.entries(engagementByDate)
      .map(([date, data]) => ({
        date,
        engagement: Math.round(data.engagement / data.count),
      }))
      .slice(-20);

    // Hashtag frequency
    const hashtagMap = {};
    posts.forEach(post => {
      const caption = post.caption || '';
      const hashtagRegex = /#[\w]+/g;
      const hashtags = caption.match(hashtagRegex) || [];
      const uniqueHashtags = [...new Set(hashtags.map(h => h.toLowerCase()))];
      
      uniqueHashtags.forEach(hashtag => {
        if (!hashtagMap[hashtag]) {
          hashtagMap[hashtag] = { count: 0, totalEngagement: 0 };
        }
        hashtagMap[hashtag].count++;
        hashtagMap[hashtag].totalEngagement += post.engagementScore;
      });
    });

    const hashtagFrequency = Object.entries(hashtagMap)
      .map(([hashtag, data]) => ({
        hashtag,
        count: data.count,
        avgEngagement: Math.round(data.totalEngagement / data.count),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Best performing post
    const bestPerformingPost = posts.reduce((best, post) => 
      post.engagementScore > best.engagementScore ? post : best, posts[0]
    );

    // Engagement trend
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

    const engagementTrend = secondAvg > firstAvg * 1.1 ? 'up' : secondAvg < firstAvg * 0.9 ? 'down' : 'neutral';

    res.json({
      success: true,
      data: {
        totalPosts,
        totalLikes,
        avgEngagement: Math.round(avgEngagement),
        sentimentDistribution,
        emotionDistribution,
        engagementOverTime,
        hashtagFrequency,
        bestPerformingPost: {
          postId: bestPerformingPost.postId,
          caption: bestPerformingPost.caption,
          engagementScore: bestPerformingPost.engagementScore,
        },
        engagementTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};
