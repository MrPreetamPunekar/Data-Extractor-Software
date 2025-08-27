<<<<<<< HEAD
// backend/src/middleware/requestLogger.js
// Request logging middleware

const logRequests = (logger) => {
  return (req, res, next) => {
    // Log the request
    logger.info('Incoming request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Log the response when it's finished
    res.on('finish', () => {
      logger.info('Response sent', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: Date.now() - req.timestamp,
        timestamp: new Date().toISOString()
      });
    });

    // Add timestamp to request for calculating response time
    req.timestamp = Date.now();

    next();
  };
};

module.exports = {
  logRequests
=======
// backend/src/middleware/requestLogger.js
// Request logging middleware

const logRequests = (logger) => {
  return (req, res, next) => {
    // Log the request
    logger.info('Incoming request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Log the response when it's finished
    res.on('finish', () => {
      logger.info('Response sent', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: Date.now() - req.timestamp,
        timestamp: new Date().toISOString()
      });
    });

    // Add timestamp to request for calculating response time
    req.timestamp = Date.now();

    next();
  };
};

module.exports = {
  logRequests
>>>>>>> e5d4683 (Initial commit)
};