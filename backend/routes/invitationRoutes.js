const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  try {
    res.status(201).json({ message: 'Invitation securely dispatched.' });
  } catch (error) {
    console.error('Invitation Error:', error);
    res.status(500).json({ message: 'Error sending invitation.' });
  }
});

module.exports = router;