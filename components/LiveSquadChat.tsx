'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage, Organization, Member, Notification } from '@/lib/types';
import { MessageSquare, Mic, Search, Send, Radio, Shield, Users, Crown, ChevronRight, Video } from 'lucide-react';
import { supabase, fetchChatMessages, sendChatMessage, sendNotification } from '@/lib/supabase';

interface LiveSquadChatProps {
  userProfile: UserProfile;
  organizations?: Organization[];
  members?: Member[];
}

export const LiveSquadChat: React.FC<LiveSquadChatProps> = ({ userProfile, organizations = [], members = [] }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'family' | 'direct'>('global');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Direct Message State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  
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
      
      if (isRootAdmin && activeTab === 'direct' && allProfiles.length === 0 && supabase) {
        const { data } = await supabase.from('profiles').select('id, full_name, ingame_id');
        if (data) {
          setAllProfiles(data.map((d: any) => ({
            id: d.id,
            fullName: d.full_name,
            ingameId: d.ingame_id
          })) as any);
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
          const newMsg = payload.new;
          // Filter dynamically based on current tab state
          if (newMsg.message_type !== activeTab) return;
          if (activeTab === 'family' && newMsg.family_id !== currentFamilyId) return;
          if (activeTab === 'direct') {
             if (!(newMsg.user_id === userProfile.id || newMsg.recipient_id === userProfile.id)) return;
             if (selectedRecipientId && !(newMsg.user_id === selectedRecipientId || newMsg.recipient_id === selectedRecipientId)) return;
          }

          setMessages((prev) => [...prev, {
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
            createdAt: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      )
      .subscribe();

    chatChannelRef.current = channel;

    return () => {
      if (supabase && chatChannelRef.current) supabase.removeChannel(chatChannelRef.current);
    };
  }, [activeTab, currentFamilyId, selectedRecipientId, userProfile.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textPayload = inputText.trim();
    setInputText('');
    
    if (activeTab === 'direct' && !selectedRecipientId && isRootAdmin) {
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
    await sendChatMessage(
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
      
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 bg-[#0b0c10] border-2 border-yellow-500/30 rounded-3xl p-4 shadow-2xl flex flex-col gap-2">
        <h3 className="text-yellow-400 font-black text-sm uppercase mb-2 px-2 flex items-center gap-2">
          <Radio className="w-4 h-4 animate-pulse" /> Comms Network
        </h3>
        
        <button
          onClick={() => setActiveTab('global')}
          className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
            activeTab === 'global' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-yellow-500/20' : 'bg-[#12141c] border border-slate-800 text-slate-300 hover:border-yellow-500/50'
          }`}
        >
          <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Global Broadcast</div>
          {activeTab === 'global' && <ChevronRight className="w-4 h-4" />}
        </button>

        {canAccessFamily && (
          <button
            onClick={() => setActiveTab('family')}
            className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'family' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-yellow-500/20' : 'bg-[#12141c] border border-slate-800 text-slate-300 hover:border-yellow-500/50'
            }`}
          >
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Family Tactical</div>
            {activeTab === 'family' && <ChevronRight className="w-4 h-4" />}
          </button>
        )}

        <button
          onClick={() => setActiveTab('direct')}
          className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
            activeTab === 'direct' ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-yellow-500/20' : 'bg-[#12141c] border border-slate-800 text-slate-300 hover:border-yellow-500/50'
          }`}
        >
          <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Direct Dispatches</div>
          {activeTab === 'direct' && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Chat / Voice Area */}
      <div className="lg:col-span-3 bg-[#0b0c10] border-2 border-yellow-500/30 rounded-3xl p-6 flex flex-col justify-between h-[700px] shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              {activeTab === 'global' && <MessageSquare className="w-5 h-5" />}
              {activeTab === 'family' && <Users className="w-5 h-5" />}
              {activeTab === 'direct' && <Crown className="w-5 h-5 text-yellow-400 animate-pulse" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                {activeTab === 'global' && <span>Global City Broadcast</span>}
                {activeTab === 'family' && <span>Encrypted Family Tactical</span>}
                {activeTab === 'direct' && <span>Secure Direct Dispatch</span>}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-mono font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" /> LIVE
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'family' ? (
          <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full overflow-hidden pb-4">
             {/* Text Chat side */}
             <div className="w-full lg:w-1/2 flex flex-col border border-slate-800 rounded-2xl bg-[#090a0f] p-3">
               <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
                 {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} isMe={msg.userId === userProfile.id} />)}
                 <div ref={chatEndRef} />
               </div>
               <form onSubmit={handleSendMessage} className="mt-2 pt-2 border-t border-slate-800 flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type family message..."
                    className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50"
                  />
                  <button type="submit" className="p-2.5 rounded-xl bg-yellow-500 text-slate-950 hover:bg-yellow-400">
                    <Send className="w-4 h-4" />
                  </button>
               </form>
             </div>
             
             {/* Voice Chat Side (Jitsi iframe) */}
             <div className="w-full lg:w-1/2 flex flex-col border border-yellow-500/40 rounded-2xl bg-black overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full bg-slate-900/90 backdrop-blur border-b border-yellow-500/30 p-2 z-10 flex justify-between items-center">
                   <span className="text-xs font-bold text-yellow-400 flex items-center gap-2"><Mic className="w-3 h-3"/> Active Voice Channel (No Limit)</span>
                </div>
                <iframe 
                   src={`https://meet.jit.si/BHRP-VC-${currentFamilyId || 'General'}#config.startWithVideoMuted=true&config.prejoinPageEnabled=false&userInfo.displayName="${userProfile.fullName}"`}
                   allow="camera; microphone; fullscreen; display-capture; autoplay"
                   className="w-full h-full border-0 mt-8"
                />
             </div>
          </div>
        ) : activeTab === 'direct' && isRootAdmin ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
             {/* Admin Search Bar */}
             <div className="mb-4 bg-slate-900 border border-slate-800 p-3 rounded-xl">
               <div className="flex items-center bg-[#090a0f] border border-slate-800 rounded-lg px-3 py-2">
                 <Search className="w-4 h-4 text-slate-400 mr-2" />
                 <input 
                   type="text" 
                   placeholder="Search members to dispatch direct message..." 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="bg-transparent border-none outline-none text-sm text-white w-full font-mono"
                 />
               </div>
               {searchQuery && (
                 <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                    {filteredMembers.map((m: any) => (
                      <div 
                        key={m.id} 
                        onClick={() => { setSelectedRecipientId(m.id); setSearchQuery(m.fullName); }}
                        className="p-2 bg-[#12141c] hover:bg-yellow-500/10 cursor-pointer rounded text-xs text-slate-300 font-bold border border-transparent hover:border-yellow-500/30"
                      >
                         {m.fullName} [{m.ingameId}]
                      </div>
                    ))}
                 </div>
               )}
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs pb-4 border border-slate-800 rounded-2xl bg-[#090a0f] p-4">
                 {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} isMe={msg.userId === userProfile.id} />)}
                 <div ref={chatEndRef} />
             </div>

             <form onSubmit={handleSendMessage} className="mt-4 pt-3 flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={selectedRecipientId ? "Type secure dispatch..." : "Select a recipient first..."}
                  disabled={!selectedRecipientId}
                  className="flex-1 bg-slate-900 border-2 border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-50"
                />
                <button type="submit" disabled={!selectedRecipientId} className="p-3 rounded-xl bg-yellow-500 text-slate-950 hover:bg-yellow-400 disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
             </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
             <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs pb-4 border border-slate-800 rounded-2xl bg-[#090a0f] p-4">
                 {messages.length === 0 && <p className="text-slate-500 text-center mt-10 italic">No messages found in this channel.</p>}
                 {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} isMe={msg.userId === userProfile.id} />)}
                 <div ref={chatEndRef} />
             </div>
             
             {!(activeTab === 'direct' && !isRootAdmin) && (
               <form onSubmit={handleSendMessage} className="mt-4 pt-3 flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Broadcast to channel..."
                    className="flex-1 bg-slate-900 border-2 border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-500/50"
                  />
                  <button type="submit" className="p-3 rounded-xl bg-yellow-500 text-slate-950 hover:bg-yellow-400">
                    <Send className="w-5 h-5" />
                  </button>
               </form>
             )}
          </div>
        )}

      </div>
    </div>
  );
};

