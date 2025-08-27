// backend/src/utils/compliance.js
// Utility functions for compliance checking

const axios = require('axios');
const robotsParser = require('robots-parser');

/**
 * Check if a URL is compliant with robots.txt
 * @param {string} url - The URL to check
 * @param {string} userAgent - The user agent to check against
 * @returns {Object} Compliance status and information
 */
const checkRobotsTxtCompliance = async (url, userAgent = '*') => {
  try {
    // Parse the URL to get the domain
    const urlObj = new URL(url);
    const domain = `${urlObj.protocol}//${urlObj.host}`;
    const robotsUrl = `${domain}/robots.txt`;
    
    // Fetch robots.txt
    const response = await axios.get(robotsUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': userAgent
      }
    });
    
    // Parse robots.txt
    const robots = robotsParser(robotsUrl, response.data);
    
    // Check if scraping is allowed
    const isAllowed = robots.isAllowed(url, userAgent);
    
    return {
      compliant: isAllowed,
      checkedAt: new Date().toISOString(),
      robotsUrl: robotsUrl,
      message: isAllowed 
        ? 'Scraping is allowed according to robots.txt' 
        : 'Scraping is not allowed according to robots.txt'
    };
  } catch (error) {
    // If we can't fetch robots.txt, we assume it's okay to proceed
    // but we log this for review
    console.warn(`Could not fetch robots.txt for ${url}:`, error.message);
    
    return {
      compliant: true,
      checkedAt: new Date().toISOString(),
      robotsUrl: null,
      message: 'Could not verify robots.txt compliance. Proceeding with caution.',
      warning: true
    };
  }
};

/**
 * Check if a source requires manual review based on terms of service
 * @param {string} source - The source name or URL
 * @returns {Object} Review status and information
 */
const checkSourceReviewRequired = (source) => {
  // List of sources that typically require manual review
  const reviewRequiredSources = [
    'google.com',
    'facebook.com',
    'linkedin.com',
    'twitter.com',
    'instagram.com',
    'youtube.com',
    'amazon.com',
    'ebay.com',
    'craigslist.org'
  ];
  
  // Check if the source is in our list
  const requiresReview = reviewRequiredSources.some(reviewSource => 
    source.toLowerCase().includes(reviewSource)
  );
  
  return {
    requiresReview,
    message: requiresReview 
      ? 'This source may require manual review based on its terms of service.'
      : 'This source appears to allow automated access.',
    reviewSources: reviewRequiredSources
  };
};

/**
 * Check if a CAPTCHA is likely to be encountered
 * @param {string} url - The URL to check
 * @returns {Object} CAPTCHA status and information
 */
const checkCaptchaLikely = (url) => {
  // List of URL patterns that often have CAPTCHAs
  const captchaProneSources = [
    'google.com/search',
    'bing.com/search',
    'yahoo.com/search',
    'yellowpages.com',
    'yelp.com',
    'indeed.com',
    'glassdoor.com'
  ];
  
  // Check if the URL matches any of these patterns
  const captchaLikely = captchaProneSources.some(captchaSource => 
    url.toLowerCase().includes(captchaSource)
  );
  
  return {
    captchaLikely,
    message: captchaLikely 
      ? 'This source is known to use CAPTCHAs. Manual intervention may be required.'
      : 'This source is not known to use CAPTCHAs.',
    captchaSources: captchaProneSources
  };
};

/**
 * Generate ethical scraping guidelines for logging
 * @returns {Array} List of ethical scraping guidelines
 */
const getEthicalScrapingGuidelines = () => {
  return [
    'Respect robots.txt and terms of service',
    'Use appropriate request delays to avoid overloading servers',
    'Identify your scraper with a user agent',
    'Handle errors gracefully and retry appropriately',
    'Store data securely and comply with privacy regulations',
    'Provide opt-out mechanisms for data subjects',
    'Regularly review and update scraping practices',
    'Monitor for changes in website structure',
    'Log scraping activities for audit purposes',
    'Obtain proper permissions when required'
  ];
};

/**
 * Check if scraping should proceed based on compliance checks
 * @param {Object} complianceChecks - Results from various compliance checks
 * @returns {Object} Decision on whether to proceed
 */
const shouldProceedWithScraping = (complianceChecks) => {
  // If robots.txt explicitly disallows, don't proceed
  if (complianceChecks.robots && !complianceChecks.robots.compliant) {
    return {
      proceed: false,
      reason: 'Robots.txt compliance check failed',
      message: complianceChecks.robots.message
    };
  }
  
  // If source requires review, user consent is needed
  if (complianceChecks.review && complianceChecks.review.requiresReview) {
    return {
      proceed: false,
      reason: 'Source requires manual review',
      message: complianceChecks.review.message,
      requiresUserConsent: true
    };
  }
  
  // If CAPTCHA is likely, warn but allow proceeding
  if (complianceChecks.captcha && complianceChecks.captcha.captchaLikely) {
    return {
      proceed: true,
      reason: 'CAPTCHA may be encountered',
      message: complianceChecks.captcha.message,
      warning: true
    };
  }
  
  // Otherwise, proceed
  return {
    proceed: true,
    reason: 'All checks passed',
    message: 'Scraping can proceed ethically'
  };
};

module.exports = {
  checkRobotsTxtCompliance,
  checkSourceReviewRequired,
  checkCaptchaLikely,
  getEthicalScrapingGuidelines,
  shouldProceedWithScraping
};