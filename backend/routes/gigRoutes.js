const express = require('express');
const router = express.Router();
const { 
  createGig, 
  getGigs, 
  deleteGig 
} = require('../controllers/gigController'); 

router.get('/', getGigs);
router.post('/', createGig);
router.delete('/:id', deleteGig); 

module.exports = router;