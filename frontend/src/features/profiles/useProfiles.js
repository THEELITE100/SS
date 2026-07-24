import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { profilesApi } from './profilesApi';

export const useMyProfile = () =>
  useQuery({
    queryKey: ['profile', 'mine'],
    queryFn: () => profilesApi.getMine().then((res) => res.data.data.profile),
  });

export const useFreelancerProfile = (userId) =>
  useQuery({
    queryKey: ['profile', 'freelancer', userId],
    queryFn: () => profilesApi.getFreelancer(userId).then((res) => res.data.data.profile),
    enabled: !!userId,
  });

export const useClientProfile = (userId) =>
  useQuery({
    queryKey: ['profile', 'client', userId],
    queryFn: () => profilesApi.getClient(userId).then((res) => res.data.data.profile),
    enabled: !!userId,
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => profilesApi.updateMine(payload).then((res) => res.data.data.profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'mine'] });
      toast.success('Profile saved');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save profile'),
  });
};

export const useMyAnalytics = () =>
  useQuery({
    queryKey: ['profile', 'myAnalytics'],
    queryFn: () => profilesApi.myAnalytics().then((res) => res.data.data),
  });
