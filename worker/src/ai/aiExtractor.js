<<<<<<< HEAD
// worker/src/ai/aiExtractor.js
// AI-powered entity extraction using regex and NLP techniques

const cheerio = require('cheerio');
const { parsePhoneNumber } = require('libphonenumber-js');
const validator = require('validator');

class AIExtractor {
  constructor() {
    // Confidence thresholds for different entity types
    this.confidenceThresholds = {
      businessName: 0.8,
      email: 0.9,
      phone: 0.85,
      address: 0.7,
      website: 0.8
    };
  }

  // Extract data from HTML content
  async extractData(content) {
    try {
      // Load HTML content with Cheerio
      const $ = cheerio.load(content);
      
      // Remove script and style elements
      $('script, style').remove();
      
      // Get text content
      const textContent = $('body').text();
      
      // Extract entities
      const entities = {
        businessNames: this.extractBusinessNames($, textContent),
        emails: this.extractEmails(textContent),
        phones: this.extractPhoneNumbers(textContent),
        addresses: this.extractAddresses(textContent),
        websites: this.extractWebsites(textContent),
        confidence: 0
      };
      
      // Calculate overall confidence
      entities.confidence = this.calculateOverallConfidence(entities);
      
      return entities;
    } catch (error) {
      throw new Error(`AI extraction failed: ${error.message}`);
    }
  }

