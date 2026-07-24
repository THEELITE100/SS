import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { connectSocket, disconnectSocket, getSocket } from '../../lib/socket';

// Owns the socket's lifecycle for the whole app: connects once authenticated,
// disconnects on logout, and turns the two "push" events (new notification,
// new message) into toasts + React Query cache invalidation so every screen
// reading that data just naturally re-renders with fresh data.
export function useRealtimeConnection() {
  const { status } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status !== 'authenticated') {
      disconnectSocket();
      return undefined;
    }

    const socket = connectSocket();

    const handleNotification = (notification) => {
      toast(notification.title, { icon: '🔔' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleNewMessage = (message) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversation] });
    };

    socket.on('notification:new', handleNotification);
    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('notification:new', handleNotification);
      socket.off('message:new', handleNewMessage);
    };
  }, [status, queryClient]);
}

// Joins/leaves the Socket.IO room for whichever conversation is currently
// open, so "new message" events only fire for people actually looking at it.
export function useConversationRoom(conversationId) {
  useEffect(() => {
    if (!conversationId) return undefined;
    const socket = getSocket();
    if (!socket) return undefined;

    socket.emit('conversation:join', conversationId);
    return () => socket.emit('conversation:leave', conversationId);
  }, [conversationId]);
}

// Tracks whether the other participant is currently typing, and exposes a
// function to broadcast this client's own typing state.
export function useTypingIndicator(conversationId, currentUserId) {
  const [othersTyping, setOthersTyping] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return undefined;

    const handleTypingUpdate = (payload) => {
      if (payload.conversationId !== conversationId || payload.userId === currentUserId) return;
      setOthersTyping(payload.isTyping);
    };

    socket.on('typing:update', handleTypingUpdate);
    return () => socket.off('typing:update', handleTypingUpdate);
  }, [conversationId, currentUserId]);

  const setTyping = useCallback(
    (isTyping) => {
      const socket = getSocket();
      if (!socket || !conversationId) return;
      socket.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
    },
    [conversationId]
  );

  return { othersTyping, setTyping };
}
