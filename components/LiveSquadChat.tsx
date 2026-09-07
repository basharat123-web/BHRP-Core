'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage, Organization, Member } from '@/lib/types';
import { MessageSquare, Search, Send, Radio, Shield, Users, Crown, ChevronRight, Megaphone, AlertCircle } from 'lucide-react';
import { supabase, fetchChatMessages, sendChatMessage, sendNotification } from '@/lib/supabase';

interface LiveSquadChatProps {
  userProfile: UserProfile;
  organizations?: Organization[];
  members?: Member[];
}

export const LiveSquadChat: React.FC<LiveSquadChatProps> = ({ userProfile, organizations = [], members = [] }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'announcement' | 'family' | 'direct'>('global');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  
  // Direct Message State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [allProfiles, setAllProfiles] = useState<any[]>([]); // Store necessary profile info
  
  // Real-time Chat Channel
  const chatChannelRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isRootAdmin = userProfile.email?.toLowerCase() === 'basharat81253@gmail.com' || userProfile.isRootAdmin;
  const canAccessFamily = Boolean(userProfile.currentFamilyId) || isRootAdmin;
  
  const currentFamilyId = isRootAdmin ? organizations[0]?.id : userProfile.currentFamilyId; // Mock default family for Root

  // Load Messages & Subscribe to Realtime
  useEffect(() => {
    const loadMessages = async () => {
      const dbMsgs = await fetchChatMessages(
        activeTab,
        activeTab === 'family' ? currentFamilyId : undefined,
        activeTab === 'direct' ? selectedRecipientId || undefined : undefined,
        userProfile.id
      );
      setMessages(dbMsgs);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      
      // Load profiles for Direct Messaging or if Root Admin needs member list
      if ((activeTab === 'direct' || isRootAdmin) && allProfiles.length === 0 && supabase) {
        const { data } = await supabase.from('profiles').select('id, full_name, ingame_id, account_type, is_root_admin');
        if (data) {
          setAllProfiles(data.map((d: any) => ({
            id: d.id,
            fullName: d.full_name,
            ingameId: d.ingame_id,
            accountType: d.account_type,
            isRootAdmin: d.is_root_admin
          })));
        }
      }
    };
    
    loadMessages();

    if (!supabase) return;

    if (chatChannelRef.current) {
      supabase.removeChannel(chatChannelRef.current);
    }

    let filter = `message_type=eq.${activeTab}`;
    if (activeTab === 'family' && currentFamilyId) {
      filter += `&family_id=eq.${currentFamilyId}`;
    }

    const channel = supabase
      .channel(`live-chat-${activeTab}-${userProfile.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload: any) => {
          console.log('[BHRP] Realtime message received:', payload.new);
          const newMsg = payload.new;
          // Skip own messages — already shown via optimistic update
          if (newMsg.user_id === userProfile.id) return;
          // Filter dynamically based on current tab state
          if (newMsg.message_type !== activeTab) return;
          if (activeTab === 'family' && newMsg.family_id !== currentFamilyId) return;
          if (activeTab === 'direct') {
             if (!(newMsg.user_id === userProfile.id || newMsg.recipient_id === userProfile.id)) return;
             if (selectedRecipientId && !(newMsg.user_id === selectedRecipientId || newMsg.recipient_id === selectedRecipientId)) return;
          }

          const formattedCreatedAt = new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          setMessages((prev) => {
            const isDuplicate = prev.some((msg) =>
              msg.id === newMsg.id ||
              (
                msg.userId === newMsg.user_id &&
                msg.text === newMsg.text &&
                msg.senderName === newMsg.sender_name &&
                msg.messageType === newMsg.message_type &&
                msg.familyId === newMsg.family_id &&
                msg.recipientId === newMsg.recipient_id &&
                msg.createdAt === formattedCreatedAt
              )
            );

            if (isDuplicate) return prev;

            return [...prev, {
              id: newMsg.id,
              userId: newMsg.user_id,
              senderName: newMsg.sender_name,
              senderRank: newMsg.sender_rank,
              ingameId: newMsg.ingame_id,
              avatarUrl: newMsg.avatar_url,
              text: newMsg.text,
              messageType: newMsg.message_type,
              familyId: newMsg.family_id,
              recipientId: newMsg.recipient_id,
              createdAt: formattedCreatedAt,
            }];
          });
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      )
      .subscribe((status: string, err?: Error) => {
        console.log('[BHRP] Realtime subscription status:', status, err || '');
      });

    chatChannelRef.current = channel;

    return () => {
      if (supabase && chatChannelRef.current) supabase.removeChannel(chatChannelRef.current);
    };
  }, [activeTab, currentFamilyId, selectedRecipientId, userProfile.id]);

  // Set default recipient to Root Admin for normal members in Direct Chat
  useEffect(() => {
    if (activeTab === 'direct' && !isRootAdmin && !selectedRecipientId && allProfiles.length > 0) {
      const root = allProfiles.find(p => p.isRootAdmin || p.accountType === 'Root Admin');
      if (root) setSelectedRecipientId(root.id);
    }
  }, [activeTab, isRootAdmin, allProfiles, selectedRecipientId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Guard: Only Root Admin can post in Announcement
    if (activeTab === 'announcement' && !isRootAdmin) return;

    const textPayload = inputText.trim();
    setInputText('');
    setSendError(null);
    
    if (activeTab === 'direct' && !selectedRecipientId) {
       alert("Please select a recipient first.");
       return;
    }

    // Optimistic UI Update
    const tempMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: userProfile.id,
      senderName: userProfile.fullName,
      senderRank: isRootAdmin ? 'Root Admin' : userProfile.accountType,
      ingameId: userProfile.ingameId,
      avatarUrl: userProfile.avatarUrl,
      text: textPayload,
      messageType: activeTab,
      familyId: activeTab === 'family' ? currentFamilyId : undefined,
      recipientId: activeTab === 'direct' ? selectedRecipientId || undefined : undefined,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    // Save to DB
    const saved = await sendChatMessage(
      userProfile.id,
      userProfile.fullName,
      isRootAdmin ? 'Root Admin' : userProfile.accountType,
      userProfile.ingameId,
      userProfile.avatarUrl,
      textPayload,
      activeTab,
      activeTab === 'family' ? currentFamilyId : undefined,
      activeTab === 'direct' ? selectedRecipientId || undefined : undefined
    );

    if (!saved) {
      setSendError('Message send failed. Check console for DB error details.');
      // Remove optimistic message since it failed
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      return;
    }

    setMessages((prev) => prev.map((msg) =>
      msg.id === tempMsg.id
        ? {
            ...msg,
            id: saved.id,
            createdAt: new Date(saved.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : msg
    ));

    // Trigger Notification for Direct Messages
    if (activeTab === 'direct' && selectedRecipientId && isRootAdmin) {
      await sendNotification(
        selectedRecipientId,
        'Root Command Directive',
        `Supreme Root Admin sent you a secure dispatch: "${textPayload.substring(0, 30)}..."`
      );
    }
  };

  const filteredMembers = allProfiles.filter(m => m.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeRecipient = allProfiles.find(p => p.id === selectedRecipientId);

  return (
    <div className="flex h-[700px] rounded-xl overflow-hidden border border-[#2A3942] bg-[#111B21]">
      
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-[#1F2C34] border-r border-[#2A3942] flex flex-col">
        <div className="px-4 py-3 border-b border-[#2A3942]">
          <p className="text-[#E9EDEF] font-semibold text-sm">Comms Network</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[{ id: 'global', label: 'Global Broadcast', Icon: MessageSquare },
            { id: 'announcement', label: 'Announcements', Icon: Megaphone },
            ...(canAccessFamily ? [{ id: 'family', label: 'Family Tactical', Icon: Users }] : []),
            { id: 'direct', label: 'Direct Dispatches', Icon: Shield },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                activeTab === id
                  ? 'bg-[#2A3942] text-[#E9EDEF]'
                  : 'text-[#8696A0] hover:bg-[#2A3942]/60 hover:text-[#E9EDEF]'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                activeTab === id ? 'bg-[#00A884]' : 'bg-[#2A3942]'
              }`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{label}</p>
                {activeTab === id && (
                  <p className="text-[11px] text-[#8696A0] truncate">Active</p>
                )}
              </div>
              {activeTab === id && <div className="ml-auto w-1 h-8 rounded-full bg-[#00A884]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1F2C34] border-b border-[#2A3942]">
          <div className="w-9 h-9 rounded-full bg-[#2A3942] flex items-center justify-center">
            {activeTab === 'global' && <MessageSquare className="w-4 h-4 text-[#8696A0]" />}
            {activeTab === 'announcement' && <Megaphone className="w-4 h-4 text-[#8696A0]" />}
            {activeTab === 'family' && <Users className="w-4 h-4 text-[#8696A0]" />}
            {activeTab === 'direct' && <Shield className="w-4 h-4 text-[#8696A0]" />}
          </div>
          <div>
            <p className="text-[#E9EDEF] text-sm font-semibold">
              {activeTab === 'global' && 'Global Broadcast'}
              {activeTab === 'announcement' && 'Announcements'}
              {activeTab === 'family' && 'Family Tactical'}
              {activeTab === 'direct' && (activeRecipient ? `${activeRecipient.fullName}` : 'Direct Dispatches')}
            </p>
            <p className="text-[#8696A0] text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A884] inline-block" /> Live
            </p>
          </div>
        </div>

        {/* Error */}
        {sendError && (
          <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-red-900/30 border border-red-800/50 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{sendError}</span>
            <button onClick={() => setSendError(null)} className="ml-auto">?</button>
          </div>
        )}

        {/* Content */}
        {activeTab === 'direct' && isRootAdmin ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Contact list */}
            <div className="w-56 flex-shrink-0 border-r border-[#2A3942] flex flex-col">
              <div className="px-3 py-2">
                <div className="flex items-center bg-[#2A3942] rounded-lg px-3 py-1.5 gap-2">
                  <Search className="w-3.5 h-3.5 text-[#8696A0]" />
                  <input
                    type="text" placeholder="Search..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent text-[#E9EDEF] text-xs outline-none w-full placeholder:text-[#8696A0]"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredMembers.map((m: any) => (
                  <button key={m.id} onClick={() => setSelectedRecipientId(m.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      selectedRecipientId === m.id ? 'bg-[#2A3942]' : 'hover:bg-[#2A3942]/50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2A3942] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-[#8696A0]">{m.fullName[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#E9EDEF] text-xs font-medium truncate">{m.fullName}</p>
                      <p className="text-[#8696A0] text-[10px]">{m.ingameId}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {/* DM window */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1F2C34 1px, transparent 0)', backgroundSize: '20px 20px' }}>
                {messages.length === 0 && <p className="text-[#8696A0] text-xs text-center mt-10">Select a contact to start a conversation.</p>}
                {messages.map(msg => <ChatBubble key={msg.id} msg={msg} isMe={msg.userId === userProfile.id} />)}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-3 py-2 bg-[#1F2C34] border-t border-[#2A3942]">
                <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                  placeholder={selectedRecipientId ? 'Type a message' : 'Select a contact first...'}
                  disabled={!selectedRecipientId}
                  className="flex-1 bg-[#2A3942] text-[#E9EDEF] placeholder:text-[#8696A0] rounded-lg px-3 py-2 text-sm outline-none disabled:opacity-40"
                />
                <button type="submit" disabled={!selectedRecipientId} className="w-9 h-9 rounded-full bg-[#00A884] flex items-center justify-center disabled:opacity-40 hover:bg-[#06CF9C] flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-1" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1F2C34 1px, transparent 0)', backgroundSize: '20px 20px' }}>
              {messages.length === 0 && <p className="text-[#8696A0] text-xs text-center mt-10">No messages yet.</p>}
              {messages.map(msg => <ChatBubble key={msg.id} msg={msg} isMe={msg.userId === userProfile.id} isAnnouncement={activeTab === 'announcement'} />)}
              <div ref={chatEndRef} />
            </div>

            {!(activeTab === 'announcement' && !isRootAdmin) && (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-3 py-2 bg-[#1F2C34] border-t border-[#2A3942]">
                <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                  placeholder={activeTab === 'announcement' ? 'Write an announcement...' : 'Type a message'}
                  className="flex-1 bg-[#2A3942] text-[#E9EDEF] placeholder:text-[#8696A0] rounded-lg px-3 py-2 text-sm outline-none"
                />
                <button type="submit" className="w-9 h-9 rounded-full bg-[#00A884] flex items-center justify-center hover:bg-[#06CF9C] flex-shrink-0">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// WhatsApp-style chat bubble
const ChatBubble = ({ msg, isMe, isAnnouncement = false }: { msg: ChatMessage, isMe: boolean, isAnnouncement?: boolean }) => {
  const isRootMsg = msg.senderRank === 'Root Admin';
  const isLeader = msg.senderRank === 'Family Leader' || msg.senderRank === 'Leader';

  return (
    <div className={`flex items-end gap-2 ${isMe && !isAnnouncement ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <img
        src={msg.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
        alt={msg.senderName}
        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
      />

      <div className={`max-w-[72%] ${isMe && !isAnnouncement ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {/* Sender info */}
        {(!isMe || isAnnouncement) && (
          <div className="flex items-center gap-1.5 px-1">
            <span className={`text-[11px] font-semibold ${
              isRootMsg ? 'text-[#00A884]' : isLeader ? 'text-[#00A884]' : 'text-[#8696A0]'
            }`}>{msg.senderName}</span>
            <span className="text-[10px] text-[#8696A0] bg-[#2A3942] px-1.5 py-0.5 rounded">{msg.senderRank}</span>
          </div>
        )}

        {/* Bubble */}
        <div className={`px-3 py-2 rounded-lg text-sm leading-relaxed relative ${
          isAnnouncement
            ? 'bg-[#2A3942] border-l-2 border-[#00A884] text-[#E9EDEF] w-full'
            : isMe
            ? 'bg-[#005C4B] text-[#E9EDEF] rounded-br-sm'
            : 'bg-[#202C33] text-[#E9EDEF] rounded-bl-sm'
        }`}>
          {msg.text}
          <span className="ml-2 text-[10px] text-[#8696A0] float-right mt-1">{msg.createdAt}</span>
        </div>
      </div>
    </div>
  );
};
