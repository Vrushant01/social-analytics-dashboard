import Post from '../models/Post.js';
import Dashboard from '../models/Dashboard.js';
import { normalizeRow, calculatePrediction } from '../utils/dataProcessing.js';

export const getPosts = async (req, res, next) => {
  try {
    const { dashboardId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sentiment, 
      dateFrom, 
      dateTo,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

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

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get posts
    const posts = await Post.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { likes, commentsCount, shares } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Verify dashboard belongs to user
    const dashboard = await Dashboard.findOne({
      _id: post.dashboardId,
      userId: req.user.id,
    });

    if (!dashboard) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Update post
    if (likes !== undefined) post.likes = parseInt(likes);
    if (commentsCount !== undefined) post.commentsCount = parseInt(commentsCount);
    if (shares !== undefined) post.shares = parseInt(shares);

    // Recalculate engagement
    post.engagementScore = post.likes + post.commentsCount + post.shares;

    // Recalculate sentiment and emotion
    const normalized = normalizeRow({ caption: post.caption });
    post.sentimentScore = normalized.sentimentScore;
    post.sentimentLabel = normalized.sentimentLabel;
    post.emotionLabel = normalized.emotionLabel;

    // Recalculate prediction
    const allPosts = await Post.find({ dashboardId: post.dashboardId });
    const avgEngagement = allPosts.reduce((sum, p) => sum + p.engagementScore, 0) / allPosts.length;
    const prediction = calculatePrediction(post.engagementScore, avgEngagement);
    post.predictedPerformance = prediction.predictedPerformance;
    post.confidenceScore = prediction.confidenceScore;

    await post.save();

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Verify dashboard belongs to user
    const dashboard = await Dashboard.findOne({
      _id: post.dashboardId,
      userId: req.user.id,
    });

    if (!dashboard) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    await Post.deleteOne({ _id: postId });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
