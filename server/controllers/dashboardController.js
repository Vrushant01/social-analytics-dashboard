import Dashboard from '../models/Dashboard.js';
import Post from '../models/Post.js';

export const createDashboard = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Dashboard name is required',
      });
    }

    const dashboard = await Dashboard.create({
      userId: req.user.id,
      name,
    });

    res.status(201).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboards = async (req, res, next) => {
  try {
    const dashboards = await Dashboard.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    // Get post counts for each dashboard
    const dashboardsWithCounts = await Promise.all(
      dashboards.map(async (dashboard) => {
        const postCount = await Post.countDocuments({ dashboardId: dashboard._id });
        return {
          ...dashboard.toObject(),
          datasetSize: postCount,
        };
      })
    );

    res.json({
      success: true,
      count: dashboardsWithCounts.length,
      data: dashboardsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found',
      });
    }

    const postCount = await Post.countDocuments({ dashboardId: dashboard._id });

    res.json({
      success: true,
      data: {
        ...dashboard.toObject(),
        datasetSize: postCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDashboard = async (req, res, next) => {
  try {
    const { name } = req.body;

    let dashboard = await Dashboard.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found',
      });
    }

    if (name) {
      dashboard.name = name;
      dashboard.updatedAt = new Date();
      await dashboard.save();
    }

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDashboard = async (req, res, next) => {
  try {
    const dashboard = await Dashboard.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard not found',
      });
    }

    // Delete all associated posts
    await Post.deleteMany({ dashboardId: dashboard._id });

    // Delete dashboard
    await Dashboard.deleteOne({ _id: dashboard._id });

    res.json({
      success: true,
      message: 'Dashboard deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
