import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { notificationsApi, AppNotification } from '@/shared/api/notificationApi';

function timeAgo(iso: string) {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'Just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

export function NotificationBell() {
    const navigate = useNavigate();
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [items, setItems] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Poll unread count periodically so the badge stays current even
    // without opening the dropdown.
    useEffect(() => {
        const fetchCount = () => {
            notificationsApi.unreadCount()
                .then(setUnreadCount)
                .catch(() => {});
        };
        fetchCount();
        const interval = setInterval(fetchCount, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOpen = () => {
        const next = !open;
        setOpen(next);
        if (next && !loaded) {
            setLoading(true);
            notificationsApi.list(1, 20)
                .then((res) => {
                    setItems(res.items);
                    setUnreadCount(res.unreadCount);
                    setLoaded(true);
                })
                .catch((err) => console.warn('Could not load notifications:', err))
                .finally(() => setLoading(false));
        }
    };

    const handleItemClick = async (n: AppNotification) => {
        if (!n.isRead) {
            try {
                await notificationsApi.markAsRead(n._id);
                setItems(prev => prev.map(i => i._id === n._id ? { ...i, isRead: true } : i));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (err) {
                console.warn('Could not mark notification as read:', err);
            }
        }
        setOpen(false);
        if (n.link) navigate(n.link);
    };

    const markAllRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setItems(prev => prev.map(i => ({ ...i, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.warn('Could not mark all as read:', err);
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={toggleOpen}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 relative"
            >
                <Bell size={18} className="text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-y-auto rounded-2xl shadow-2xl bg-white border border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white">
                        <span className="font-bold text-sm text-gray-800">Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] font-semibold text-[#2F915C] hover:opacity-70">
                                <CheckCheck size={12} /> Mark all read
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="py-10 text-center"><Loader2 size={20} className="mx-auto animate-spin text-gray-400" /></div>
                    ) : items.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">No notifications yet.</div>
                    ) : (
                        items.map((n) => (
                            <button
                                key={n._id}
                                onClick={() => handleItemClick(n)}
                                className="w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex gap-2.5"
                            >
                                {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#2F915C] mt-1.5 flex-shrink-0" />}
                                <div className={n.isRead ? 'ml-4' : ''}>
                                    <p className="text-xs font-bold text-gray-800">{n.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
