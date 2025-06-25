const express = require('express');
const router = express.Router();
const compressionController = require('../controllers/compressionController');
const auth = require('../middleware/auth');

// Get available algorithms
router.get('/algorithms', compressionController.getAlgorithms);

// Compress file (protected)
router.post('/compress', auth, compressionController.compress);

// Decompress file (protected)
router.post('/decompress', auth, compressionController.decompress);

module.exports = router; 