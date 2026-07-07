import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';

const initialMessages = [
  { _id: 'm1', sender: 'TechHub Enterprise', text: 'Hello! We reviewed your 96% AI similarity score. Are you available to begin Phase 1 this week?', timestamp: '10:15 AM' },
  { _id: 'm2', sender: 'You', text: 'Yes, absolutely! My availability window is fully open, and I can initiate the repository architecture today.', timestamp: '10:17 AM' },
];

const ChatRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      _id: Date.now().toString(),
      sender: 'You',
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          _id: (Date.now() + 1).toString(),
          sender: 'TechHub Enterprise',
          text: 'Sounds great! Please submit your formal milestones via the proposal tab or initiate escrow.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-premium-light py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
        
        <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Encrypted Socket.IO Room</span>
            </div>
            <h1 className="text-2xl font-black text-premium-dark mt-0.5">Negotiation Channel: {roomId || 'Active Project'}</h1>
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>

        <GlassCard className="h-[480px] !p-6 flex flex-col justify-between border-gray-200/80 shadow-md">
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[400px]">
            {messages.map((msg) => {
              const isMe = msg.sender === 'You';
              return (
                <div key={msg._id} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                  <span className="text-[10px] font-bold text-gray-400 mb-1">{msg.sender} • {msg.timestamp}</span>
                  <div className={`p-4 rounded-2xl text-xs font-medium shadow-xs leading-relaxed ${
                    isMe ? 'bg-black text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200/60'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="self-start text-xs font-bold text-gray-400 italic animate-pulse pl-2">
                TechHub Enterprise is typing...
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
            <input
              type="text"
              placeholder="Type your message or negotiate deliverable scope..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none focus:border-black transition-all"
            />
            <Button type="submit" variant="primary" size="md">
              Send ↗
            </Button>
          </form>
        </GlassCard>

      </div>
    </div>
  );
};

export default ChatRoomPage;