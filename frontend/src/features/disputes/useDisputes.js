import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { disputesApi } from './disputesApi';

export const useMyDisputes = () =>
  useQuery({
    queryKey: ['disputes', 'mine'],
    queryFn: () => disputesApi.mine().then((res) => res.data.data.disputes),
  });

export const useDispute = (id) =>
  useQuery({
    queryKey: ['disputes', id],
    queryFn: () => disputesApi.getById(id).then((res) => res.data.data.dispute),
    enabled: !!id,
  });

export const useCreateDispute = (gigId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => disputesApi.create(gigId, payload).then((res) => res.data.data.dispute),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      toast.success('Dispute submitted — an admin will review it');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not submit dispute'),
  });
};

export const useAddDisputeMessage = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message) => disputesApi.addMessage(id, message),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['disputes', id] }),
    onError: (error) => toast.error(error.response?.data?.message || 'Could not send message'),
  });
};
