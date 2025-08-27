// backend/src/services/exportService.js
// Optimized export service for handling large datasets

const { createObjectCsvWriter } = require('csv-writer');
const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');

class ExportService {
  constructor(config = {}) {
    this.config = {
      exportDir: config.exportDir || path.join(__dirname, '../../exports'),
      maxRecordsPerBatch: config.maxRecordsPerBatch || 1000,
      ...config
    };
    
    // Ensure export directory exists
    this.ensureExportDir();
  }
  
  async ensureExportDir() {
    try {
      await fs.mkdir(this.config.exportDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create export directory:', error);
    }
  }
  
  /**
   * Export records to CSV format
   * @param {Array} records - Records to export
   * @param {Object} options - Export options
   * @returns {Object} Export result with file path and metadata
   */
  async exportToCsv(records, options = {}) {
    const startTime = Date.now();
    const filename = options.filename || `export-${Date.now()}.csv`;
    const filepath = path.join(this.config.exportDir, filename);
    
    try {
      // For large datasets, use streaming
      if (records.length > this.config.maxRecordsPerBatch) {
        return await this.streamCsvExport(records, filepath, options);
      }
      
      // For smaller datasets, use direct export
      const csvWriter = createObjectCsvWriter({
        path: filepath,
        header: options.headers || this.getDefaultHeaders()
      });
      
      await csvWriter.writeRecords(records);
      
      const stats = await fs.stat(filepath);
      
      return {
        success: true,
        filepath,
        filename,
        fileSize: stats.size,
        recordCount: records.length,
        duration: Date.now() - startTime,
        format: 'CSV'
      };
    } catch (error) {
      console.error('CSV export failed:', error);
      throw new Error(`CSV export failed: ${error.message}`);
    }
  }
  
  /**
   * Stream CSV export for large datasets
   * @param {Array} records - Records to export
   * @param {string} filepath - Output file path
   * @param {Object} options - Export options
   * @returns {Object} Export result
   */
  async streamCsvExport(records, filepath, options) {
    const startTime = Date.now();
    
    // Create a readable stream from records
    const recordStream = new Readable({
      objectMode: true,
      read() {
        // We'll push records in batches
        this.push(null); // End the stream
      }
    });
    
    // Create CSV writer with stream
    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: options.headers || this.getDefaultHeaders()
    });
    
    // Process records in batches
    const batchSize = this.config.maxRecordsPerBatch;
    let totalProcessed = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await csvWriter.writeRecords(batch);
      totalProcessed += batch.length;
      
      // Allow event loop to process other tasks
      if (i % (batchSize * 10) === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
    
    const stats = await fs.stat(filepath);
    
    return {
      success: true,
      filepath,
      filename: path.basename(filepath),
      fileSize: stats.size,
      recordCount: totalProcessed,
      duration: Date.now() - startTime,
      format: 'CSV'
    };
  }
  
  /**
   * Export records to Excel format
   * @param {Array} records - Records to export
   * @param {Object} options - Export options
   * @returns {Object} Export result with file path and metadata
   */
  async exportToExcel(records, options = {}) {
    const startTime = Date.now();
    const filename = options.filename || `export-${Date.now()}.xlsx`;
    const filepath = path.join(this.config.exportDir, filename);
    
    try {
      // For large datasets, use streaming
      if (records.length > this.config.maxRecordsPerBatch) {
        return await this.streamExcelExport(records, filepath, options);
      }
      
      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(options.sheetName || 'Business Records');
      
      // Define columns
      worksheet.columns = options.columns || this.getDefaultExcelColumns();
      
      // Add rows
      worksheet.addRows(records);
      
      // Apply styling for header row
      worksheet.getRow(1).font = { bold: true };
      
      // Save workbook
      await workbook.xlsx.writeFile(filepath);
      
      const stats = await fs.stat(filepath);
      
      return {
        success: true,
        filepath,
        filename,
        fileSize: stats.size,
        recordCount: records.length,
        duration: Date.now() - startTime,
        format: 'Excel'
      };
    } catch (error) {
      console.error('Excel export failed:', error);
      throw new Error(`Excel export failed: ${error.message}`);
    }
  }
  
