import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    CheckCheck,
    Loader2,
    GitBranch,
    FlaskConical,
    AlertTriangle,
    Calendar,
    UserCheck,
    Shield,
    Info,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';
import { apiUrl } from '@/shared/api/authApi';
import { notificationsApi, AppNotification } from '@/shared/api/notificationApi';

function timeAgo(iso: string) {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'Just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

function getNotificationTypeConfig(type?: AppNotification['type']) {
    switch (type) {
        case 'referral':
            return {
                icon: GitBranch,
                iconClass: 'text-indigo-600',
                bgClass: 'bg-indigo-50 border-indigo-200',
                badgeText: 'Referral',
            };
        case 'lab_result':
            return {
                icon: FlaskConical,
                iconClass: 'text-emerald-600',
                bgClass: 'bg-emerald-50 border-emerald-200',
                badgeText: 'Lab Result',
            };
        case 'critical_alert':
            return {
                icon: AlertTriangle,
                iconClass: 'text-rose-600',
                bgClass: 'bg-rose-50 border-rose-200',
                badgeText: 'Critical Alert',
            };
        case 'appointment':
            return {
                icon: Calendar,
                iconClass: 'text-sky-600',
                bgClass: 'bg-sky-50 border-sky-200',
                badgeText: 'Appointment',
            };
        case 'team_invite_accepted':
            return {
                icon: UserCheck,
                iconClass: 'text-teal-600',
                bgClass: 'bg-teal-50 border-teal-200',
                badgeText: 'Team',
            };
        case 'consent_request':
            return {
                icon: Shield,
                iconClass: 'text-purple-600',
                bgClass: 'bg-purple-50 border-purple-200',
                badgeText: 'Consent',
            };
        default:
            return {
                icon: Info,
                iconClass: 'text-slate-600',
                bgClass: 'bg-slate-50 border-slate-200',
                badgeText: 'System',
            };
    }
}

export function NotificationBell() {
    const navigate = useNavigate();
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [items, setItems] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Poll unread count periodically as a baseline
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

    // Real-time socket connection for immediate push updates
    useEffect(() => {
        const token = Cookies.get('accessToken');
        if (!token) return;

        const serverUrl = import.meta.env.VITE_API_URL || apiUrl || 'https://wellirecord.onrender.com';
        let socket: Socket | null = null;

        try {
            socket = io(serverUrl, {
                auth: { token },
                transports: ['websocket', 'polling'],
            });

            const handleNewNotification = (notification?: AppNotification) => {
                setUnreadCount(prev => prev + 1);
                if (notification && notification._id) {
                    setItems(prev => [notification, ...prev.filter(i => i._id !== notification._id)]);
                } else {
                    notificationsApi.list(1, 20)
                        .then(res => {
                            setItems(res.items);
                            setUnreadCount(res.unreadCount);
                        })
                        .catch(() => {});
                }
            };

            socket.on('notification', handleNewNotification);
            socket.on('notification:new', handleNewNotification);
            socket.on('referral_change', handleNewNotification);
            socket.on('referral:created', handleNewNotification);
            socket.on('referral:status_updated', handleNewNotification);
        } catch (err) {
            console.warn('Socket connection error in NotificationBell:', err);
        }

        return () => {
            if (socket) {
                socket.off('notification');
                socket.off('notification:new');
                socket.off('referral_change');
                socket.off('referral:created');
                socket.off('referral:status_updated');
                socket.disconnect();
            }
        };
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
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 relative transition-colors"
                aria-label="View notifications"
            >
                <Bell size={18} className="text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 z-50 w-84 max-h-[30rem] overflow-y-auto rounded-2xl shadow-2xl bg-white border border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-800">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
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
                        items.map((n) => {
                            const config = getNotificationTypeConfig(n.type);
                            const IconComponent = config.icon;
                            return (
                                <button
                                    key={n._id}
                                    onClick={() => handleItemClick(n)}
                                    className="w-full text-left px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors flex gap-3 items-start"
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${config.bgClass}`}>
                                        <IconComponent size={15} className={config.iconClass} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className={`text-xs font-bold truncate ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {n.title}
                                            </p>
                                            {!n.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-[#2F915C] flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                                                {config.badgeText}
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
