import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../utils/socket';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

const ChatRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const messagesEndRef = useRef(null);

  const storedUser = localStorage.getItem('userInfo');
  const user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : { name: 'Guest' };

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.emit('joinRoom', { roomId: roomId || 'general' });

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };
    
    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receiveMessage', handleReceiveMessage);
      socket.emit('leaveRoom', { roomId: roomId || 'general' });
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      roomId: roomId || 'general',
      sender: user.name,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit('sendMessage', messageData);
    
    setMessages((prev) => [...prev, messageData]);
    setNewMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-4 h-[80vh]">
        
        {/* Workspace Header */}
        <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Encrypted Channel</span>
            <h1 className="text-2xl font-black text-premium-dark mt-0.5">Workspace: {roomId || 'General'}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
              isConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {isConnected ? 'Live Socket Connected' : 'Connecting...'}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← Back</Button>
          </div>
        </div>

        {/* Chat Interface */}
        <GlassCard className="flex-1 flex flex-col !p-0 overflow-hidden border-gray-200/80 shadow-sm">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400">
                End-to-End Encrypted. Send a message to initiate collaboration.
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMine = msg.sender === user.name;
                return (
                  <div key={index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-bold text-gray-400 mb-1 px-1">{msg.sender}</span>
                    <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
                      isMine ? 'bg-black text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-black rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-black transition-colors"
            />
            <Button type="submit" variant="primary" size="md" disabled={!isConnected || !newMessage.trim()}>
              Send
            </Button>
          </form>

        </GlassCard>
      </div>
    </div>
  );
};

export default ChatRoomPage;