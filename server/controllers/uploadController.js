import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { Readable } from 'stream';
import Post from '../models/Post.js';
import Dashboard from '../models/Dashboard.js';
import { normalizeRow, calculatePrediction } from '../utils/dataProcessing.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/json', 'text/plain'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and JSON files are allowed.'), false);
    }
  },
});

export const uploadFile = async (req, res, next) => {
  try {
    const { dashboardId } = req.params;
    const { overwrite } = req.query;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

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

    let rawRows = [];

    // Parse file based on extension
    const fileExt = file.originalname.toLowerCase().split('.').pop();

    if (fileExt === 'csv') {
      // Parse CSV
      const results = [];
      const stream = Readable.from(file.buffer.toString());
      
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });

      rawRows = results;
    } else if (fileExt === 'json') {
      // Parse JSON
      try {
        const jsonData = JSON.parse(file.buffer.toString());
        rawRows = Array.isArray(jsonData) ? jsonData : [jsonData];
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON format',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file format',
      });
    }

    // Normalize and process rows
    const normalizedPosts = rawRows.map(row => normalizeRow(row));

    // Calculate average engagement for prediction
    const totalEngagement = normalizedPosts.reduce((sum, p) => sum + p.engagementScore, 0);
    const avgEngagement = normalizedPosts.length > 0 ? totalEngagement / normalizedPosts.length : 0;

    // Add predictions to posts
    const postsWithPredictions = normalizedPosts.map(post => {
      const prediction = calculatePrediction(post.engagementScore, avgEngagement);
      return {
        ...post,
        predictedPerformance: prediction.predictedPerformance,
        confidenceScore: prediction.confidenceScore,
      };
    });

    // Delete old posts if overwrite is true
    if (overwrite === 'true') {
      await Post.deleteMany({ dashboardId });
    }

    // Prepare posts for database
    const postsToInsert = postsWithPredictions.map(post => ({
      dashboardId,
      ...post,
      timestamp: new Date(post.timestamp),
    }));

    // Insert posts
    const insertedPosts = await Post.insertMany(postsToInsert);

    // Update dashboard updatedAt
    dashboard.updatedAt = new Date();
    await dashboard.save();

    res.json({
      success: true,
      message: `Successfully uploaded ${insertedPosts.length} posts`,
      count: insertedPosts.length,
      data: insertedPosts,
    });
  } catch (error) {
    next(error);
  }
};
