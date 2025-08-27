<<<<<<< HEAD
// frontend/src/utils/errorHandler.js
// Error handling utility functions

/**
 * Handle API errors and return user-friendly messages
 * @param {Object} error - The error object from axios or fetch
 * @returns {Object} Formatted error object with message and status
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Default error object
  const errorResponse = {
    message: 'An unexpected error occurred. Please try again.',
    status: null,
    code: null
  };
  
  // If it's an axios error with response
  if (error.response) {
    errorResponse.status = error.response.status;
    errorResponse.code = error.response.data?.code;
    
    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 400:
        errorResponse.message = error.response.data?.message || 'Bad request. Please check your input.';
        break;
      case 401:
        errorResponse.message = 'Your session has expired. Please log in again.';
        break;
      case 403:
        errorResponse.message = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorResponse.message = 'The requested resource was not found.';
        break;
      case 422:
        errorResponse.message = error.response.data?.message || 'Validation error. Please check your input.';
        break;
      case 429:
        errorResponse.message = 'Too many requests. Please wait a moment and try again.';
        break;
      case 500:
        errorResponse.message = 'Server error. Please try again later.';
        break;
      case 502:
      case 503:
      case 504:
        errorResponse.message = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        errorResponse.message = error.response.data?.message || 'An error occurred. Please try again.';
    }
  } 
  // If it's a network error
  else if (error.request) {
    errorResponse.message = 'Network error. Please check your connection and try again.';
    errorResponse.code = 'NETWORK_ERROR';
  } 
  // If it's a general error
  else {
    errorResponse.message = error.message || 'An unexpected error occurred. Please try again.';
    errorResponse.code = 'GENERAL_ERROR';
  }
  
  return errorResponse;
};

/**
 * Handle job errors and determine if they should be retried
 * @param {Object} error - The error object
 * @param {number} attempt - Current retry attempt number
 * @param {number} maxRetries - Maximum number of retries allowed
 * @returns {Object} Retry decision with delay and message
 */
export const handleJobError = (error, attempt, maxRetries = 3) => {
  const errorResponse = handleApiError(error);
  
  // Determine if error should be retried
  const retryableErrors = [
    'NETWORK_ERROR',
    'GENERAL_ERROR',
    500,
    502,
    503,
    504,
    429
  ];
  
  const shouldRetry = retryableErrors.includes(errorResponse.code) || 
                     retryableErrors.includes(errorResponse.status);
  
  // Calculate delay (exponential backoff)
  const delay = shouldRetry ? Math.pow(2, attempt) * 1000 : 0;
  
  return {
    shouldRetry: shouldRetry && attempt < maxRetries,
    delay,
    message: errorResponse.message,
    error: errorResponse
  };
};

/**
 * Format error for display to user
 * @param {Object} error - The error object
 * @param {string} context - Context where error occurred
 * @returns {string} Formatted error message
 */
export const formatErrorForUser = (error, context = '') => {
  const errorResponse = handleApiError(error);
  const contextPrefix = context ? `${context}: ` : '';
  
  return `${contextPrefix}${errorResponse.message}`;
};

/**
 * Log error for debugging purposes
 * @param {Object} error - The error object
 * @param {string} context - Context where error occurred
 * @param {Object} additionalData - Additional data to log
 */
export const logError = (error, context = '', additionalData = {}) => {
  console.error(`[${new Date().toISOString()}] ${context} Error:`, {
    error,
    context,
    additionalData,
    userAgent: navigator.userAgent,
    url: window.location.href
  });
};

/**
 * Handle authentication errors
 * @param {Object} error - The error object
 * @param {Function} logout - Function to logout user
 */
export const handleAuthError = (error, logout) => {
  const errorResponse = handleApiError(error);
  
  // If it's an authentication error, logout the user
  if (errorResponse.status === 401) {
    logout();
  }
  
  return errorResponse;
};

