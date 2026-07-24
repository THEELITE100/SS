import { io } from 'socket.io-client';
import { getAccessToken } from '../api/axiosInstance';

let socket = null;

// The auth token rotates (15-minute access tokens), so this is a callback
// rather than a static value — Socket.IO calls it fresh on every connection
// and reconnection attempt instead of reusing whatever token existed when
// the socket was first created.
export const connectSocket = () => {
  if (socket?.connected) return socket;

  if (socket) {
    socket.connect();
    return socket;
  }

  const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

  socket = io(socketUrl, {
    autoConnect: true,
    reconnection: true,
    auth: (cb) => cb({ token: getAccessToken() }),
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
