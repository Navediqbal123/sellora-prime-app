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
      className="relative w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-90"
      style={{ backgroundColor: '#F7F7F8', border: '1px solid #EDEDF1' }}
    >
      <Bell size={20} strokeWidth={1.9} style={{ color: '#111111' }} />
      {unread > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
          style={{ backgroundColor: '#7C3AED', border: '2px solid #FFFFFF' }}
        >
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
