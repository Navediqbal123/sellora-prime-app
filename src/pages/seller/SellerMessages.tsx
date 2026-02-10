import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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
  Search,
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
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      setLoading(true);
      const { data: allMessages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) { console.error('Messages fetch error:', error); setLoading(false); return; }

      const productIds = [...new Set((allMessages || []).map((m: any) => m.product_id).filter(Boolean))];
      let productMap: Record<string, string> = {};
      if (productIds.length > 0) {
        const { data: products } = await supabase.from('products').select('id, title').in('id', productIds);
        (products || []).forEach((p: any) => { productMap[p.id] = p.title; });
      }

      const convMap = new Map<string, Conversation>();
      const peerIds = new Set<string>();
      (allMessages || []).forEach((msg: any) => {
        const peerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const key = `${peerId}_${msg.product_id}`;
        peerIds.add(peerId);
        if (!convMap.has(key)) {
          convMap.set(key, { peerId, peerName: '', peerEmail: '', productId: msg.product_id, productTitle: productMap[msg.product_id] || 'Unknown Product', lastMessage: msg.content, lastTime: msg.created_at, unread: msg.receiver_id === user.id && !msg.is_read ? 1 : 0 });
        } else {
          const conv = convMap.get(key)!;
          if (msg.receiver_id === user.id && !msg.is_read) conv.unread++;
        }
      });

      if (peerIds.size > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', [...peerIds]);
        const profileMap = new Map<string, { name: string; email: string }>();
        (profiles || []).forEach((p: any) => { profileMap.set(p.id, { name: p.full_name || '', email: p.email || '' }); });
        convMap.forEach((conv) => { const profile = profileMap.get(conv.peerId); if (profile) { conv.peerName = profile.name; conv.peerEmail = profile.email; } });
      }

      setConversations([...convMap.values()]);
      setLoading(false);
    };
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (!selectedConv || !user) return;
    const fetchChat = async () => {
      setChatLoading(true);
      const { data, error } = await supabase
        .from('messages').select('*').eq('product_id', selectedConv.productId)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedConv.peerId}),and(sender_id.eq.${selectedConv.peerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setMessages(data);
        await supabase.from('messages').update({ is_read: true }).eq('receiver_id', user.id).eq('sender_id', selectedConv.peerId).eq('product_id', selectedConv.productId).eq('is_read', false);
      }
      setChatLoading(false);
    };
    fetchChat();

    const channel = supabase
      .channel(`seller-chat-${selectedConv.productId}-${selectedConv.peerId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `product_id=eq.${selectedConv.productId}` }, (payload) => {
        const msg = payload.new as ChatMsg;
        if ((msg.sender_id === user.id && msg.receiver_id === selectedConv.peerId) || (msg.sender_id === selectedConv.peerId && msg.receiver_id === user.id)) {
          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv, user]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !selectedConv || sending) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({ sender_id: user.id, receiver_id: selectedConv.peerId, product_id: selectedConv.productId, content, is_read: false });
      if (error) throw error;
    } catch { setNewMessage(content); } finally { setSending(false); }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const y = new Date(today); y.setDate(y.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };
  const formatRelative = (dateStr: string) => {
    const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    return new Date(dateStr).toLocaleDateString();
  };

  const groupedMessages: { date: string; msgs: ChatMsg[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = formatDate(msg.created_at);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateKey) last.msgs.push(msg);
    else groupedMessages.push({ date: dateKey, msgs: [msg] });
  });

  const filteredConvs = conversations.filter((c) =>
    !searchQuery || c.peerName.toLowerCase().includes(searchQuery.toLowerCase()) || c.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-80 border-r border-border/50 p-4 space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-fade-in">
      {/* Conversation List - Left Panel */}
      <div className={`${selectedConv ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-border/50 bg-card/30`}>
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-3">
            <span className="text-gradient">Messages</span>
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 h-9 bg-secondary/50 border-border/50 text-sm"
            />
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 animate-float">
                <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">No messages yet</h3>
              <p className="text-sm text-muted-foreground">Messages from buyers will appear here</p>
            </div>
          ) : (
            filteredConvs.map((conv, i) => (
              <button
                key={`${conv.peerId}_${conv.productId}`}
                onClick={() => setSelectedConv(conv)}
                className={`w-full p-4 flex items-center gap-3 text-left border-b border-border/30
                           hover:bg-white/[0.03] transition-all duration-200
                           ${selectedConv?.peerId === conv.peerId && selectedConv?.productId === conv.productId ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {conv.peerName || conv.peerEmail || 'Buyer'}
                    </h3>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatRelative(conv.lastTime)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                    <Package className="w-3 h-3 flex-shrink-0" /> {conv.productTitle}
                  </p>
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 flex-shrink-0 min-w-[20px] justify-center">
                    {conv.unread}
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area - Right Panel (Full-screen on mobile) */}
      <div className={`${selectedConv ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-background`}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-border/50 bg-card/50 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSelectedConv(null); setMessages([]); }}
                className="rounded-xl hover:bg-white/5 md:hidden"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setSelectedConv(null); setMessages([]); }}
                className="rounded-xl hover:bg-white/5 hidden md:flex"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate text-sm">
                  {selectedConv.peerName || selectedConv.peerEmail || 'Buyer'}
                </h3>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                  <Package className="w-3 h-3" /> {selectedConv.productTitle}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-gradient-to-b from-background to-card/20">
              {chatLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">Start the conversation</p>
                </div>
              ) : (
                groupedMessages.map((group) => (
                  <div key={group.date} className="space-y-3">
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-border/30" />
                      <span className="text-[10px] text-muted-foreground/50 px-3 py-1 rounded-full bg-card/50 border border-border/30">{group.date}</span>
                      <div className="flex-1 h-px bg-border/30" />
                    </div>
                    {group.msgs.map((msg) => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                            ${isMine
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-card border border-border/50 text-foreground rounded-bl-md'
                            }`}>
                            <p className="break-words">{msg.content}</p>
                            <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-primary-foreground/50' : 'text-muted-foreground/50'}`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border/50 bg-card/30">
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message..."
                  className="flex-1 h-11 bg-secondary/50 border-border/50 rounded-xl"
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
          </>
        ) : (
          /* Empty state when no conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
              <MessageCircle className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Sellora Messages</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Select a conversation from the left to start messaging with your buyers
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerMessages;