  /**
   * Stream Excel export for large datasets
   * @param {Array} records - Records to export
   * @param {string} filepath - Output file path
   * @param {Object} options - Export options
   * @returns {Object} Export result
   */
  async streamExcelExport(records, filepath, options) {
    const startTime = Date.now();
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(options.sheetName || 'Business Records');
    
    // Define columns
    worksheet.columns = options.columns || this.getDefaultExcelColumns();
    
    // Apply styling for header row
    worksheet.getRow(1).font = { bold: true };
    
    // Process records in batches
    const batchSize = this.config.maxRecordsPerBatch;
    let totalProcessed = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      worksheet.addRows(batch);
      totalProcessed += batch.length;
      
      // Allow event loop to process other tasks
      if (i % (batchSize * 10) === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
    
    // Save workbook
    await workbook.xlsx.writeFile(filepath);
    
    const stats = await fs.stat(filepath);
    
    return {
      success: true,
      filepath,
      filename: path.basename(filepath),
      fileSize: stats.size,
      recordCount: totalProcessed,
      duration: Date.now() - startTime,
      format: 'Excel'
    };
  }
  
  /**
   * Get default CSV headers
   * @returns {Array} Default headers
   */
  getDefaultHeaders() {
    return [
      { id: 'id', title: 'ID' },
      { id: 'businessName', title: 'Business Name' },
      { id: 'contactPerson', title: 'Contact Person' },
      { id: 'email', title: 'Email' },
      { id: 'phone', title: 'Phone' },
      { id: 'address', title: 'Address' },
      { id: 'website', title: 'Website' },
      { id: 'confidence', title: 'Confidence' },
      { id: 'createdAt', title: 'Created At' }
    ];
  }
  
  /**
   * Get default Excel columns
   * @returns {Array} Default columns
   */
  getDefaultExcelColumns() {
    return [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Business Name', key: 'businessName', width: 30 },
      { header: 'Contact Person', key: 'contactPerson', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Address', key: 'address', width: 50 },
      { header: 'Website', key: 'website', width: 35 },
      { header: 'Confidence', key: 'confidence', width: 15 },
      { header: 'Created At', key: 'createdAt', width: 25 }
    ];
  }
  
  /**
   * Compress export file
   * @param {string} filepath - Path to file to compress
   * @returns {Object} Compression result
   */
  async compressFile(filepath) {
    try {
      const zlib = require('zlib');
      const compressedPath = `${filepath}.gz`;
      
      const gzip = zlib.createGzip();
      const source = fs.createReadStream(filepath);
      const destination = fs.createWriteStream(compressedPath);
      
      await pipeline(source, gzip, destination);
      
      const originalStats = await fs.stat(filepath);
      const compressedStats = await fs.stat(compressedPath);
      
      return {
        success: true,
        originalSize: originalStats.size,
        compressedSize: compressedStats.size,
        compressionRatio: (1 - compressedStats.size / originalStats.size).toFixed(2),
        compressedPath
      };
    } catch (error) {
      console.error('File compression failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Generate export metadata
   * @param {Object} exportResult - Export result from export functions
   * @param {Object} options - Additional metadata options
   * @returns {Object} Export metadata
   */
  generateExportMetadata(exportResult, options = {}) {
    return {
      id: `export-${Date.now()}`,
      ...exportResult,
      exportedAt: new Date().toISOString(),
      userId: options.userId || null,
      jobId: options.jobId || null,
      filters: options.filters || {},
      columns: options.columns || [],
      compression: options.compression || false
    };
  }
  
  /**
   * Clean up old export files
   * @param {number} maxAgeHours - Maximum age of files in hours
   * @returns {Object} Cleanup result
   */
  async cleanupOldExports(maxAgeHours = 24) {
    try {
      const files = await fs.readdir(this.config.exportDir);
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
      let deletedCount = 0;
      
      for (const file of files) {
        const filepath = path.join(this.config.exportDir, file);
        const stats = await fs.stat(filepath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.unlink(filepath);
          deletedCount++;
        }
      }
      
      return {
        success: true,
        deletedCount,
        message: `Deleted ${deletedCount} old export files`
      };
    } catch (error) {
      console.error('Export cleanup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ExportService;