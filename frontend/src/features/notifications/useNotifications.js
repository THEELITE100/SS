import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { notificationsApi } from './notificationsApi';

export const useNotifications = (params = {}) => {
  const { status } = useSelector((state) => state.auth);
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsApi.list(params).then((res) => res.data.data),
    enabled: status === 'authenticated',
    refetchInterval: 60 * 1000, // light polling as a fallback alongside the live socket push
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
};
