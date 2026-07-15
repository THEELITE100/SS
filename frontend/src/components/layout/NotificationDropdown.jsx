import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/apiClient';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      const storedUser = sessionStorage.getItem('userInfo');
      if (!storedUser || storedUser === 'undefined') return;

      try {
        const res = await apiClient.get('/notifications');
        const liveNotifs = res.data || [];
        setNotifications(liveNotifs);
        setUnreadCount(liveNotifs.filter((n) => !n.isRead).length);
      } catch (err) {
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);
    if (!notif.isRead) {
      try {
        await apiClient.put(`/notifications/${notif._id}/read`);
        setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark read');
      }
    }
    if (notif.link) navigate(notif.link);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 rounded-full hover:bg-gray-100 transition-colors relative cursor-pointer text-gray-700"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-fade-in">
          <div className="px-4 pb-3 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-premium-dark">System Alerts</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">Mark all read</span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs font-bold text-gray-400">
                You have no active notifications.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif._id} 
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`text-xs font-bold ${!notif.isRead ? 'text-black' : 'text-gray-600'}`}>{notif.title}</h4>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;