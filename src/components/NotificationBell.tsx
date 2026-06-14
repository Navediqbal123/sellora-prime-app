import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const timeAgo = (iso: string) => {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user?.id) {
      setItems([]);
      return;
    }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    setItems((data as Notification[]) || []);
  };

  useEffect(() => {
    load();
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const unread = items.filter((n) => !n.is_read).length;

  const markRead = async (n: Notification) => {
    if (n.is_read) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
  };

  const markAllRead = async () => {
    if (!user?.id || unread === 0) return;
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) load(); }}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-card to-secondary/60 border border-border/60 flex items-center justify-center hover:border-primary/50 hover:scale-105 active:scale-95 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <Bell className="w-[18px] h-[18px] text-foreground" strokeWidth={2.25} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_hsl(var(--destructive))]">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[92vw] max-w-sm p-0 bg-card border-border/60 shadow-2xl rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <div>
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <p className="text-[11px] text-muted-foreground">
              {unread > 0 ? `${unread} unread` : 'All caught up'}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all
            </button>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {!user ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Sign in to view notifications</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet</div>
          ) : (
            <ul className="divide-y divide-border/40">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 flex gap-3 transition-colors ${
                    !n.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      !n.is_read ? 'bg-primary' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm truncate ${
                          !n.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n)}
                        className="mt-1.5 text-[11px] font-medium text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark as read
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;