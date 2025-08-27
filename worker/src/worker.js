// worker/src/worker.js
// Main worker entry point

// Load environment variables
require('dotenv').config();

// Import required modules
const Bull = require('bull');
const { sequelize } = require('./config/database');
const winston = require('winston');
const scraperService = require('./scrapers/scraperService');
const aiExtractor = require('./ai/aiExtractor');
const dataProcessor = require('./processors/dataProcessor');
const { Job, Record, RawData } = require('./models');

// Set up Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'data-extractor-worker' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Create job queue
const jobQueue = new Bull('scraping jobs', process.env.REDIS_URL || 'redis://localhost:6379');

// Process jobs
jobQueue.process('scrape-job', async (job, done) => {
  const { jobId } = job.data;
  logger.info(`Processing job ${jobId}`);

  try {
    // Get job from database
    const jobRecord = await Job.findByPk(jobId);
    if (!jobRecord) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Update job status to processing
    await jobRecord.update({
      status: 'processing',
      started_at: new Date()
    });

    // Process based on job source
    let results;
    if (jobRecord.source === 'web_search') {
      results = await processWebSearchJob(jobRecord);
    } else if (jobRecord.source === 'file_upload') {
      results = await processFileUploadJob(jobRecord);
    } else if (jobRecord.source === 'api') {
      results = await processApiJob(jobRecord);
    } else {
      throw new Error(`Unknown job source: ${jobRecord.source}`);
    }

    // Update job status to completed
    await jobRecord.update({
      status: 'completed',
      completed_at: new Date(),
      total_records: results.totalRecords,
      processed_records: results.processedRecords,
      failed_records: results.failedRecords,
      progress: 100
    });

    logger.info(`Job ${jobId} completed successfully`);
    done(null, results);
  } catch (error) {
    logger.error(`Error processing job ${jobId}:`, error);

    // Update job status to failed
    await Job.update({
      status: 'failed',
      completed_at: new Date()
    }, {
      where: {
        id: jobId
      }
    });

    done(error);
  }
});

// Process web search job
async function processWebSearchJob(job) {
  logger.info(`Processing web search job ${job.id}`);
  
  // In a real implementation, you would:
  // 1. Use the keyword and location to search web directories
  // 2. Scrape results using Playwright/Cheerio
  // 3. Extract data with AI extractor
  // 4. Process and normalize data
  // 5. Save results to database
  
  // For now, we'll simulate the process
  const results = {
    totalRecords: 0,
    processedRecords: 0,
    failedRecords: 0
  };
  
  // Simulate scraping and processing
  for (let i = 0; i < 10; i++) {
    // Simulate scraping a page
    const rawData = await scraperService.scrapePage(`https://example.com/page${i}`);
    
    // Save raw data
    await RawData.create({
      job_id: job.id,
      source_url: `https://example.com/page${i}`,
      content: rawData.content,
      content_type: 'html',
      http_status: rawData.status,
      scrape_duration: rawData.duration
    });
    
    // Extract data with AI
    const extractedData = await aiExtractor.extractData(rawData.content);
    
    // Process and normalize data
    const processedData = await dataProcessor.processData(extractedData);
    
    // Save processed records
    for (const record of processedData) {
      await Record.create({
        job_id: job.id,
        business_name: record.businessName,
        email: record.email,
        phone: record.phone,
        address: record.address,
        website: record.website,
        source_url: `https://example.com/page${i}`,
        confidence: record.confidence
      });
    }
    
    results.totalRecords += processedData.length;
    results.processedRecords += processedData.length;
    
    // Update job progress
    await job.update({
      progress: Math.round((i + 1) / 10 * 100)
    });
  }
  
  return results;
}

// Process file upload job
async function processFileUploadJob(job) {
  logger.info(`Processing file upload job ${job.id}`);
  
  // In a real implementation, you would:
  // 1. Get uploaded file URLs from the job or database
  // 2. Download and parse CSV/Excel files
  // 3. Extract data with AI extractor
  // 4. Process and normalize data
  // 5. Save results to database
  
  // For now, we'll return empty results
  return {
    totalRecords: 0,
    processedRecords: 0,
    failedRecords: 0
  };
}

// Process API job
async function processApiJob(job) {
  logger.info(`Processing API job ${job.id}`);
  
  // In a real implementation, you would:
  // 1. Call external APIs (Google Places, Yelp, etc.)
  // 2. Parse JSON responses
  // 3. Extract data with AI extractor
  // 4. Process and normalize data
  // 5. Save results to database
  
  // For now, we'll return empty results
  return {
    totalRecords: 0,
    processedRecords: 0,
    failedRecords: 0
  };
}

// Event listeners
jobQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.data.jobId} completed successfully`);
});

jobQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.data.jobId} failed:`, err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down worker...');
  await jobQueue.close();
  await sequelize.close();
  process.exit(0);
});

logger.info('Worker started and waiting for jobs...');