import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reviewsApi } from './reviewsApi';

export const useReviewsForUser = (userId, params = {}) =>
  useQuery({
    queryKey: ['reviews', userId, params],
    queryFn: () => reviewsApi.forUser(userId, params).then((res) => res.data.data),
    enabled: !!userId,
  });

export const useReviewAnalytics = (userId) =>
  useQuery({
    queryKey: ['reviewAnalytics', userId],
    queryFn: () => reviewsApi.analyticsForUser(userId).then((res) => res.data.data.analytics),
    enabled: !!userId,
  });

export const useCreateReview = (gigId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => reviewsApi.create(gigId, payload).then((res) => res.data.data.review),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', review.reviewee] });
      queryClient.invalidateQueries({ queryKey: ['reviewAnalytics', review.reviewee] });
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] });
      toast.success('Review submitted — thanks for the feedback');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not submit review'),
  });
};
