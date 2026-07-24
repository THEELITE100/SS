import axiosInstance from '../../api/axiosInstance';

export const matchingApi = {
  matchesForGig: (gigId) => axiosInstance.get(`/gigs/${gigId}/matches`),
  recommendedGigs: () => axiosInstance.get('/gigs/recommended'),
  trendingSkills: () => axiosInstance.get('/gigs/trending-skills'),
};