  // Extract business names
  extractBusinessNames($, textContent) {
    const businessNames = [];
    
    // Look for common business name patterns in HTML
    const title = $('title').text().trim();
    if (title) {
      businessNames.push({
        value: title,
        confidence: 0.9,
        source: 'title'
      });
    }
    
    // Look for H1 tags
    $('h1').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length > 2 && text.length < 100) {
        businessNames.push({
          value: text,
          confidence: 0.8,
          source: 'h1'
        });
      }
    });
    
    // Look for company name in common selectors
    const commonSelectors = [
      '.company-name',
      '.business-name',
      '.org-name',
      '.company',
      '.organization',
      '[class*="company"]',
      '[class*="business"]',
      '[class*="org"]'
    ];
    
    commonSelectors.forEach(selector => {
      $(selector).each((i, elem) => {
        const text = $(elem).text().trim();
        if (text && text.length > 2 && text.length < 100) {
          businessNames.push({
            value: text,
            confidence: 0.7,
            source: selector
          });
        }
      });
    });
    
    // Remove duplicates
    const uniqueNames = [];
    const seen = new Set();
    
    businessNames.forEach(name => {
      if (!seen.has(name.value.toLowerCase())) {
        seen.add(name.value.toLowerCase());
        uniqueNames.push(name);
      }
    });
    
    return uniqueNames;
  }

  // Extract emails
  extractEmails(textContent) {
    const emails = [];
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = textContent.match(emailRegex) || [];
    
    matches.forEach(email => {
      if (validator.isEmail(email)) {
        emails.push({
          value: email.toLowerCase(),
          confidence: 0.95,
          source: 'regex'
        });
      }
    });
    
    // Remove duplicates
    const uniqueEmails = [];
    const seen = new Set();
    
    emails.forEach(email => {
      if (!seen.has(email.value)) {
        seen.add(email.value);
        uniqueEmails.push(email);
      }
    });
    
    return uniqueEmails;
  }

  // Extract phone numbers
  extractPhoneNumbers(textContent) {
    const phones = [];
    
    // Multiple regex patterns for different phone number formats
    const phonePatterns = [
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, // US format
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // 10-digit format
      /\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g, // Parentheses format
      /\b\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g // International format
    ];
    
    phonePatterns.forEach(pattern => {
      const matches = textContent.match(pattern) || [];
      matches.forEach(phone => {
        try {
          // Try to parse and format the phone number
          const phoneNumber = parsePhoneNumber(phone, 'US'); // Default to US
          if (phoneNumber.isValid()) {
            phones.push({
              value: phoneNumber.format('E.164'),
              confidence: 0.9,
              source: 'libphonenumber',
              original: phone
            });
          } else {
            // If parsing fails, still include it with lower confidence
            phones.push({
              value: phone,
              confidence: 0.7,
              source: 'regex',
              original: phone
            });
          }
        } catch (error) {
          // If parsing fails, still include it with lower confidence
          phones.push({
            value: phone,
            confidence: 0.7,
            source: 'regex',
            original: phone
          });
        }
      });
    });
    
    // Remove duplicates
    const uniquePhones = [];
    const seen = new Set();
    
    phones.forEach(phone => {
      if (!seen.has(phone.value)) {
        seen.add(phone.value);
        uniquePhones.push(phone);
      }
    });
    
    return uniquePhones;
  }

  // Extract addresses
  extractAddresses(textContent) {
    const addresses = [];
    
    // Simple regex for address patterns (this is a simplified version)
    // In a real implementation, you'd use a more sophisticated approach
    const addressRegex = /\d+\s+[A-Za-z0-9\s]+,\s+[A-Za-z\s]+,\s+[A-Z]{2}\s+\d{5}/g;
    const matches = textContent.match(addressRegex) || [];
    
    matches.forEach(address => {
      addresses.push({
        value: address,
        confidence: 0.8,
        source: 'regex'
      });
    });
    
    // Also look for common address patterns
    const addressPatterns = [
      /\d+\s+[A-Za-z0-9\s]+,\s+[A-Za-z\s]+,\s+[A-Z]{2}\s+\d{5}/gi,
      /\d+\s+[A-Za-z0-9\s]+,\s+[A-Za-z\s]+,\s+\d{5}/gi,
      /\d+\s+[A-Za-z0-9\s]+,\s+[A-Za-z\s]+/gi
    ];
    
    addressPatterns.forEach(pattern => {
      const matches = textContent.match(pattern) || [];
      matches.forEach(address => {
        // Check if we already have this address
        if (!addresses.some(a => a.value === address)) {
          addresses.push({
            value: address,
            confidence: 0.6,
            source: 'pattern'
          });
        }
      });
    });
    
    // Remove duplicates
    const uniqueAddresses = [];
    const seen = new Set();
    
    addresses.forEach(address => {
      if (!seen.has(address.value.toLowerCase())) {
        seen.add(address.value.toLowerCase());
        uniqueAddresses.push(address);
      }
    });
    
    return uniqueAddresses;
  }

  // Extract websites
  extractWebsites(textContent) {
    const websites = [];
    const websiteRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const matches = textContent.match(websiteRegex) || [];
    
    matches.forEach(website => {
      if (validator.isURL(website)) {
        websites.push({
          value: website,
          confidence: 0.9,
          source: 'regex'
        });
      }
    });
    
    // Remove duplicates
    const uniqueWebsites = [];
    const seen = new Set();
    
    websites.forEach(website => {
      if (!seen.has(website.value)) {
        seen.add(website.value);
        uniqueWebsites.push(website);
      }
    });
    
    return uniqueWebsites;
  }

  // Calculate overall confidence score
  calculateOverallConfidence(entities) {
    let totalConfidence = 0;
    let count = 0;
    
    // Add confidence from each entity type
    ['businessNames', 'emails', 'phones', 'addresses', 'websites'].forEach(type => {
      if (entities[type] && entities[type].length > 0) {
        // Average confidence for this entity type
        const avgConfidence = entities[type].reduce((sum, item) => sum + item.confidence, 0) / entities[type].length;
        totalConfidence += avgConfidence;
        count++;
      }
    });
    
    return count > 0 ? totalConfidence / count : 0;
  }

  // Process extracted entities into structured records
  async processEntities(entities) {
    const records = [];
    
    // Get the best business name
    const bestBusinessName = this.getBestEntity(entities.businessNames);
    
    // Get the best email
    const bestEmail = this.getBestEntity(entities.emails);
    
    // Get the best phone
    const bestPhone = this.getBestEntity(entities.phones);
    
    // Get the best address
    const bestAddress = this.getBestEntity(entities.addresses);
    
    // Get the best website
    const bestWebsite = this.getBestEntity(entities.websites);
    
    // Create a record for each email (as emails are usually unique identifiers)
    if (entities.emails.length > 0) {
      entities.emails.forEach(email => {
        records.push({
          businessName: bestBusinessName ? bestBusinessName.value : null,
          email: email.value,
          phone: bestPhone ? bestPhone.value : null,
          address: bestAddress ? bestAddress.value : null,
          website: bestWebsite ? bestWebsite.value : null,
          confidence: this.calculateRecordConfidence({
            businessName: bestBusinessName,
            email,
            phone: bestPhone,
            address: bestAddress,
            website: bestWebsite
          })
        });
      });
    } else {
      // If no emails, create a single record with available data
      records.push({
        businessName: bestBusinessName ? bestBusinessName.value : null,
        email: null,
        phone: bestPhone ? bestPhone.value : null,
        address: bestAddress ? bestAddress.value : null,
        website: bestWebsite ? bestWebsite.value : null,
        confidence: entities.confidence
      });
    }
    
    return records;
  }

  // Get the best entity based on confidence
  getBestEntity(entities) {
    if (!entities || entities.length === 0) return null;
    
    // Sort by confidence (highest first)
    entities.sort((a, b) => b.confidence - a.confidence);
    
    return entities[0];
  }

  // Calculate confidence for a record
  calculateRecordConfidence(recordEntities) {
    let totalConfidence = 0;
    let count = 0;
    
    Object.values(recordEntities).forEach(entity => {
      if (entity) {
        totalConfidence += entity.confidence;
        count++;
      }
    });
    
    return count > 0 ? totalConfidence / count : 0;
  }
}

