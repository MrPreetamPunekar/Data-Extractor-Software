// backend/src/workers/scraper.js
// Web scraper worker using Playwright

const { chromium } = require('playwright');
const cheerio = require('cheerio');
const axios = require('axios');
const { parsePhoneNumber } = require('libphonenumber-js');
const validator = require('validator');
const fs = require('fs').promises;
const path = require('path');

// Import compliance utilities
const { 
  checkRobotsTxtCompliance, 
  checkSourceReviewRequired, 
  checkCaptchaLikely 
} = require('../utils/compliance');

class WebScraperWorker {
  constructor(config = {}) {
    this.config = {
      timeout: config.timeout || 30000,
      headless: config.headless !== false,
      userAgent: config.userAgent || 'DataExtractorBot/1.0',
      respectRobotsTxt: config.respectRobotsTxt !== false,
      delayBetweenRequests: config.delayBetweenRequests || 1000,
      maxRetries: config.maxRetries || 3,
      ...config
    };
    this.browser = null;
    this.userAgent = this.config.userAgent;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security', // Only for development
          '--disable-features=IsolateOrigins,site-per-process' // Only for development
        ]
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeUrl(url, selectors = {}, jobId = null) {
    // Initialize browser if not already done
    if (!this.browser) {
      await this.initialize();
    }

    // Create a new context for this scrape
    const context = await this.browser.newContext({
      userAgent: this.userAgent,
      viewport: { width: 1920, height: 1080 }
    });

    try {
      // Compliance checks
      const complianceChecks = await this.performComplianceChecks(url);
      
      // Log compliance results
      console.log(`Compliance checks for ${url}:`, complianceChecks);
      
      // If robots.txt explicitly disallows, return early
      if (complianceChecks.robots && !complianceChecks.robots.compliant) {
        return {
          success: false,
          error: 'Blocked by robots.txt',
          requiresReview: true,
          compliance: complianceChecks
        };
      }

      // Set up request interception for tracking and blocking
      await context.route('**/*', route => {
        const type = route.request().resourceType();
        // Block unnecessary resources to speed up scraping
        if (type === 'image' || type === 'font' || type === 'media' || type === 'stylesheet') {
          route.abort();
        } else {
          route.continue();
        }
      });

      // Add delay between requests to be respectful
      if (this.config.delayBetweenRequests > 0) {
        await this.delay(this.config.delayBetweenRequests);
      }

      // Navigate to the page with retries
      const page = await context.newPage();
      let response;
      let attempts = 0;
      
      while (attempts < this.config.maxRetries) {
        try {
          response = await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: this.config.timeout
          });
          break;
        } catch (error) {
          attempts++;
          if (attempts >= this.config.maxRetries) {
            throw error;
          }
          console.warn(`Attempt ${attempts} failed for ${url}. Retrying...`);
          await this.delay(2000 * attempts); // Exponential backoff
        }
      }

      // Check if we encountered a captcha
      const captchaDetected = await this.detectCaptcha(page);
      if (captchaDetected) {
        return {
          success: false,
          error: 'Captcha detected',
          captchaRequired: true,
          requiresReview: true,
          compliance: complianceChecks
        };
      }

      // Extract page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract business information using provided selectors
      const businessData = this.extractBusinessInfo($, selectors);

      // Extract website metadata
      const metadata = await this.extractMetadata(page);

      // Extract additional information
      const additionalInfo = await this.extractAdditionalInfo(page, $);

