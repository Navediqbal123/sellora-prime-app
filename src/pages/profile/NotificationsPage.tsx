import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Bell, Package, Tag, MessageCircle, Info, Check, CheckCheck } from 'lucide-react';
import { SubPageShell, EmptyCard } from './_shared';

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
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.id) return;
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
    const unreadIds = items.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <SubPageShell
      title="Notifications"
      right={
        unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
          </button>
        ) : null
      }
    >
      {loading ? (
        <EmptyCard text="Loading..." />
      ) : items.length === 0 ? (
        <EmptyCard text="No notifications yet." />
      ) : (
        <>
        <div className="space-y-3">
          {items.map((n, i) => {
            const Icon = iconFor(n.type);
            return (
              <div
                key={n.id}
                className="relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(124,58,237,0.35)] opacity-0 animate-[fadeUp_0.5s_cubic-bezier(0.22,1,0.36,1)_forwards]"
                style={{
                  animationDelay: `${i * 70}ms`,
                  background: n.is_read
                    ? 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--secondary)/0.4) 100%)'
                    : 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary)/0.08) 100%)',
                  borderColor: n.is_read
                    ? 'hsl(var(--border)/0.6)'
                    : 'hsl(var(--primary)/0.35)',
                }}
              >
                {!n.is_read && (
                  <span
                    className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"
                    style={{ boxShadow: '0 0 10px 2px rgba(52,211,153,0.7), 0 0 20px 4px rgba(52,211,153,0.35)' }}
                  />
                )}

                <div className="flex gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      !n.is_read ? 'bg-primary/15' : 'bg-secondary'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${!n.is_read ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-sm font-bold text-foreground leading-snug">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-3">
                      {!n.is_read ? (
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-[11px] font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          <Check className="w-3 h-3" /> Mark as read
                        </button>
                      ) : <span />}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }`}</style>
        </>
      )}
    </SubPageShell>
  );
};

export default NotificationsPage;
