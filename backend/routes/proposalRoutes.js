const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.status(200).json([]); 
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proposals.' });
  }
});

router.post('/', (req, res) => {
  try {
    res.status(201).json({ message: 'Proposal submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting proposal.' });
  }
});

module.exports = router;