      return {
        success: true,
        data: {
          ...businessData,
          ...metadata,
          ...additionalInfo,
          sourceUrl: url,
          scrapedAt: new Date().toISOString(),
          compliance: complianceChecks
        }
      };
    } catch (error) {
      console.error(`Scraping failed for ${url}:`, error);
      
      return {
        success: false,
        error: error.message,
        requiresReview: true
      };
    } finally {
      await context.close();
    }
  }

  async performComplianceChecks(url) {
    const checks = {};
    
    try {
      // Check robots.txt compliance
      checks.robots = await checkRobotsTxtCompliance(url, this.userAgent);
    } catch (error) {
      console.warn(`Robots.txt check failed for ${url}:`, error.message);
      checks.robots = {
        compliant: true,
        message: 'Could not verify robots.txt compliance',
        warning: true
      };
    }
    
    try {
      // Check if source requires manual review
      checks.review = checkSourceReviewRequired(url);
    } catch (error) {
      console.warn(`Source review check failed for ${url}:`, error.message);
      checks.review = {
        requiresReview: false,
        message: 'Could not determine if source requires review'
      };
    }
    
    try {
      // Check if CAPTCHA is likely
      checks.captcha = checkCaptchaLikely(url);
    } catch (error) {
      console.warn(`CAPTCHA check failed for ${url}:`, error.message);
      checks.captcha = {
        captchaLikely: false,
        message: 'Could not determine if CAPTCHA is likely'
      };
    }
    
    return checks;
  }

  extractBusinessInfo($, selectors) {
    const info = {};

    // Extract business name
    if (selectors.businessName) {
      const nameElement = $(selectors.businessName);
      info.businessName = nameElement.text().trim();
    }

    // Extract contact person
    if (selectors.contactPerson) {
      const personElement = $(selectors.contactPerson);
      info.contactPerson = personElement.text().trim();
    }

    // Extract phone number
    if (selectors.phoneNumber) {
      const phoneElement = $(selectors.phoneNumber);
      const phoneText = phoneElement.text().trim();
      try {
        const phoneNumber = parsePhoneNumber(phoneText, 'US'); // Default to US, can be configurable
        if (phoneNumber.isValid()) {
          info.phoneNumber = phoneNumber.format('E.164');
        }
      } catch (e) {
        // If parsing fails, store raw value
        info.phoneNumber = phoneText;
      }
    }

    // Extract email
    if (selectors.email) {
      const emailElement = $(selectors.email);
      const emailText = emailElement.text().trim();
      if (validator.isEmail(emailText)) {
        info.email = emailText.toLowerCase();
      }
    }

    // Extract website URL
    if (selectors.websiteUrl) {
      const websiteElement = $(selectors.websiteUrl);
      const websiteUrl = websiteElement.attr('href') || websiteElement.text().trim();
      if (validator.isURL(websiteUrl)) {
        info.websiteUrl = websiteUrl;
      }
    }

    // Extract physical address
    if (selectors.physicalAddress) {
      const addressElement = $(selectors.physicalAddress);
      info.physicalAddress = addressElement.text().trim();
    }

    return info;
  }

  async extractMetadata(page) {
    try {
      const title = await page.title();
      const description = await page.$eval('meta[name="description"]', el => el.content, '');
      const keywords = await page.$eval('meta[name="keywords"]', el => el.content, '');
      
      return {
        websiteTitle: title,
        websiteDescription: description,
        websiteKeywords: keywords
      };
    } catch (error) {
      return {};
    }
  }

  async extractAdditionalInfo(page, $) {
    try {
      // Extract social media links
      const socialLinks = {};
      const socialSelectors = {
        facebook: 'a[href*="facebook.com"]',
        twitter: 'a[href*="twitter.com"]',
        linkedin: 'a[href*="linkedin.com"]',
        instagram: 'a[href*="instagram.com"]'
      };
      
      for (const [platform, selector] of Object.entries(socialSelectors)) {
        const element = $(selector);
        if (element.length > 0) {
          socialLinks[platform] = element.attr('href');
        }
      }
      
      // Extract contact information from common patterns
      const contactInfo = {};
      
      // Extract all phone numbers from the page
      const phoneMatches = $('body').text().match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
      if (phoneMatches) {
        contactInfo.phoneNumbers = [...new Set(phoneMatches)]; // Remove duplicates
      }
      
      // Extract all email addresses from the page
      const emailMatches = $('body').text().match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
      if (emailMatches) {
        contactInfo.emails = [...new Set(emailMatches)]; // Remove duplicates
      }
      
      return {
        socialLinks,
        contactInfo
      };
    } catch (error) {
      return {};
    }
  }

  async detectCaptcha(page) {
    // Check for common captcha indicators
    const captchaSelectors = [
      'iframe[src*="captcha"]',
      '[id*="captcha"]',
      '[class*="captcha"]',
      'img[alt*="captcha"]',
      '[data-sitekey]', // reCAPTCHA
      '.g-recaptcha' // Google reCAPTCHA
    ];

    for (const selector of captchaSelectors) {
      const element = await page.$(selector);
      if (element) {
        return true;
      }
    }

    return false;
  }

  // HTTP API connector alternative for sources that provide APIs
  async fetchFromApi(apiUrl, apiKey = null) {
    try {
      const headers = {
        'User-Agent': this.userAgent
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await axios.get(apiUrl, {
        headers,
        timeout: this.config.timeout
      });

      return {
        success: true,
        data: response.data,
        statusCode: response.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status
      };
    }
  }

  // Utility function for delaying execution
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Save raw data to file for compliance logging
  async saveRawData(data, jobId) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `raw-data-${jobId}-${timestamp}.json`;
      const filepath = path.join(__dirname, '../../data/raw', filename);
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      
      // Save data
      await fs.writeFile(filepath, JSON.stringify(data, null, 2));
      
      return filepath;
    } catch (error) {
      console.error('Failed to save raw data:', error);
      return null;
    }
  }
}

module.exports = WebScraperWorker;