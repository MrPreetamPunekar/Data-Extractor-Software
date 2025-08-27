// worker/src/scrapers/scraperService.js
// Web scraping service using Playwright and Cheerio

const { chromium } = require('playwright');
const cheerio = require('cheerio');
const axios = require('axios');
const ProxyServer = require('../models/ProxyServer');
const winston = require('winston');

// Set up Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'scraper-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/scraper-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/scraper-combined.log' })
  ]
});

class ScraperService {
  constructor() {
    this.browser = null;
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  // Initialize browser
  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      logger.info('Browser initialized successfully');
    }
  }

  // Close browser
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed successfully');
    }
  }

  // Get active proxy server
  async getActiveProxy() {
    try {
      const proxy = await ProxyServer.findOne({
        where: {
          is_active: true
        },
        order: [['last_used', 'ASC']]
      });

      if (proxy) {
        // Update last used timestamp
        await proxy.update({
          last_used: new Date()
        });
        return proxy;
      }

      return null;
    } catch (error) {
      logger.error('Error getting active proxy:', error);
      return null;
    }
  }

  // Scrape a single page with Playwright
  async scrapePage(url, options = {}) {
    await this.initialize();

    const startTime = Date.now();
    let proxy = null;

    try {
      // Get proxy if enabled
      if (options.useProxy !== false) {
        proxy = await this.getActiveProxy();
      }

      // Create browser context
      const contextOptions = {
        userAgent: this.userAgent,
        viewport: { width: 1920, height: 1080 }
      };

      // Add proxy to context if available
      if (proxy) {
        contextOptions.proxy = {
          server: `http://${proxy.host}:${proxy.port}`,
          username: proxy.username || undefined,
          password: proxy.password || undefined
        };
      }

      const context = await this.browser.newContext(contextOptions);

      // Set up request interception for tracking and blocking
      await context.route('**/*', route => {
        const type = route.request().resourceType();
        if (type === 'image' || type === 'font' || type === 'media') {
          route.abort();
        } else {
          route.continue();
        }
      });

      // Navigate to the page
      const page = await context.newPage();
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: options.timeout || 30000
      });

      // Check if we encountered a captcha
      const captchaDetected = await this.detectCaptcha(page);
      if (captchaDetected) {
        await context.close();
        return {
          success: false,
          error: 'Captcha detected',
          captchaRequired: true,
          requiresReview: true
        };
      }

      // Extract page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract metadata
      const title = await page.title();
      const description = await page.$eval('meta[name="description"]', el => el ? el.content : '', '');

      // Close context
      await context.close();

      const endTime = Date.now();

      return {
        success: true,
        content,
        title,
        description,
        status: response.status(),
        duration: endTime - startTime,
        proxyUsed: proxy ? `${proxy.host}:${proxy.port}` : null
      };
    } catch (error) {
      logger.error(`Error scraping page ${url}:`, error);
      
      const endTime = Date.now();
      
      return {
        success: false,
        error: error.message,
        duration: endTime - startTime,
        requiresReview: true
      };
    }
  }

  // Scrape with HTTP request (for APIs or simple pages)
  async scrapeWithHttp(url, options = {}) {
    const startTime = Date.now();

    try {
      const config = {
        url,
        method: options.method || 'GET',
        timeout: options.timeout || 10000,
        headers: {
          'User-Agent': this.userAgent,
          ...options.headers
        }
      };

      if (options.data) {
        config.data = options.data;
      }

      const response = await axios(config);

      const endTime = Date.now();

      return {
        success: true,
        content: response.data,
        status: response.status,
        duration: endTime - startTime
      };
    } catch (error) {
      logger.error(`Error scraping with HTTP ${url}:`, error);
      
      const endTime = Date.now();
      
      return {
        success: false,
        error: error.message,
        status: error.response ? error.response.status : null,
        duration: endTime - startTime
      };
    }
  }

  // Detect captcha on page
  async detectCaptcha(page) {
    // Check for common captcha indicators
    const captchaSelectors = [
      'iframe[src*="captcha"]',
      '[id*="captcha"]',
      '[class*="captcha"]',
      'img[alt*="captcha"]'
    ];

    for (const selector of captchaSelectors) {
      const element = await page.$(selector);
      if (element) {
        return true;
      }
    }

    return false;
  }

  // Check robots.txt compliance
  async checkRobotsTxt(url) {
    try {
      const robotsUrl = new URL('/robots.txt', url).href;
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      
      // Simple check - in a real implementation, you'd parse the robots.txt properly
      // This is a simplified version for demonstration
      return !response.data.includes('Disallow: /');
    } catch (error) {
      // If we can't fetch robots.txt, assume it's okay to proceed
      logger.warn(`Could not fetch robots.txt for ${url}:`, error.message);
      return true;
    }
  }

  // Scrape multiple pages
  async scrapeMultiplePages(urls, options = {}) {
    const results = [];

    for (const url of urls) {
      try {
        // Check robots.txt compliance if required
        if (options.respectRobotsTxt !== false) {
          const isAllowed = await this.checkRobotsTxt(url);
          if (!isAllowed) {
            results.push({
              url,
              success: false,
              error: 'Blocked by robots.txt',
              requiresReview: true
            });
            continue;
          }
        }

        // Scrape the page
        const result = await this.scrapePage(url, options);
        results.push({
          url,
          ...result
        });
      } catch (error) {
        logger.error(`Error scraping ${url}:`, error);
        results.push({
          url,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = new ScraperService();