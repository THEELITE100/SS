const User = require('../models/User');
const Gig = require('../models/Gig');
const FreelancerProfile = require('../models/FreelancerProfile');

const searchFreelancers = async (req, res) => {
  try {
    const {
      skills,
      minRate,
      maxRate,
      minRating,
      minCompletedGigs,
      latitude,
      longitude,
      maxDistanceKm = 25, 
      sortBy = 'rating', 
      page = 1,
      limit = 10,
    } = req.query;

    const pipeline = [];

    if (latitude && longitude) {
      pipeline.push({
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: 'distanceInMeters',
          maxDistance: parseFloat(maxDistanceKm) * 1000, 
          spherical: true,
          query: { role: 'freelancer', isSuspended: false },
        },
      });
    } else {
      pipeline.push({
        $match: { role: 'freelancer', isSuspended: false },
      });
    }

    pipeline.push({
      $lookup: {
        from: 'freelancerprofiles',
        localField: '_id',
        foreignField: 'user',
        as: 'profile',
      },
    });

    pipeline.push({ $unwind: '$profile' });

    const matchFilters = {};

    if (minRate || maxRate) {
      matchFilters['profile.hourlyRate'] = {};
      if (minRate) matchFilters['profile.hourlyRate'].$gte = Number(minRate);
      if (maxRate) matchFilters['profile.hourlyRate'].$lte = Number(maxRate);
    }

    if (minRating) {
      matchFilters['profile.reputationScore'] = { $gte: Number(minRating) };
    }

    if (minCompletedGigs) {
      matchFilters['profile.completedGigsCount'] = { $gte: Number(minCompletedGigs) };
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      matchFilters['profile.skills.name'] = { $in: skillsArray.map((s) => new RegExp(s, 'i')) };
    }

    if (Object.keys(matchFilters).length > 0) {
      pipeline.push({ $match: matchFilters });
    }

    let sortStage = { 'profile.reputationScore': -1 };
    if (sortBy === 'rate_asc') sortStage = { 'profile.hourlyRate': 1 };
    if (sortBy === 'rate_desc') sortStage = { 'profile.hourlyRate': -1 };
    if (sortBy === 'distance' && latitude && longitude) sortStage = { distanceInMeters: 1 };

    pipeline.push({ $sort: sortStage });

    const skip = (Number(page) - 1) * Number(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    pipeline.push({
      $project: {
        password: 0,
        __v: 0,
        'profile.__v': 0,
      },
    });

    const results = await User.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: results.length,
      page: Number(page),
      freelancers: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchGigs = async (req, res) => {
  try {
    const {
      category,
      skills,
      minBudget,
      maxBudget,
      budgetType,
      locationRequirement,
      latitude,
      longitude,
      maxDistanceKm = 50,
      sortBy = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const pipeline = [];

    if (latitude && longitude && locationRequirement === 'hyperlocal') {
      pipeline.push({
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          distanceField: 'distanceInMeters',
          maxDistance: parseFloat(maxDistanceKm) * 1000,
          spherical: true,
          query: { status: 'open', locationRequirement: 'hyperlocal' },
        },
      });
    } else {
      const baseMatch = { status: 'open' };
      if (locationRequirement) baseMatch.locationRequirement = locationRequirement;
      pipeline.push({ $match: baseMatch });
    }

    const matchFilters = {};

    if (category) {
      matchFilters.category = new RegExp(category, 'i');
    }

    if (budgetType) {
      matchFilters.budgetType = budgetType;
    }

    if (minBudget || maxBudget) {
      matchFilters['budgetRange.min'] = {};
      if (minBudget) matchFilters['budgetRange.min'].$gte = Number(minBudget);
      if (maxBudget) matchFilters['budgetRange.max'].$lte = Number(maxBudget);
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      matchFilters.requiredSkills = { $in: skillsArray.map((s) => new RegExp(s, 'i')) };
    }

    if (Object.keys(matchFilters).length > 0) {
      pipeline.push({ $match: matchFilters });
    }

    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'client',
        foreignField: '_id',
        as: 'clientDetails',
      },
    });
    pipeline.push({ $unwind: '$clientDetails' });

    let sortStage = { createdAt: -1 }; 
    if (sortBy === 'budget_desc') sortStage = { 'budgetRange.max': -1 };
    if (sortBy === 'distance' && latitude && longitude) sortStage = { distanceInMeters: 1 };
    pipeline.push({ $sort: sortStage });

    const skip = (Number(page) - 1) * Number(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: Number(limit) });

    pipeline.push({
      $project: {
        'clientDetails.password': 0,
        'clientDetails.__v': 0,
      },
    });

    const results = await Gig.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: results.length,
      page: Number(page),
      gigs: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchFreelancers, searchGigs };