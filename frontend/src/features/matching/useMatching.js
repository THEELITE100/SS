import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { matchingApi } from './matchingApi';

export const useMatchesForGig = (gigId, enabled = true) =>
  useQuery({
    queryKey: ['matches', gigId],
    queryFn: () => matchingApi.matchesForGig(gigId).then((res) => res.data.data),
    enabled: !!gigId && enabled,
  });

export const useRecommendedGigs = () => {
  const { user, status } = useSelector((state) => state.auth);
  return useQuery({
    queryKey: ['recommendedGigs'],
    queryFn: () => matchingApi.recommendedGigs().then((res) => res.data.data),
    enabled: status === 'authenticated' && user?.role === 'freelancer',
    retry: false,
  });
};

export const useTrendingSkills = () =>
  useQuery({
    queryKey: ['trendingSkills'],
    queryFn: () => matchingApi.trendingSkills().then((res) => res.data.data.trending),
  });
