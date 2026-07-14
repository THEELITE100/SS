import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
  : 'http://localhost:5000';

export const socket = io(SOCKET_SERVER_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});