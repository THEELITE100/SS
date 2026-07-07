const FreelancerProfile = require('../models/FreelancerProfile');
const { rankFreelancersForGig } = require('../services/aiService');

const getRecommendations = async (req, res) => {
  const { title, description, requiredSkills, maxHourlyRate } = req.body;

  if (!title || !description || !requiredSkills) {
    return res.status(400).json({ message: 'Please provide title, description, and requiredSkills' });
  }

  try {
    let query = {};
    if (maxHourlyRate) {
      query.hourlyRate = { $lte: Number(maxHourlyRate) };
    }

    const candidates = await FreelancerProfile.find(query).populate('user', 'name email location');

    if (candidates.length === 0) {
      return res.status(404).json({ message: 'No candidate freelancers found matching initial criteria.' });
    }

    const rankedRecommendations = await rankFreelancersForGig(
      title,
      description,
      requiredSkills,
      candidates
    );

    res.status(200).json({
      success: true,
      count: rankedRecommendations.slice(0, 10).length,
      recommendations: rankedRecommendations.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecommendations };