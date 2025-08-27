// backend/src/routes/exports.js
// Export routes

const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticate } = require('../middleware/authMiddleware');

// Export routes
router.post('/', authenticate, exportController.createExport);
router.get('/', authenticate, exportController.getExports);
router.get('/:id', authenticate, exportController.getExport);
router.get('/:id/download', authenticate, exportController.downloadExport);

module.exports = router;