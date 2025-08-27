<<<<<<< HEAD
// backend/src/controllers/jobController.js
// Job controller

const { Job, Record } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Create a new job
exports.createJob = async (req, res, next) => {
  try {
    const { keyword, location, source } = req.body;

    // Validate input
    if (!keyword && !location && source !== 'file_upload') {
      return next(new AppError('Please provide keyword and location, or select file upload', 400));
    }

    if (!source || !['web_search', 'file_upload', 'api'].includes(source)) {
      return next(new AppError('Invalid source. Must be web_search, file_upload, or api', 400));
    }

    // Create job
    const job = await Job.create({
      user_id: req.user.id,
      keyword,
      location,
      source,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all jobs for user
exports.getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {
      user_id: req.user.id
    };

    if (status) {
      where.status = status;
    }

    // Get jobs with record counts
    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [{
        model: Record,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('records.id')), 'recordCount'],
          [sequelize.fn('SUM', sequelize.cast(sequelize.col('records.is_duplicate'), 'integer')), 'duplicateCount']
        ],
        required: false
      }]
    });

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific job
exports.getJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      where: {
        user_id: req.user.id
      }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a job
exports.updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { keyword, location } = req.body;

    // Build update object
    const updateData = {};
    if (keyword !== undefined) updateData.keyword = keyword;
    if (location !== undefined) updateData.location = location;

    // Update job
    const [updatedRows] = await Job.update(updateData, {
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (updatedRows === 0) {
      return next(new AppError('Job not found', 404));
    }

    // Get updated job
    const job = await Job.findByPk(id);

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a job
exports.deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete job (this will cascade to records, exports, and raw_data)
    const deletedRows = await Job.destroy({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (deletedRows === 0) {
      return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Start a job
exports.startJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Update job status to processing
    const [updatedRows] = await Job.update({
      status: 'processing',
      started_at: new Date()
    }, {
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (updatedRows === 0) {
      return next(new AppError('Job not found', 404));
    }

    // In a real implementation, you would add the job to a queue here
    // For now, we'll just update the status

    res.status(200).json({
      success: true,
      message: 'Job started successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a job
exports.cancelJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Update job status to failed
    const [updatedRows] = await Job.update({
      status: 'failed',
      completed_at: new Date()
    }, {
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (updatedRows === 0) {
      return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Job cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get job results (records)
exports.getJobResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, includeDuplicates = false } = req.query;
    const offset = (page - 1) * limit;

    // Verify job belongs to user
    const job = await Job.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Build where clause for records
    const where = {
      job_id: id
    };

    if (!includeDuplicates) {
      where.is_duplicate = false;
    }

    // Get records
    const { count, rows: records } = await Record.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['confidence', 'DESC'], ['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get job progress
exports.getJobProgress = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get job
    const job = await Job.findOne({
      where: {
        id,
        user_id: req.user.id
      },
      attributes: ['id', 'status', 'progress', 'total_records', 'processed_records', 'failed_records', 'started_at', 'completed_at']
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
=======
// backend/src/controllers/jobController.js
// Job controller

const { Job, Record } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Create a new job
exports.createJob = async (req, res, next) => {
  try {
    const { keyword, location, source } = req.body;

    // Validate input
    if (!keyword && !location && source !== 'file_upload') {
      return next(new AppError('Please provide keyword and location, or select file upload', 400));
    }

    if (!source || !['web_search', 'file_upload', 'api'].includes(source)) {
      return next(new AppError('Invalid source. Must be web_search, file_upload, or api', 400));
    }

    // Create job
    const job = await Job.create({
      user_id: req.user.id,
      keyword,
      location,
      source,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all jobs for user
exports.getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {
      user_id: req.user.id
    };

    if (status) {
      where.status = status;
    }

    // Get jobs with record counts
    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [{
        model: Record,
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('records.id')), 'recordCount'],
          [sequelize.fn('SUM', sequelize.cast(sequelize.col('records.is_duplicate'), 'integer')), 'duplicateCount']
        ],
        required: false
      }]
    });

    res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific job
exports.getJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      where: {
        user_id: req.user.id
      }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a job
exports.updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { keyword, location } = req.body;

    // Build update object
    const updateData = {};
    if (keyword !== undefined) updateData.keyword = keyword;
    if (location !== undefined) updateData.location = location;

    // Update job
    const [updatedRows] = await Job.update(updateData, {
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (updatedRows === 0) {
      return next(new AppError('Job not found', 404));
    }

    // Get updated job
    const job = await Job.findByPk(id);

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a job
exports.deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete job (this will cascade to records, exports, and raw_data)
    const deletedRows = await Job.destroy({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (deletedRows === 0) {
      return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Start a job
exports.startJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Update job status to processing
    const [updatedRows] = await Job.update({
      status: 'processing',
      started_at: new Date()
    }, {
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (updatedRows === 0) {
      return next(new AppError('Job not found', 404));
    }

    // In a real implementation, you would add the job to a queue here
    // For now, we'll just update the status

    res.status(200).json({
      success: true,
      message: 'Job started successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Cancel a job
exports.cancelJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Update job status to failed
    const [updatedRows] = await Job.update({
      status: 'failed',
      completed_at: new Date()
    }, {
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (updatedRows === 0) {
      return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Job cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get job results (records)
exports.getJobResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, includeDuplicates = false } = req.query;
    const offset = (page - 1) * limit;

    // Verify job belongs to user
    const job = await Job.findOne({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    // Build where clause for records
    const where = {
      job_id: id
    };

    if (!includeDuplicates) {
      where.is_duplicate = false;
    }

    // Get records
    const { count, rows: records } = await Record.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['confidence', 'DESC'], ['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get job progress
exports.getJobProgress = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get job
    const job = await Job.findOne({
      where: {
        id,
        user_id: req.user.id
      },
      attributes: ['id', 'status', 'progress', 'total_records', 'processed_records', 'failed_records', 'started_at', 'completed_at']
    });

    if (!job) {
      return next(new AppError('Job not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        job
      }
    });
  } catch (error) {
    next(error);
  }
>>>>>>> e5d4683 (Initial commit)
};