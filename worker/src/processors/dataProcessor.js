// worker/src/processors/dataProcessor.js
// Data processing and normalization module

const validator = require('validator');
const { parsePhoneNumber } = require('libphonenumber-js');
const Record = require('../models/Record');
const winston = require('winston');

// Set up Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'data-processor' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/processor-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/processor-combined.log' })
  ]
});

class DataProcessor {
  // Process extracted data
  async processData(extractedData) {
    try {
      const processedRecords = [];
      
      // Process each record from the AI extractor
      const records = await this.aiExtractor.processEntities(extractedData);
      
      for (const record of records) {
        // Normalize and validate the record
        const normalizedRecord = await this.normalizeRecord(record);
        
        // Validate the record
        const isValid = this.validateRecord(normalizedRecord);
        
        if (isValid) {
          processedRecords.push(normalizedRecord);
        } else {
          logger.warn('Invalid record skipped:', normalizedRecord);
        }
      }
      
      return processedRecords;
    } catch (error) {
      logger.error('Error processing data:', error);
      throw error;
    }
  }

  // Normalize a record
  async normalizeRecord(record) {
    const normalized = { ...record };
    
    // Normalize business name
    if (normalized.businessName) {
      normalized.businessName = this.normalizeBusinessName(normalized.businessName);
    }
    
    // Normalize email
    if (normalized.email) {
      normalized.email = this.normalizeEmail(normalized.email);
    }
    
    // Normalize phone number
    if (normalized.phone) {
      normalized.phone = this.normalizePhoneNumber(normalized.phone);
    }
    
    // Normalize website
    if (normalized.website) {
      normalized.website = this.normalizeWebsite(normalized.website);
    }
    
    // Normalize address
    if (normalized.address) {
      normalized.address = this.normalizeAddress(normalized.address);
    }
    
    return normalized;
  }

  // Normalize business name
  normalizeBusinessName(businessName) {
    if (!businessName) return null;
    
    // Remove extra whitespace
    let normalized = businessName.trim();
    
    // Remove common suffixes that might be artifacts
    const suffixesToRemove = [
      ' - Home',
      ' | Home',
      ' - Official Site',
      ' | Official Site',
      ' - Business',
      ' | Business'
    ];
    
    suffixesToRemove.forEach(suffix => {
      if (normalized.endsWith(suffix)) {
        normalized = normalized.slice(0, -suffix.length);
      }
    });
    
    // Remove extra spaces
    normalized = normalized.replace(/\s+/g, ' ');
    
    return normalized || null;
  }

  // Normalize email
  normalizeEmail(email) {
    if (!email) return null;
    
    // Convert to lowercase
    const normalized = email.toLowerCase().trim();
    
    // Validate email
    if (validator.isEmail(normalized)) {
      return normalized;
    }
    
    return null;
  }

  // Normalize phone number
  normalizePhoneNumber(phone) {
    if (!phone) return null;
    
    try {
      // Parse and format phone number
      const phoneNumber = parsePhoneNumber(phone, 'US'); // Default to US
      
      if (phoneNumber.isValid()) {
        return phoneNumber.format('E.164');
      }
      
      // If parsing fails, return original but log warning
      logger.warn(`Invalid phone number: ${phone}`);
      return phone.trim();
    } catch (error) {
      logger.warn(`Error parsing phone number ${phone}:`, error.message);
      return phone.trim();
    }
  }

  // Normalize website
  normalizeWebsite(website) {
    if (!website) return null;
    
    // Add protocol if missing
    let normalized = website.trim();
    
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    
    // Validate URL
    if (validator.isURL(normalized)) {
      return normalized;
    }
    
    return null;
  }

  // Normalize address
  normalizeAddress(address) {
    if (!address) return null;
    
    // Remove extra whitespace
    let normalized = address.trim().replace(/\s+/g, ' ');
    
    // Capitalize first letter of each word
    normalized = normalized.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    
    return normalized || null;
  }

  // Validate a record
  validateRecord(record) {
    // A record is valid if it has at least one of the following:
    // - business name
    // - email
    // - phone
    // - website
    // - address
    
    return !!(record.businessName || record.email || record.phone || record.website || record.address);
  }

  // Deduplicate records
  async deduplicateRecords(records, jobId) {
    const deduplicated = [];
    const duplicates = [];
    
    for (const record of records) {
      // Check if a similar record already exists for this job
      const existingRecord = await Record.findOne({
        where: {
          job_id: jobId,
          email: record.email,
          phone: record.phone
        }
      });
      
      if (existingRecord) {
        // Mark as duplicate
        record.is_duplicate = true;
        duplicates.push(record);
      } else {
        // Not a duplicate
        record.is_duplicate = false;
        deduplicated.push(record);
      }
    }
    
    logger.info(`Deduplicated records: ${deduplicated.length} unique, ${duplicates.length} duplicates`);
    
    return {
      unique: deduplicated,
      duplicates: duplicates
    };
  }

  // Validate email addresses
  async validateEmails(records) {
    const validated = [];
    
    for (const record of records) {
      if (record.email) {
        // In a real implementation, you would use an email validation service
        // For now, we'll just mark all emails as valid
        record.email_valid = true;
      }
      validated.push(record);
    }
    
    return validated;
  }

  // Validate phone numbers
  async validatePhoneNumbers(records) {
    const validated = [];
    
    for (const record of records) {
      if (record.phone) {
        try {
          const phoneNumber = parsePhoneNumber(record.phone, 'US');
          record.phone_valid = phoneNumber.isValid();
        } catch (error) {
          record.phone_valid = false;
        }
      }
      validated.push(record);
    }
    
    return validated;
  }

  // Process batch of records
  async processBatch(records, jobId) {
    try {
      // Normalize all records
      let processedRecords = [];
      for (const record of records) {
        const normalized = await this.normalizeRecord(record);
        if (this.validateRecord(normalized)) {
          processedRecords.push(normalized);
        }
      }
      
      // Deduplicate records
      const { unique, duplicates } = await this.deduplicateRecords(processedRecords, jobId);
      
      // Validate emails
      const emailValidated = await this.validateEmails(unique);
      
      // Validate phone numbers
      const phoneValidated = await this.validatePhoneNumbers(emailValidated);
      
      // Add job_id to all records
      const recordsWithJobId = phoneValidated.map(record => ({
        ...record,
        job_id: jobId
      }));
      
      // Add duplicates with job_id
      const duplicatesWithJobId = duplicates.map(record => ({
        ...record,
        job_id: jobId
      }));
      
      return {
        unique: recordsWithJobId,
        duplicates: duplicatesWithJobId
      };
    } catch (error) {
      logger.error('Error processing batch:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new DataProcessor();