import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from './adminApi';

export const useAdminAnalytics = () =>
  useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => adminApi.analytics().then((res) => res.data.data),
  });

export const useAdminLogs = (params = {}) =>
  useQuery({
    queryKey: ['admin', 'logs', params],
    queryFn: () => adminApi.logs(params).then((res) => res.data.data),
  });

export const useAdminUsers = (params = {}) =>
  useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.users(params).then((res) => res.data.data),
  });

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => adminApi.suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User suspended');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not suspend user'),
  });
};

export const useUnsuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.unsuspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User unsuspended');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not unsuspend user'),
  });
};

export const useVerifyFreelancer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, badge }) => adminApi.verifyFreelancer(id, badge),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Verification badge updated');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not update badge'),
  });
};

export const useAdminGigs = (params = {}) =>
  useQuery({
    queryKey: ['admin', 'gigs', params],
    queryFn: () => adminApi.gigs(params).then((res) => res.data.data),
  });

export const useRemoveGig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => adminApi.removeGig(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gigs'] });
      toast.success('Gig removed');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not remove gig'),
  });
};

export const useFlaggedReviews = (params = {}) =>
  useQuery({
    queryKey: ['admin', 'flaggedReviews', params],
    queryFn: () => adminApi.flaggedReviews(params).then((res) => res.data.data),
  });

export const useResolveFlaggedReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) => adminApi.resolveReview(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flaggedReviews'] });
      toast.success('Review resolved');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not resolve review'),
  });
};

export const useAdminDisputes = (params = {}) =>
  useQuery({
    queryKey: ['admin', 'disputes', params],
    queryFn: () => adminApi.disputes(params).then((res) => res.data.data),
  });

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolution, outcome }) => adminApi.resolveDispute(id, resolution, outcome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] });
      toast.success('Dispute resolved');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not resolve dispute'),
  });
};
