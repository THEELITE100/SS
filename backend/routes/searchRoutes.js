const express = require('express');
const router = express.Router();
const { searchFreelancers, searchGigs } = require('../controllers/searchController');

router.get('/freelancers', searchFreelancers);
router.get('/gigs', searchGigs);

module.exports = router;