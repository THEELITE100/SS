const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  try {
    res.status(200).json({
      skills: [],
      portfolio: [],
      hourlyRate: '',
      title: '',
      bio: ''
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching freelancer profile' });
  }
});

module.exports = router;