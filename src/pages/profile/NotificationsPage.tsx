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
        <div className="space-y-3 animate-fade-in">
          {items.map((n, i) => {
            const Icon = iconFor(n.type);
            return (
              <div
                key={n.id}
                className={`card-premium p-4 flex gap-3 transition-all duration-300 ${
                  !n.is_read
                    ? 'border-primary/40 bg-primary/[0.03]'
                    : ''
                } stagger-${Math.min(i + 1, 5)}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    !n.is_read ? 'bg-primary/15' : 'bg-secondary'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      !n.is_read ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-semibold truncate ${
                        !n.is_read ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">
                    {n.message}
                  </p>
                  {!n.is_read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="mt-2 text-[11px] font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
                    >
                      <Check className="w-3 h-3" /> Mark as read
                    </button>
                  )}
                </div>
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </SubPageShell>
  );
};

export default NotificationsPage;
