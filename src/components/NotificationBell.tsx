import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
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

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  const loadUnread = async () => {
    if (!user?.id) {
      setUnread(0);
      return;
    }
    const { data } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_read', false);
    setUnread(data?.length || 0);
  };

  useEffect(() => {
    loadUnread();
    if (!user?.id) return;
    const channel = supabase
      .channel(`notifications-unread:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => loadUnread(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <button
      onClick={() => navigate('/profile/notifications')}
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
  );
};

export default NotificationBell;
