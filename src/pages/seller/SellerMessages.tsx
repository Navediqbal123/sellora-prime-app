import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  Loader2,
  Package,
  ArrowLeft,
  User,
} from 'lucide-react';

interface Conversation {
  peerId: string;
  peerName: string;
  peerEmail: string;
  productId: string;
  productTitle: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

interface ChatMsg {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const SellerMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setLoading(true);

      const { data: allMessages, error } = await supabase
        .from('messages')
        .select('*, product:products(title)')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: 'Error', description: 'Failed to load messages', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Group by peer + product
      const convMap = new Map<string, Conversation>();
      const peerIds = new Set<string>();

      (allMessages || []).forEach((msg: any) => {
        const peerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${peerId}_${msg.product_id}`;
        peerIds.add(peerId);

        if (!convMap.has(key)) {
          convMap.set(key, {
            peerId,
            peerName: '',
            peerEmail: '',
            productId: msg.product_id,
            productTitle: msg.product?.title || 'Unknown Product',
            lastMessage: msg.content,
            lastTime: msg.created_at,
            unread: msg.receiver_id === user.id && !msg.is_read ? 1 : 0,
          });
        } else {
          const conv = convMap.get(key)!;
          if (msg.receiver_id === user.id && !msg.is_read) {
            conv.unread++;
          }
        }
      });

      // Fetch peer profiles
      if (peerIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', [...peerIds]);

        const profileMap = new Map<string, { name: string; email: string }>();
        (profiles || []).forEach((p: any) => {
          profileMap.set(p.id, { name: p.full_name || '', email: p.email || '' });
        });

        convMap.forEach((conv) => {
          const profile = profileMap.get(conv.peerId);
          if (profile) {
            conv.peerName = profile.name;
            conv.peerEmail = profile.email;
          }
        });
      }

      setConversations([...convMap.values()]);
      setLoading(false);
    };

    fetchConversations();
  }, [user]);

  // Fetch chat messages for selected conversation
  useEffect(() => {
    if (!selectedConv || !user) return;

    const fetchChat = async () => {
      setChatLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('product_id', selectedConv.productId)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedConv.peerId}),and(sender_id.eq.${selectedConv.peerId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);

        // Mark messages as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('receiver_id', user.id)
          .eq('sender_id', selectedConv.peerId)
          .eq('product_id', selectedConv.productId)
          .eq('is_read', false);
      }
      setChatLoading(false);
    };

    fetchChat();

    // Realtime
    const channel = supabase
      .channel(`seller-chat-${selectedConv.productId}-${selectedConv.peerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `product_id=eq.${selectedConv.productId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMsg;
          if (
            (msg.sender_id === user.id && msg.receiver_id === selectedConv.peerId) ||
            (msg.sender_id === selectedConv.peerId && msg.receiver_id === user.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !selectedConv || sending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedConv.peerId,
        product_id: selectedConv.productId,
        content,
        is_read: false,
      });

      if (error) throw error;
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to send', variant: 'destructive' });
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatRelative = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Chat view
  if (selectedConv) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] animate-fade-in">
        {/* Chat Header */}
        <div className="p-4 border-b border-border/50 bg-card/50 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedConv(null);
              setMessages([]);
            }}
            className="rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {selectedConv.peerName || selectedConv.peerEmail || 'Buyer'}
            </h3>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <Package className="w-3 h-3" /> {selectedConv.productTitle}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {chatLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <MessageCircle className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No messages in this conversation</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
                      ${isMine
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-secondary text-foreground rounded-bl-md'
                      }`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine ? 'text-primary-foreground/60' : 'text-muted-foreground/60'
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-card/30">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a reply..."
              className="flex-1 h-11 bg-secondary/50 border-border/50"
              disabled={sending}
            />
            <Button
              size="icon"
              className="h-11 w-11 rounded-xl btn-glow flex-shrink-0"
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-foreground">
          <span className="text-gradient">Messages</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6 animate-float">
            <MessageCircle className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No messages yet</h3>
          <p className="text-muted-foreground">Messages from buyers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv, i) => (
            <button
              key={`${conv.peerId}_${conv.productId}`}
              onClick={() => setSelectedConv(conv)}
              className="w-full card-premium p-4 flex items-center gap-4 text-left hover:border-primary/20 
                         transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {conv.peerName || conv.peerEmail || 'Buyer'}
                  </h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatRelative(conv.lastTime)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Package className="w-3 h-3" /> {conv.productTitle}
                </p>
                <p className="text-sm text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
              </div>

              {conv.unread > 0 && (
                <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 flex-shrink-0">
                  {conv.unread}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerMessages;
