// frontend/src/utils/robotsTxtChecker.js
// Utility for checking robots.txt compliance and ethical scraping

import axios from 'axios';

/**
 * Check if a URL is compliant with robots.txt
 * @param {string} url - The URL to check
 * @param {string} userAgent - The user agent to check against
 * @returns {Object} Compliance status and information
 */
export const checkRobotsTxtCompliance = async (url, userAgent = '*') => {
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
    
    const robotsTxt = response.data;
    
    // Parse robots.txt to check if scraping is allowed
    const isAllowed = parseRobotsTxt(robotsTxt, userAgent, urlObj.pathname);
    
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
 * Parse robots.txt content to determine if a path is allowed for a user agent
 * @param {string} robotsTxt - The robots.txt content
 * @param {string} userAgent - The user agent to check
 * @param {string} path - The path to check
 * @returns {boolean} Whether the path is allowed
 */
const parseRobotsTxt = (robotsTxt, userAgent, path) => {
  // Split into lines
  const lines = robotsTxt.split('\n');
  
  let currentUserAgent = null;
  let userAgentMatched = false;
  let disallowPaths = [];
  let allowPaths = [];
  
  // Parse each line
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip comments and empty lines
    if (trimmedLine.startsWith('#') || trimmedLine === '') {
      continue;
    }
    
    // Check for user-agent directive
    if (trimmedLine.toLowerCase().startsWith('user-agent:')) {
      currentUserAgent = trimmedLine.substring(11).trim();
      
      // Check if this user agent matches ours
      if (currentUserAgent === '*' || currentUserAgent === userAgent) {
        userAgentMatched = true;
        disallowPaths = [];
        allowPaths = [];
      } else {
        userAgentMatched = false;
      }
      
      continue;
    }
    
    // If we haven't matched the user agent, skip this section
    if (!userAgentMatched) {
      continue;
    }
    
    // Check for disallow directive
    if (trimmedLine.toLowerCase().startsWith('disallow:')) {
      const disallowPath = trimmedLine.substring(9).trim();
      if (disallowPath !== '') {
        disallowPaths.push(disallowPath);
      }
      continue;
    }
    
    // Check for allow directive
    if (trimmedLine.toLowerCase().startsWith('allow:')) {
      const allowPath = trimmedLine.substring(6).trim();
      if (allowPath !== '') {
        allowPaths.push(allowPath);
      }
      continue;
    }
    
    // Stop parsing if we encounter another user-agent or sitemap
    if (trimmedLine.toLowerCase().startsWith('user-agent:') || 
        trimmedLine.toLowerCase().startsWith('sitemap:')) {
      break;
    }
  }
  
  // Check if the path is allowed
  // First check if there's an explicit allow for this path
  for (const allowPath of allowPaths) {
    if (path.startsWith(allowPath)) {
      return true;
    }
  }
  
  // Then check if there's a disallow for this path
  for (const disallowPath of disallowPaths) {
    if (disallowPath === '/' || path.startsWith(disallowPath)) {
      return false;
    }
  }
  
  // If no explicit allow or disallow, it's allowed
  return true;
};

/**
 * Check if a source requires manual review based on terms of service
 * @param {string} source - The source name or URL
 * @returns {Object} Review status and information
 */
export const checkSourceReviewRequired = (source) => {
  // List of sources that typically require manual review
  const reviewRequiredSources = [
    'google.com',
    'facebook.com',
    'linkedin.com',
    'twitter.com',
    'instagram.com',
    'youtube.com'
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
export const checkCaptchaLikely = (url) => {
  // List of URL patterns that often have CAPTCHAs
  const captchaProneSources = [
    'google.com/search',
    'bing.com/search',
    'yahoo.com/search',
    'yellowpages.com',
    'yelp.com'
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
 * Generate ethical scraping guidelines for user review
 * @returns {Array} List of ethical scraping guidelines
 */
export const getEthicalScrapingGuidelines = () => {
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
export const shouldProceedWithScraping = (complianceChecks) => {
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

export default {
  checkRobotsTxtCompliance,
  checkSourceReviewRequired,
  checkCaptchaLikely,
  getEthicalScrapingGuidelines,
  shouldProceedWithScraping
};