import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { chatApi } from './chatApi';

export const useConversations = () =>
  useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.listConversations().then((res) => res.data.data.conversations),
  });

export const useGetOrCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => chatApi.getOrCreateConversation(payload).then((res) => res.data.data.conversation),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    onError: (error) => toast.error(error.response?.data?.message || 'Could not start conversation'),
  });
};

export const useMessages = (conversationId) =>
  useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatApi.getMessages(conversationId).then((res) => res.data.data.messages),
    enabled: !!conversationId,
  });

export const useSendMessage = (conversationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) => chatApi.sendMessage(conversationId, content).then((res) => res.data.data.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Message failed to send'),
  });
};
