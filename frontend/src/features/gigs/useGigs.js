import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { gigsApi } from './gigsApi';

export const useGigs = (filters = {}) =>
  useQuery({
    queryKey: ['gigs', filters],
    queryFn: () => gigsApi.list(filters).then((res) => res.data.data),
    placeholderData: (previous) => previous,
  });

export const useGig = (id) =>
  useQuery({
    queryKey: ['gig', id],
    queryFn: () => gigsApi.getById(id).then((res) => res.data.data.gig),
    enabled: !!id,
  });

export const useMyGigs = () =>
  useQuery({
    queryKey: ['myGigs'],
    queryFn: () => gigsApi.getMine().then((res) => res.data.data.gigs),
  });

export const useCreateGig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => gigsApi.create(payload).then((res) => res.data.data.gig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGigs'] });
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      toast.success('Gig posted!');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to post gig'),
  });
};

export const useUpdateGig = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => gigsApi.update(id, payload).then((res) => res.data.data.gig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gig', id] });
      queryClient.invalidateQueries({ queryKey: ['myGigs'] });
      toast.success('Gig updated');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update gig'),
  });
};

export const useCancelGig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => gigsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myGigs'] });
      toast.success('Gig cancelled');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to cancel gig'),
  });
};

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gigId, milestoneId, status }) => gigsApi.updateMilestone(gigId, milestoneId, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gig', variables.gigId] });
      toast.success('Milestone updated');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update milestone'),
  });
};
