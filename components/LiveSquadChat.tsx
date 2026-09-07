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
    }

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

  // Active User or Root Info for Header
  const activeRecipient = allProfiles.find(p => p.id === selectedRecipientId);

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

        <button
          onClick={() => setActiveTab('announcement')}
          className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
            activeTab === 'announcement' ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white font-bold shadow-lg shadow-rose-600/20' : 'bg-[#12141c] border border-slate-800 text-slate-300 hover:border-rose-500/50'
          }`}
        >
          <div className="flex items-center gap-2"><Megaphone className="w-4 h-4" /> Announcements</div>
          {activeTab === 'announcement' && <ChevronRight className="w-4 h-4" />}
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

      {/* Main Chat Area */}
      <div className="lg:col-span-3 bg-[#0b0c10] border-2 border-yellow-500/30 rounded-3xl p-6 flex flex-col justify-between h-[700px] shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 mb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${activeTab === 'announcement' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
              {activeTab === 'global' && <MessageSquare className="w-5 h-5" />}
              {activeTab === 'announcement' && <AlertCircle className="w-5 h-5 animate-pulse" />}
              {activeTab === 'family' && <Users className="w-5 h-5" />}
              {activeTab === 'direct' && <Crown className="w-5 h-5 text-yellow-400 animate-pulse" />}
            </div>
            <div>
              <h2 className={`text-lg font-black uppercase flex items-center gap-2 ${activeTab === 'announcement' ? 'text-rose-400' : 'text-white'}`}>
                {activeTab === 'global' && <span>Global City Broadcast</span>}
                {activeTab === 'announcement' && <span>Official Announcements</span>}
                {activeTab === 'family' && <span>Encrypted Family Tactical</span>}
                {activeTab === 'direct' && <span>Secure Direct Dispatch {activeRecipient && `> ${activeRecipient.fullName}`}</span>}
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold flex items-center gap-1 ${activeTab === 'announcement' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}>
                  <span className={`w-2 h-2 rounded-full animate-ping ${activeTab === 'announcement' ? 'bg-rose-400' : 'bg-yellow-400'}`} /> LIVE
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* Send Error Banner */}
        {sendError && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{sendError}</span>
            <button onClick={() => setSendError(null)} className="ml-auto text-rose-500 hover:text-rose-300">✕</button>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'direct' && isRootAdmin ? (
          <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full overflow-hidden pb-4">
             {/* Admin Search Bar / Contact List */}
             <div className="w-full lg:w-1/3 flex flex-col border border-slate-800 rounded-2xl bg-[#090a0f] p-3">
               <div className="flex items-center bg-[#12141c] border border-slate-800 rounded-lg px-3 py-2 mb-3">
                 <Search className="w-4 h-4 text-slate-400 mr-2" />
                 <input 
                   type="text" 
                   placeholder="Search members..." 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="bg-transparent border-none outline-none text-sm text-white w-full font-mono"
                 />
               </div>
               <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                  {filteredMembers.map((m: any) => (
                    <div 
                      key={m.id} 
                      onClick={() => { setSelectedRecipientId(m.id); }}
                      className={`p-3 cursor-pointer rounded-xl text-xs font-bold border transition-all ${
                        selectedRecipientId === m.id 
                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' 
                        : 'bg-[#12141c] border-slate-800 text-slate-300 hover:border-yellow-500/30 hover:bg-yellow-500/5'
                      }`}
                    >
                       <div className="flex flex-col">
                         <span className="text-sm">{m.fullName}</span>
                         <span className="text-[10px] text-slate-500 font-mono mt-0.5">[{m.ingameId}]</span>
                       </div>
                    </div>
                  ))}
               </div>
             </div>

             {/* Chat Window */}
             <div className="w-full lg:w-2/3 flex flex-col border border-slate-800 rounded-2xl bg-[#090a0f] p-3">
                 <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
                     {messages.length === 0 && <p className="text-slate-500 text-center mt-10 italic">Select a contact to view or start a dispatch.</p>}
                     {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} isMe={msg.userId === userProfile.id} />)}
                     <div ref={chatEndRef} />
                 </div>
                 <form onSubmit={handleSendMessage} className="mt-2 pt-2 border-t border-slate-800 flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={selectedRecipientId ? "Type secure dispatch..." : "Select a recipient first..."}
                      disabled={!selectedRecipientId}
                      className="flex-1 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-yellow-500/50 disabled:opacity-50 transition"
                    />
                    <button type="submit" disabled={!selectedRecipientId} className="p-3 rounded-xl bg-yellow-500 text-slate-950 hover:bg-yellow-400 disabled:opacity-50 transition">
                      <Send className="w-5 h-5" />
                    </button>
                 </form>
             </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
             <div className={`flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs pb-4 border rounded-2xl bg-[#090a0f] p-4 ${activeTab === 'announcement' ? 'border-rose-900/50' : 'border-slate-800'}`}>
                 {messages.length === 0 && <p className="text-slate-500 text-center mt-10 italic">No messages found in this channel.</p>}
                 {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} isMe={msg.userId === userProfile.id} isAnnouncement={activeTab === 'announcement'} />)}
                 <div ref={chatEndRef} />
             </div>
             
             {/* Hide input for regular members in announcements tab */}
             {!(activeTab === 'announcement' && !isRootAdmin) && (
               <form onSubmit={handleSendMessage} className="mt-4 pt-3 flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeTab === 'announcement' ? "Post official announcement..." : "Broadcast to channel..."}
                    className={`flex-1 bg-slate-900 border-2 text-white rounded-xl px-4 py-3 text-sm outline-none transition ${activeTab === 'announcement' ? 'border-rose-900/50 focus:border-rose-500/50' : 'border-slate-800 focus:border-yellow-500/50'}`}
                  />
                  <button type="submit" className={`p-3 rounded-xl text-white transition ${activeTab === 'announcement' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-yellow-500 text-slate-950 hover:bg-yellow-400'}`}>
                    {activeTab === 'announcement' ? <Megaphone className="w-5 h-5" /> : <Send className="w-5 h-5" />}
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
const ChatBubble = ({ msg, isMe, isAnnouncement = false }: { msg: ChatMessage, isMe: boolean, isAnnouncement?: boolean }) => {
  const isRootMsg =
    msg.senderRank === 'Root Admin' ||
    msg.senderName?.toLowerCase().includes('basharat') ||
    msg.senderName?.toLowerCase().includes('root');

  return (
    <div className={`flex items-start space-x-3 ${isMe && !isAnnouncement ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className="relative flex-shrink-0">
        <img
          src={msg.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
          alt={msg.senderName}
          className={`w-10 h-10 rounded-xl object-cover border-2 ${
            isRootMsg ? 'border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)]' : 'border-slate-700'
          }`}
        />
        {isRootMsg && <Crown className="w-4 h-4 text-yellow-400 absolute -top-2 -right-1 animate-bounce drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />}
      </div>

      <div className={`max-w-[85%] space-y-1 ${isMe && !isAnnouncement ? 'items-end text-right' : ''}`}>
        <div className="flex items-center flex-wrap gap-2 mb-1">
          {/* SENDER RANK BADGE - Super Prominent */}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
            isRootMsg 
              ? 'bg-yellow-500 text-slate-950 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
              : msg.senderRank === 'Leader' 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : msg.senderRank === 'High Command'
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
              : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
          }`}>
            {isRootMsg ? 'Supreme Root Admin' : msg.senderRank}
          </span>
          
          <span className="font-bold text-white text-sm tracking-wide">{msg.senderName}</span>

          <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 border border-slate-700">
            [{msg.ingameId || (isRootMsg ? 'ROOT-01' : 'BH-MEMBER')}]
          </span>
          
          <span className="text-[10px] text-slate-500">{msg.createdAt}</span>
        </div>
        
        <div
          className={`p-3.5 rounded-2xl text-sm leading-relaxed font-sans shadow-md ${
            isAnnouncement
              ? 'bg-gradient-to-r from-rose-950/80 to-slate-900 border-l-4 border-l-rose-500 border-y border-r border-rose-900/30 text-rose-100 font-medium'
              : isRootMsg
              ? 'bg-gradient-to-r from-amber-500/20 to-slate-900 border-l-4 border-l-yellow-400 border-y border-r border-yellow-500/20 text-yellow-50 font-medium'
              : isMe
              ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-blue-500/20 rounded-tr-sm'
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
          }`}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
};
