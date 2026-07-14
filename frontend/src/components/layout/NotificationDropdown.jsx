// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import apiClient from '../../utils/apiClient';

// const fallbackNotifications = [
//   {
//     _id: 'notif_1',
//     title: 'Escrow Locked in Stripe',
//     message: 'TechHub Noida Enterprise successfully funded ₹50,000 into escrow for Stage 1.',
//     type: 'payment',
//     isRead: false,
//     link: '/dashboard/tracker/gig_1',
//     timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
//   },
//   {
//     _id: 'notif_2',
//     title: 'Proposal Formally Accepted',
//     message: 'Your binding proposal for "Senior React & Tailwind Developer" was approved.',
//     type: 'proposal',
//     isRead: false,
//     link: '/client/proposals',
//     timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
//   },
//   {
//     _id: 'notif_3',
//     title: 'New Hyperlocal Gig Matched',
//     message: 'AI Matching Engine detected a 96% match for a new React job in Noida Sector 62.',
//     type: 'match',
//     isRead: true,
//     link: '/gigs',
//     timestamp: new Date(Date.now() - 1000 * 3600 * 3).toISOString(),
//   },
//   {
//     _id: 'notif_4',
//     title: '5-Star Review Verified',
//     message: 'Vikram Mehta published a verified 5.0★ review on your executive profile.',
//     type: 'review',
//     isRead: true,
//     link: '/freelancer/dashboard',
//     timestamp: new Date(Date.now() - 1000 * 3600 * 8).toISOString(),
//   },
// ];

// const NotificationDropdown = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [notifications, setNotifications] = useState(fallbackNotifications);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();

//   const unreadCount = notifications.filter((n) => !n.isRead).length;

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const res = await apiClient.get('/notifications');
//         if (res.data && res.data.length > 0) {
//           setNotifications(res.data);
//         }
//       } catch (err) {      }
//     };
//     fetchNotifications();

//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleMarkAllRead = async () => {
//     setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
//     try {
//       await apiClient.put('/notifications/mark-read');
//     } catch (err) {    }
//   };

//   const handleNotificationClick = (notif) => {
//     setNotifications((prev) =>
//       prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
//     );
//     setIsOpen(false);
//     if (notif.link) {
//       navigate(notif.link);
//     }
//   };

//   const formatTimeAgo = (dateString) => {
//     const diffMins = Math.floor((Date.now() - new Date(dateString)) / 60000);
//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins}m ago`;
//     const diffHours = Math.floor(diffMins / 60);
//     if (diffHours < 24) return `${diffHours}h ago`;
//     return `${Math.floor(diffHours / 24)}d ago`;
//   };

//   const getTypeBadge = (type) => {
//     switch (type) {
//       case 'payment':
//         return { icon: '💰', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
//       case 'proposal':
//         return { icon: '📋', color: 'bg-blue-50 text-blue-700 border-blue-200' };
//       case 'match':
//         return { icon: '⚡', color: 'bg-violet-50 text-violet-700 border-violet-200' };
//       default:
//         return { icon: '🔔', color: 'bg-gray-100 text-gray-700 border-gray-200' };
//     }
//   };

//   return (
//     <div className="relative inline-block text-left" ref={dropdownRef}>
//       <button
//         type="button"
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative p-2.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-black transition-all cursor-pointer shadow-sm focus:outline-none flex items-center justify-center"
//         aria-label="View Notifications"
//       >
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
//           />
//         </svg>

//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-md animate-pulse">
//             {unreadCount}
//           </span>
//         )}
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200/80 shadow-2xl z-50 animate-fade-in overflow-hidden">
          
//           <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
//             <div className="flex items-center gap-2">
//               <span className="text-sm font-extrabold text-premium-dark">Notifications</span>
//               {unreadCount > 0 && (
//                 <span className="text-[10px] font-extrabold bg-black text-white px-2 py-0.5 rounded-full">
//                   {unreadCount} New
//                 </span>
//               )}
//             </div>

//             {unreadCount > 0 && (
//               <button
//                 type="button"
//                 onClick={handleMarkAllRead}
//                 className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
//               >
//                 Mark all read
//               </button>
//             )}
//           </div>

//           <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
//             {notifications.length === 0 ? (
//               <div className="py-12 text-center text-xs font-medium text-gray-400">
//                 No notifications logged yet.
//               </div>
//             ) : (
//               notifications.map((notif) => {
//                 const badge = getTypeBadge(notif.type);
//                 return (
//                   <div
//                     key={notif._id}
//                     onClick={() => handleNotificationClick(notif)}
//                     className={`p-4 transition-colors cursor-pointer flex gap-3.5 items-start ${
//                       notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
//                     }`}
//                   >
//                     <div className={`w-9 h-9 rounded-2xl border flex items-center justify-center text-sm shrink-0 shadow-xs ${badge.color}`}>
//                       {badge.icon}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center justify-between gap-2">
//                         <h4 className="text-xs font-bold text-premium-dark truncate">
//                           {notif.title}
//                         </h4>
//                         <span className="text-[10px] font-semibold text-gray-400 shrink-0">
//                           {formatTimeAgo(notif.timestamp)}
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-600 leading-relaxed mt-0.5 line-clamp-2">
//                         {notif.message}
//                       </p>
//                     </div>

//                     {!notif.isRead && (
//                       <div className="w-2 h-2 rounded-full bg-blue-600 self-center shrink-0" />
//                     )}
//                   </div>
//                 );
//               })
//             )}
//           </div>

//           <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
//             <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
//               Live Socket.IO Stream Active
//             </span>
//           </div>

//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationDropdown;

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
      // 1. Safe JSON Parse to prevent crash
      const storedUser = localStorage.getItem('userInfo');
      if (!storedUser || storedUser === 'undefined') return;

      try {
        const res = await apiClient.get('/notifications');
        const liveNotifs = res.data || [];
        setNotifications(liveNotifs);
        setUnreadCount(liveNotifs.filter((n) => !n.isRead).length);
      } catch (err) {
        // Silently catch 500 errors to prevent UI crash
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