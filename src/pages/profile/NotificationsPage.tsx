import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Bell, Package, Tag, MessageCircle, Info, CheckCheck } from 'lucide-react';

const INK = '#111111';
const MUTED = '#6B7280';
const PURPLE = '#7C3AED';

interface Notification {
  id: string;
  user_id: string;
  type?: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const iconFor = (type?: string) => {
  switch (type) {
    case 'order': return Package;
    case 'offer': return Tag;
    case 'message': return MessageCircle;
    case 'info': return Info;
    default: return Bell;
  }
};

const timeAgo = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.id) { setLoading(false); return; }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as Notification[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const markRead = async (id: string) => {
    const n = items.find((x) => x.id === id);
    if (!n || n.is_read) return;
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, is_read: true } : x)));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const markAllRead = async () => {
    if (!user?.id) return;
    if (items.every((n) => n.is_read)) return;
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-2xl mx-auto px-5 pt-5 pb-16">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-10 h-10 -ml-1.5 rounded-full flex items-center justify-center transition-transform active:scale-90"
          >
            <ArrowLeft size={22} strokeWidth={2} style={{ color: INK }} />
          </button>
          <h1 className="flex-1 text-center text-[20px] font-bold tracking-tight" style={{ color: INK }}>
            Notifications
          </h1>
          <div className="w-10 flex justify-end">
            {unreadCount > 0 && (
              <button onClick={markAllRead} aria-label="Mark all as read" className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform">
                <CheckCheck size={19} strokeWidth={1.9} style={{ color: PURPLE }} />
              </button>
            )}
          </div>
        </div>

        {loading ? null : items.length === 0 ? (
          /* Premium empty state */
          <div className="flex flex-col items-center justify-center text-center pt-24 animate-fade-in-up">
            <div
              className="relative w-[168px] h-[168px] rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#F5F0FF' }}
            >
              <Bell size={68} strokeWidth={1.3} style={{ color: '#A78BFA' }} />
              <span
                className="absolute top-[42px] right-[46px] w-4 h-4 rounded-full"
                style={{ backgroundColor: PURPLE, border: '3px solid #F5F0FF' }}
              />
            </div>
            <h2 className="mt-8 text-[22px] font-bold tracking-tight" style={{ color: INK }}>
              You're all caught up!
            </h2>
            <p className="mt-2 text-[14.5px] leading-relaxed max-w-[260px]" style={{ color: MUTED }}>
              When something new arrives, you'll see it here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-8 h-[52px] w-[190px] rounded-[18px] text-[15px] font-semibold text-white transition-transform active:scale-95"
              style={{ backgroundColor: PURPLE, boxShadow: '0 14px 30px -14px rgba(124,58,237,0.7)' }}
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {items.map((n) => {
              const Icon = iconFor(n.type);
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="w-full text-left relative rounded-[18px] p-4 flex gap-3 transition-transform active:scale-[0.99]"
                  style={{
                    backgroundColor: n.is_read ? '#FFFFFF' : '#FAF7FF',
                    border: `1px solid ${n.is_read ? '#E5E7EB' : '#E4D8FB'}`,
                    boxShadow: '0 1px 2px rgba(15,15,25,0.03)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: n.is_read ? '#F7F7F8' : '#F0E9FE' }}
                  >
                    <Icon size={19} strokeWidth={1.9} style={{ color: n.is_read ? INK : PURPLE }} />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[14px] font-semibold leading-snug" style={{ color: INK }}>{n.title}</p>
                    <p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: MUTED }}>{n.message}</p>
                    <p className="text-[11px] mt-2" style={{ color: '#9CA3AF' }}>{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PURPLE }} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