=======
// worker/src/ai/aiExtractor.js
// AI-powered entity extraction using regex and NLP techniques

const cheerio = require('cheerio');
const { parsePhoneNumber } = require('libphonenumber-js');
const validator = require('validator');

class AIExtractor {
  constructor() {
    // Confidence thresholds for different entity types
    this.confidenceThresholds = {
      businessName: 0.8,
      email: 0.9,
      phone: 0.85,
      address: 0.7,
      website: 0.8
    };
  }

  // Extract data from HTML content
  async extractData(content) {
    try {
      // Load HTML content with Cheerio
      const $ = cheerio.load(content);
      
      // Remove script and style elements
      $('script, style').remove();
      
      // Get text content
      const textContent = $('body').text();
      
      // Extract entities
      const entities = {
        businessNames: this.extractBusinessNames($, textContent),
        emails: this.extractEmails(textContent),
        phones: this.extractPhoneNumbers(textContent),
        addresses: this.extractAddresses(textContent),
        websites: this.extractWebsites(textContent),
        confidence: 0
      };
      
      // Calculate overall confidence
      entities.confidence = this.calculateOverallConfidence(entities);
      
      return entities;
    } catch (error) {
      throw new Error(`AI extraction failed: ${error.message}`);
    }
  }

  // Extract business names
  extractBusinessNames($, textContent) {
    const businessNames = [];
    
    // Look for common business name patterns in HTML
    const title = $('title').text().trim();
    if (title) {
      businessNames.push({
        value: title,
        confidence: 0.9,
        source: 'title'
      });
    }
    
    // Look for H1 tags
    $('h1').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length > 2 && text.length < 100) {
        businessNames.push({
          value: text,
          confidence: 0.8,
          source: 'h1'
        });
      }
    });
    
    // Look for company name in common selectors
    const commonSelectors = [
      '.company-name',
      '.business-name',
      '.org-name',
      '.company',
      '.organization',
      '[class*="company"]',
      '[class*="business"]',
      '[class*="org"]'
    ];
    
    commonSelectors.forEach(selector => {
      $(selector).each((i, elem) => {
        const text = $(elem).text().trim();
        if (text && text.length > 2 && text.length < 100) {
          businessNames.push({
            value: text,
            confidence: 0.7,
            source: selector
          });
        }
      });
    });
    
    // Remove duplicates
    const uniqueNames = [];
    const seen = new Set();
    
    businessNames.forEach(name => {
      if (!seen.has(name.value.toLowerCase())) {
        seen.add(name.value.toLowerCase());
        uniqueNames.push(name);
      }
    });
    
    return uniqueNames;
  }

  // Extract emails
  extractEmails(textContent) {
    const emails = [];
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = textContent.match(emailRegex) || [];
    
    matches.forEach(email => {
      if (validator.isEmail(email)) {
        emails.push({
          value: email.toLowerCase(),
          confidence: 0.95,
          source: 'regex'
        });
      }
    });
    
    // Remove duplicates
    const uniqueEmails = [];
    const seen = new Set();
    
    emails.forEach(email => {
      if (!seen.has(email.value)) {
        seen.add(email.value);
        uniqueEmails.push(email);
      }
    });
    
    return uniqueEmails;
  }

  // Extract phone numbers
  extractPhoneNumbers(textContent) {
    const phones = [];
    
    // Multiple regex patterns for different phone number formats
    const phonePatterns = [
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, // US format
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // 10-digit format
      /\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g, // Parentheses format
      /\b\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g // International format
    ];
    
    phonePatterns.forEach(pattern => {
      const matches = textContent.match(pattern) || [];
      matches.forEach(phone => {
        try {
          // Try to parse and format the phone number
          const phoneNumber = parsePhoneNumber(phone, 'US'); // Default to US
          if (phoneNumber.isValid()) {
            phones.push({
              value: phoneNumber.format('E.164'),
              confidence: 0.9,
              source: 'libphonenumber',
              original: phone
            });
          } else {
            // If parsing fails, still include it with lower confidence
            phones.push({
              value: phone,
              confidence: 0.7,
              source: 'regex',
              original: phone
            });
          }
        } catch (error) {
          // If parsing fails, still include it with lower confidence
          phones.push({
            value: phone,
            confidence: 0.7,
            source: 'regex',
            original: phone
          });
        }
      });
    });
    
    // Remove duplicates
    const uniquePhones = [];
    const seen = new Set();
    
    phones.forEach(phone => {
      if (!seen.has(phone.value)) {
        seen.add(phone.value);
        uniquePhones.push(phone);
      }
    });
    
    return uniquePhones;
  }

  // Extract addresses
  extractAddresses(textContent) {
    const addresses = [];
    
    // Simple regex for address patterns (this is a simplified version)
    // In a real implementation, you'd use a more sophisticated approach
    const addressRegex = /\d+\s+[A-Za-z0-9\s]+,\s+[A-Za-z\s]+,\s+[A-Z]{2}\s+\d{5}/g;
    const matches = textContent.match(addressRegex) || [];
    
    matches.forEach(address => {
      addresses.push({
        value: address,
        confidence: 0.8,
        source: 'regex'
      });
    });
    
    // Also look for common address patterns
    const addressPatterns = [
      /\d+\s+[A-Za-z0-9\s]+,\s+[A-Za-z\s]+,\s+[A-Z]{2}\s+\d{5}/gi,
      /\d+\s+[A-Za-z0-9\s]+,\s+[A-Za-z\s]+,\s+\d{5}/gi,
      /\d+\s+[A-Za-z0-9\s]+,\s+[A-Za-z\s]+/gi
    ];
    
    addressPatterns.forEach(pattern => {
      const matches = textContent.match(pattern) || [];
      matches.forEach(address => {
        // Check if we already have this address
        if (!addresses.some(a => a.value === address)) {
          addresses.push({
            value: address,
            confidence: 0.6,
            source: 'pattern'
          });
        }
      });
    });
    
    // Remove duplicates
    const uniqueAddresses = [];
    const seen = new Set();
    
    addresses.forEach(address => {
      if (!seen.has(address.value.toLowerCase())) {
        seen.add(address.value.toLowerCase());
        uniqueAddresses.push(address);
      }
    });
    
    return uniqueAddresses;
  }

  // Extract websites
  extractWebsites(textContent) {
    const websites = [];
    const websiteRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const matches = textContent.match(websiteRegex) || [];
    
    matches.forEach(website => {
      if (validator.isURL(website)) {
        websites.push({
          value: website,
          confidence: 0.9,
          source: 'regex'
        });
      }
    });
    
    // Remove duplicates
    const uniqueWebsites = [];
    const seen = new Set();
    
    websites.forEach(website => {
      if (!seen.has(website.value)) {
        seen.add(website.value);
        uniqueWebsites.push(website);
      }
    });
    
    return uniqueWebsites;
  }

  // Calculate overall confidence score
  calculateOverallConfidence(entities) {
    let totalConfidence = 0;
    let count = 0;
    
    // Add confidence from each entity type
    ['businessNames', 'emails', 'phones', 'addresses', 'websites'].forEach(type => {
      if (entities[type] && entities[type].length > 0) {
        // Average confidence for this entity type
        const avgConfidence = entities[type].reduce((sum, item) => sum + item.confidence, 0) / entities[type].length;
        totalConfidence += avgConfidence;
        count++;
      }
    });
    
    return count > 0 ? totalConfidence / count : 0;
  }

  // Process extracted entities into structured records
  async processEntities(entities) {
    const records = [];
    
    // Get the best business name
    const bestBusinessName = this.getBestEntity(entities.businessNames);
    
    // Get the best email
    const bestEmail = this.getBestEntity(entities.emails);
    
    // Get the best phone
    const bestPhone = this.getBestEntity(entities.phones);
    
    // Get the best address
    const bestAddress = this.getBestEntity(entities.addresses);
    
    // Get the best website
    const bestWebsite = this.getBestEntity(entities.websites);
    
    // Create a record for each email (as emails are usually unique identifiers)
    if (entities.emails.length > 0) {
      entities.emails.forEach(email => {
        records.push({
          businessName: bestBusinessName ? bestBusinessName.value : null,
          email: email.value,
          phone: bestPhone ? bestPhone.value : null,
          address: bestAddress ? bestAddress.value : null,
          website: bestWebsite ? bestWebsite.value : null,
          confidence: this.calculateRecordConfidence({
            businessName: bestBusinessName,
            email,
            phone: bestPhone,
            address: bestAddress,
            website: bestWebsite
          })
        });
      });
    } else {
      // If no emails, create a single record with available data
      records.push({
        businessName: bestBusinessName ? bestBusinessName.value : null,
        email: null,
        phone: bestPhone ? bestPhone.value : null,
        address: bestAddress ? bestAddress.value : null,
        website: bestWebsite ? bestWebsite.value : null,
        confidence: entities.confidence
      });
    }
    
    return records;
  }

  // Get the best entity based on confidence
  getBestEntity(entities) {
    if (!entities || entities.length === 0) return null;
    
    // Sort by confidence (highest first)
    entities.sort((a, b) => b.confidence - a.confidence);
    
    return entities[0];
  }

  // Calculate confidence for a record
  calculateRecordConfidence(recordEntities) {
    let totalConfidence = 0;
    let count = 0;
    
    Object.values(recordEntities).forEach(entity => {
      if (entity) {
        totalConfidence += entity.confidence;
        count++;
      }
    });
    
    return count > 0 ? totalConfidence / count : 0;
  }
}

>>>>>>> e5d4683 (Initial commit)
module.exports = new AIExtractor();