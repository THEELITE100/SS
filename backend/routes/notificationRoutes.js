const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.status(200).json([]); 
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

module.exports = router;