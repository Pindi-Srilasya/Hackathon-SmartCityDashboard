const express = require('express');
const router = express.Router();
const {
  getLatestData,
  getStatistics,
  getDataByDateRange
} = require('../controllers/dataController');

router.get('/latest', getLatestData);
router.get('/statistics', getStatistics);
router.get('/range', getDataByDateRange);

module.exports = router;