export default {
  handleApiError,
  handleJobError,
  formatErrorForUser,
  logError,
  handleAuthError
=======
// frontend/src/utils/errorHandler.js
// Error handling utility functions

/**
 * Handle API errors and return user-friendly messages
 * @param {Object} error - The error object from axios or fetch
 * @returns {Object} Formatted error object with message and status
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Default error object
  const errorResponse = {
    message: 'An unexpected error occurred. Please try again.',
    status: null,
    code: null
  };
  
  // If it's an axios error with response
  if (error.response) {
    errorResponse.status = error.response.status;
    errorResponse.code = error.response.data?.code;
    
    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 400:
        errorResponse.message = error.response.data?.message || 'Bad request. Please check your input.';
        break;
      case 401:
        errorResponse.message = 'Your session has expired. Please log in again.';
        break;
      case 403:
        errorResponse.message = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorResponse.message = 'The requested resource was not found.';
        break;
      case 422:
        errorResponse.message = error.response.data?.message || 'Validation error. Please check your input.';
        break;
      case 429:
        errorResponse.message = 'Too many requests. Please wait a moment and try again.';
        break;
      case 500:
        errorResponse.message = 'Server error. Please try again later.';
        break;
      case 502:
      case 503:
      case 504:
        errorResponse.message = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        errorResponse.message = error.response.data?.message || 'An error occurred. Please try again.';
    }
  } 
  // If it's a network error
  else if (error.request) {
    errorResponse.message = 'Network error. Please check your connection and try again.';
    errorResponse.code = 'NETWORK_ERROR';
  } 
  // If it's a general error
  else {
    errorResponse.message = error.message || 'An unexpected error occurred. Please try again.';
    errorResponse.code = 'GENERAL_ERROR';
  }
  
  return errorResponse;
};

/**
 * Handle job errors and determine if they should be retried
 * @param {Object} error - The error object
 * @param {number} attempt - Current retry attempt number
 * @param {number} maxRetries - Maximum number of retries allowed
 * @returns {Object} Retry decision with delay and message
 */
export const handleJobError = (error, attempt, maxRetries = 3) => {
  const errorResponse = handleApiError(error);
  
  // Determine if error should be retried
  const retryableErrors = [
    'NETWORK_ERROR',
    'GENERAL_ERROR',
    500,
    502,
    503,
    504,
    429
  ];
  
  const shouldRetry = retryableErrors.includes(errorResponse.code) || 
                     retryableErrors.includes(errorResponse.status);
  
  // Calculate delay (exponential backoff)
  const delay = shouldRetry ? Math.pow(2, attempt) * 1000 : 0;
  
  return {
    shouldRetry: shouldRetry && attempt < maxRetries,
    delay,
    message: errorResponse.message,
    error: errorResponse
  };
};

/**
 * Format error for display to user
 * @param {Object} error - The error object
 * @param {string} context - Context where error occurred
 * @returns {string} Formatted error message
 */
export const formatErrorForUser = (error, context = '') => {
  const errorResponse = handleApiError(error);
  const contextPrefix = context ? `${context}: ` : '';
  
  return `${contextPrefix}${errorResponse.message}`;
};

/**
 * Log error for debugging purposes
 * @param {Object} error - The error object
 * @param {string} context - Context where error occurred
 * @param {Object} additionalData - Additional data to log
 */
export const logError = (error, context = '', additionalData = {}) => {
  console.error(`[${new Date().toISOString()}] ${context} Error:`, {
    error,
    context,
    additionalData,
    userAgent: navigator.userAgent,
    url: window.location.href
  });
};

/**
 * Handle authentication errors
 * @param {Object} error - The error object
 * @param {Function} logout - Function to logout user
 */
export const handleAuthError = (error, logout) => {
  const errorResponse = handleApiError(error);
  
  // If it's an authentication error, logout the user
  if (errorResponse.status === 401) {
    logout();
  }
  
  return errorResponse;
};

export default {
  handleApiError,
  handleJobError,
  formatErrorForUser,
  logError,
  handleAuthError
>>>>>>> e5d4683 (Initial commit)
};