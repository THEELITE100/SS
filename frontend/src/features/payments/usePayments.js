import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { paymentsApi } from './paymentsApi';

export const usePaymentsForGig = (gigId) =>
  useQuery({
    queryKey: ['payments', gigId],
    queryFn: () => paymentsApi.listForGig(gigId).then((res) => res.data.data.payments),
    enabled: !!gigId,
  });

export const useFundMilestone = (gigId) => {
  return useMutation({
    mutationFn: (milestoneId) => paymentsApi.fundMilestone(gigId, milestoneId).then((res) => res.data.data),
    onError: (error) => toast.error(error.response?.data?.message || 'Could not start payment'),
  });
};

export const useConfirmPayment = (gigId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId) => paymentsApi.confirmPayment(paymentId).then((res) => res.data.data.payment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', gigId] });
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] });
      toast.success('Payment confirmed — funds are held in escrow');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Could not confirm payment'),
  });
};

export const useConnectStatus = () =>
  useQuery({
    queryKey: ['payments', 'connectStatus'],
    queryFn: () => paymentsApi.connectStatus().then((res) => res.data.data),
  });

export const useStartConnectOnboarding = () =>
  useMutation({
    mutationFn: () => paymentsApi.connectOnboard().then((res) => res.data.data.url),
    onError: (error) => toast.error(error.response?.data?.message || 'Could not start onboarding'),
  });