// Subcomponent for chat bubble
const ChatBubble = ({ msg, isMe }: { msg: ChatMessage, isMe: boolean }) => {
  const isRootMsg =
    msg.senderRank === 'Root Admin' ||
    msg.senderName?.toLowerCase().includes('basharat') ||
    msg.senderName?.toLowerCase().includes('root');

  return (
    <div className={`flex items-start space-x-3 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className="relative flex-shrink-0">
        <img
          src={msg.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
          alt={msg.senderName}
          className={`w-9 h-9 rounded-full object-cover border-2 ${
            isRootMsg ? 'border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]' : 'border-yellow-500/40'
          }`}
        />
        {isRootMsg && <Crown className="w-4 h-4 text-yellow-400 absolute -top-2 -right-1 animate-bounce" />}
      </div>

      <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
        <div className="flex items-center space-x-2">
          {isRootMsg ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-300 font-mono font-black text-[10px]">
              <Crown className="w-3 h-3 text-yellow-400" />
              <span>SUPREME ROOT ADMIN</span>
            </span>
          ) : (
            <span className="font-bold text-white text-xs">{msg.senderName}</span>
          )}

          <span className="px-1.5 py-0.2 rounded text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            [{msg.ingameId || (isRootMsg ? 'ROOT-01' : 'BH-MEMBER')}]
          </span>
          <span className="text-[10px] text-slate-500">{msg.createdAt}</span>
        </div>
        <div
          className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
            isRootMsg
              ? 'bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-slate-900 border-2 border-yellow-400 text-yellow-100 font-bold shadow-[0_0_25px_rgba(250,204,21,0.25)]'
              : isMe
              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-semibold shadow-md shadow-yellow-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-200'
          }`}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
};
