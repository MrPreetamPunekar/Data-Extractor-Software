// backend/src/routes/jobs.js
// Job routes

const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate } = require('../middleware/authMiddleware');

// Job routes
router.post('/', authenticate, jobController.createJob);
router.get('/', authenticate, jobController.getJobs);
router.get('/:id', authenticate, jobController.getJob);
router.put('/:id', authenticate, jobController.updateJob);
router.delete('/:id', authenticate, jobController.deleteJob);
router.post('/:id/start', authenticate, jobController.startJob);
router.post('/:id/cancel', authenticate, jobController.cancelJob);
router.get('/:id/results', authenticate, jobController.getJobResults);
router.get('/:id/progress', authenticate, jobController.getJobProgress);

module.exports = router;