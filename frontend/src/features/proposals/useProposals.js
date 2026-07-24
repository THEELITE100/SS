import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { proposalsApi } from './proposalsApi';

export const useProposalsForGig = (gigId, enabled = true) =>
  useQuery({
    queryKey: ['proposals', 'forGig', gigId],
    queryFn: () => proposalsApi.listForGig(gigId).then((res) => res.data.data.proposals),
    enabled: !!gigId && enabled,
  });

export const useMyProposals = () =>
  useQuery({
    queryKey: ['proposals', 'mine'],
    queryFn: () => proposalsApi.mine().then((res) => res.data.data.proposals),
  });

export const useCreateProposal = (gigId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => proposalsApi.create(gigId, payload).then((res) => res.data.data.proposal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['gig', gigId] });
      toast.success('Proposal submitted!');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to submit proposal'),
  });
};

const useProposalAction = (action, successMessage) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => proposalsApi[action](id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['gig'] });
      queryClient.invalidateQueries({ queryKey: ['myGigs'] });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Something went wrong'),
  });
};

export const useAcceptProposal = () => useProposalAction('accept', 'Proposal accepted — gig is now in progress');
export const useRejectProposal = () => useProposalAction('reject', 'Proposal rejected');
export const useWithdrawProposal = () => useProposalAction('withdraw', 'Proposal withdrawn');

export const useNegotiateProposal = (gigId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => proposalsApi.negotiate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', 'forGig', gigId] });
      queryClient.invalidateQueries({ queryKey: ['proposals', 'mine'] });
      toast.success('Counter-offer sent');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to send counter-offer'),
  });
};
