<<<<<<< HEAD
// backend/src/controllers/exportController.js
// Export controller for handling export requests

const ExportService = require('../services/exportService');
const Job = require('../models/Job');
const Record = require('../models/Record');
const fs = require('fs').promises;
const path = require('path');

class ExportController {
  constructor() {
    this.exportService = new ExportService({
      exportDir: path.join(__dirname, '../../exports'),
      maxRecordsPerBatch: 1000
    });
  }
  
  /**
   * Create a new export job
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createExport(req, res) {
    try {
      const { jobId, format, columns, filters } = req.body;
      const userId = req.user.id;
      
      // Validate input
      if (!jobId || !format) {
        return res.status(400).json({
          success: false,
          message: 'Job ID and format are required'
        });
      }
      
      if (!['csv', 'xlsx'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Format must be either csv or xlsx'
        });
      }
      
      // Get job
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Check job status
      if (job.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Job must be completed before exporting'
        });
      }
      
      // Get records for job
      const records = await Record.findByJobId(jobId, filters);
      
      // Check if there are records to export
      if (!records || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No records found for this job'
        });
      }
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `export-${jobId}-${timestamp}.${format}`;
      
      // Export records
      let exportResult;
      if (format === 'csv') {
        exportResult = await this.exportService.exportToCsv(records, {
          filename,
          headers: columns ? columns.map(col => ({ id: col, title: col })) : undefined
        });
      } else {
        exportResult = await this.exportService.exportToExcel(records, {
          filename,
          columns: columns ? columns.map(col => ({ header: col, key: col, width: 20 })) : undefined
        });
      }
      
      // Generate metadata
      const metadata = this.exportService.generateExportMetadata(exportResult, {
        userId,
        jobId,
        filters,
        columns
      });
      
      // Save export metadata to database (in a real implementation)
      // await Export.create(metadata);
      
      // Return success response
      res.status(201).json({
        success: true,
        message: 'Export created successfully',
        data: {
          ...exportResult,
          downloadUrl: `/api/exports/${exportResult.filename}/download`
        }
      });
    } catch (error) {
      console.error('Export creation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Export creation failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Download an export file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async downloadExport(req, res) {
    try {
      const { filename } = req.params;
      const filepath = path.join(this.exportService.config.exportDir, filename);
      
      // Check if file exists
      try {
        await fs.access(filepath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Export file not found'
        });
      }
      
      // Set headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (filename.endsWith('.csv')) {
        res.setHeader('Content-Type', 'text/csv');
      } else if (filename.endsWith('.xlsx')) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      }
      
      // Stream file to response
      const fileStream = require('fs').createReadStream(filepath);
      fileStream.pipe(res);
      
      // Handle stream errors
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Failed to stream export file'
          });
        }
      });
    } catch (error) {
      console.error('Export download failed:', error);
      res.status(500).json({
        success: false,
        message: 'Export download failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get export history for user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getExportHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      // In a real implementation, you would query the database for export history
      // For now, we'll return an empty array
      const exports = [];
      const total = 0;
      
      res.json({
        success: true,
        data: {
          exports,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Failed to fetch export history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch export history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Delete an export file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteExport(req, res) {
    try {
      const { filename } = req.params;
      const filepath = path.join(this.exportService.config.exportDir, filename);
      
      // Check if file exists
      try {
        await fs.access(filepath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Export file not found'
        });
      }
      
      // Delete file
      await fs.unlink(filepath);
      
      res.json({
        success: true,
        message: 'Export file deleted successfully'
      });
    } catch (error) {
      console.error('Export deletion failed:', error);
      res.status(500).json({
        success: false,
        message: 'Export deletion failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Test export performance with large dataset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testExportPerformance(req, res) {
    try {
      const { recordCount = 5000, format = 'csv' } = req.query;
      
      // Generate test data
      const testData = this.generateTestData(parseInt(recordCount));
      
      // Test export performance
      const startTime = Date.now();
      let exportResult;
      
      if (format === 'csv') {
        exportResult = await this.exportService.exportToCsv(testData, {
          filename: `performance-test-${Date.now()}.csv`
        });
      } else {
        exportResult = await this.exportService.exportToExcel(testData, {
          filename: `performance-test-${Date.now()}.xlsx`
        });
      }
      
      const endTime = Date.now();
      
      // Clean up test file
      try {
        await fs.unlink(exportResult.filepath);
      } catch (error) {
        console.warn('Failed to clean up test file:', error);
      }
      
      res.json({
        success: true,
        data: {
          ...exportResult,
          testDuration: endTime - startTime,
          recordCount: testData.length,
          recordsPerSecond: Math.round(testData.length / ((endTime - startTime) / 1000))
        }
      });
    } catch (error) {
      console.error('Export performance test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Export performance test failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Generate test data for performance testing
   * @param {number} count - Number of records to generate
   * @returns {Array} Array of test records
   */
  generateTestData(count) {
    const records = [];
    
    for (let i = 0; i < count; i++) {
      records.push({
        id: i + 1,
        businessName: `Business ${i + 1}`,
        contactPerson: `Contact Person ${i + 1}`,
        email: `contact${i + 1}@business${i + 1}.com`,
        phone: `+1-555-${String(i + 1000).padStart(4, '0')}`,
        address: `${i + 1} Main Street, City ${i % 100}, State ${String.fromCharCode(65 + (i % 26))} ${10000 + (i % 1000)}`,
        website: `https://www.business${i + 1}.com`,
        confidence: Math.random(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return records;
  }
}

=======
// backend/src/controllers/exportController.js
// Export controller for handling export requests

const ExportService = require('../services/exportService');
const Job = require('../models/Job');
const Record = require('../models/Record');
const fs = require('fs').promises;
const path = require('path');

class ExportController {
  constructor() {
    this.exportService = new ExportService({
      exportDir: path.join(__dirname, '../../exports'),
      maxRecordsPerBatch: 1000
    });
  }
  
  /**
   * Create a new export job
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createExport(req, res) {
    try {
      const { jobId, format, columns, filters } = req.body;
      const userId = req.user.id;
      
      // Validate input
      if (!jobId || !format) {
        return res.status(400).json({
          success: false,
          message: 'Job ID and format are required'
        });
      }
      
      if (!['csv', 'xlsx'].includes(format)) {
        return res.status(400).json({
          success: false,
          message: 'Format must be either csv or xlsx'
        });
      }
      
      // Get job
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Check job status
      if (job.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Job must be completed before exporting'
        });
      }
      
      // Get records for job
      const records = await Record.findByJobId(jobId, filters);
      
      // Check if there are records to export
      if (!records || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No records found for this job'
        });
      }
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `export-${jobId}-${timestamp}.${format}`;
      
      // Export records
      let exportResult;
      if (format === 'csv') {
        exportResult = await this.exportService.exportToCsv(records, {
          filename,
          headers: columns ? columns.map(col => ({ id: col, title: col })) : undefined
        });
      } else {
        exportResult = await this.exportService.exportToExcel(records, {
          filename,
          columns: columns ? columns.map(col => ({ header: col, key: col, width: 20 })) : undefined
        });
      }
      
      // Generate metadata
      const metadata = this.exportService.generateExportMetadata(exportResult, {
        userId,
        jobId,
        filters,
        columns
      });
      
      // Save export metadata to database (in a real implementation)
      // await Export.create(metadata);
      
      // Return success response
      res.status(201).json({
        success: true,
        message: 'Export created successfully',
        data: {
          ...exportResult,
          downloadUrl: `/api/exports/${exportResult.filename}/download`
        }
      });
    } catch (error) {
      console.error('Export creation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Export creation failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Download an export file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async downloadExport(req, res) {
    try {
      const { filename } = req.params;
      const filepath = path.join(this.exportService.config.exportDir, filename);
      
      // Check if file exists
      try {
        await fs.access(filepath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Export file not found'
        });
      }
      
      // Set headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (filename.endsWith('.csv')) {
        res.setHeader('Content-Type', 'text/csv');
      } else if (filename.endsWith('.xlsx')) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      }
      
      // Stream file to response
      const fileStream = require('fs').createReadStream(filepath);
      fileStream.pipe(res);
      
      // Handle stream errors
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Failed to stream export file'
          });
        }
      });
    } catch (error) {
      console.error('Export download failed:', error);
      res.status(500).json({
        success: false,
        message: 'Export download failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Get export history for user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getExportHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      // In a real implementation, you would query the database for export history
      // For now, we'll return an empty array
      const exports = [];
      const total = 0;
      
      res.json({
        success: true,
        data: {
          exports,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Failed to fetch export history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch export history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Delete an export file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteExport(req, res) {
    try {
      const { filename } = req.params;
      const filepath = path.join(this.exportService.config.exportDir, filename);
      
      // Check if file exists
      try {
        await fs.access(filepath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Export file not found'
        });
      }
      
      // Delete file
      await fs.unlink(filepath);
      
      res.json({
        success: true,
        message: 'Export file deleted successfully'
      });
    } catch (error) {
      console.error('Export deletion failed:', error);
      res.status(500).json({
        success: false,
        message: 'Export deletion failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Test export performance with large dataset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async testExportPerformance(req, res) {
    try {
      const { recordCount = 5000, format = 'csv' } = req.query;
      
      // Generate test data
      const testData = this.generateTestData(parseInt(recordCount));
      
      // Test export performance
      const startTime = Date.now();
      let exportResult;
      
      if (format === 'csv') {
        exportResult = await this.exportService.exportToCsv(testData, {
          filename: `performance-test-${Date.now()}.csv`
        });
      } else {
        exportResult = await this.exportService.exportToExcel(testData, {
          filename: `performance-test-${Date.now()}.xlsx`
        });
      }
      
      const endTime = Date.now();
      
      // Clean up test file
      try {
        await fs.unlink(exportResult.filepath);
      } catch (error) {
        console.warn('Failed to clean up test file:', error);
      }
      
      res.json({
        success: true,
        data: {
          ...exportResult,
          testDuration: endTime - startTime,
          recordCount: testData.length,
          recordsPerSecond: Math.round(testData.length / ((endTime - startTime) / 1000))
        }
      });
    } catch (error) {
      console.error('Export performance test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Export performance test failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Generate test data for performance testing
   * @param {number} count - Number of records to generate
   * @returns {Array} Array of test records
   */
  generateTestData(count) {
    const records = [];
    
    for (let i = 0; i < count; i++) {
      records.push({
        id: i + 1,
        businessName: `Business ${i + 1}`,
        contactPerson: `Contact Person ${i + 1}`,
        email: `contact${i + 1}@business${i + 1}.com`,
        phone: `+1-555-${String(i + 1000).padStart(4, '0')}`,
        address: `${i + 1} Main Street, City ${i % 100}, State ${String.fromCharCode(65 + (i % 26))} ${10000 + (i % 1000)}`,
        website: `https://www.business${i + 1}.com`,
        confidence: Math.random(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    
    return records;
  }
}

>>>>>>> e5d4683 (Initial commit)
module.exports = ExportController;