'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '@/lib/types';
import { MessageSquare, Mic, MicOff, Send, Radio, Volume2, VolumeX, Shield, Users, Sparkles, Hash } from 'lucide-react';
import { fetchChatMessages, sendChatMessage } from '@/lib/supabase';

interface LiveSquadChatProps {
  userProfile: UserProfile;
}

export const LiveSquadChat: React.FC<LiveSquadChatProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      userId: 'root-1',
      senderName: 'Basharat Hussain',
      senderRank: 'Root Admin',
      ingameId: 'ROOT-01',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Tactical Radio Channel online. Convoy operations and squad chat active.',
      createdAt: new Date(Date.now() - 300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [voiceUsers, setVoiceUsers] = useState<Array<{ name: string; rank: string; isSpeaking: boolean }>>([
    { name: 'Basharat Hussain', rank: 'Root Admin', isSpeaking: false },
    { name: 'Rafay King', rank: 'Leader', isSpeaking: false },
    { name: 'Imran Khan', rank: 'High Command', isSpeaking: true },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitialMessages = async () => {
      const dbMsgs = await fetchChatMessages();
      if (dbMsgs.length > 0) {
        setMessages(dbMsgs);
      }
    };
    loadInitialMessages();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: userProfile.id,
      senderName: userProfile.fullName,
      senderRank: userProfile.accountType,
      ingameId: userProfile.ingameId,
      avatarUrl: userProfile.avatarUrl,
      text: inputText.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    await sendChatMessage(
      userProfile.id,
      userProfile.fullName,
      userProfile.accountType,
      userProfile.ingameId,
      userProfile.avatarUrl,
      inputText.trim()
    );
  };

  const toggleMic = () => {
    setIsMicMuted(!isMicMuted);
    if (isMicMuted) {
      setIsTalking(true);
      setTimeout(() => setIsTalking(false), 4000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-100 font-sans">
      
      {/* Left Column: Live Text Chat Feed */}
      <div className="lg:col-span-2 bg-[#0b0c10] border-2 border-yellow-500/30 rounded-3xl p-6 flex flex-col justify-between h-[600px] shadow-2xl relative overflow-hidden">
        
        {/* Chat Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <span>Tactical Squad Chat</span>
                <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-mono font-bold">
                  LIVE
                </span>
              </h2>
              <p className="text-slate-400 text-xs font-mono">Real-time squad communication & convoy coordination</p>
            </div>
          </div>
        </div>

        {/* Messages Feed Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
          {messages.map((msg) => {
            const isMe = msg.userId === userProfile.id;
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <img
                  src={msg.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full border border-yellow-500/40 object-cover flex-shrink-0"
                />
                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-xs">{msg.senderName}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                      [{msg.ingameId}]
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.createdAt}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                      isMe
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-semibold shadow-md shadow-yellow-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Send Input Bar */}
        <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type tactical message or convoy alert..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-xs font-mono focus:border-yellow-400 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:opacity-90 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-yellow-500/20 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>

      </div>

      {/* Right Column: Tactical Voice Channel Hub */}
      <div className="bg-[#0b0c10] border-2 border-yellow-500/30 rounded-3xl p-6 flex flex-col justify-between h-[600px] shadow-2xl relative overflow-hidden">
        
        <div className="space-y-6">
          
          {/* Voice Channel Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Radio className="w-5 h-5 animate-pulse text-yellow-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase">Squad Voice Channel</h3>
                <p className="text-slate-400 text-xs font-mono">Encrypted Tactical PTT Channel</p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 text-xs text-yellow-400 font-mono font-bold bg-yellow-500/10 px-2.5 py-1 rounded-full border border-yellow-500/30">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" /> CONNECTED
            </span>
          </div>

          {/* Active Speakers List */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-yellow-400" /> Active Radio Speakers
            </h4>

            <div className="space-y-2">
              {voiceUsers.map((u, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    u.isSpeaking
                      ? 'bg-yellow-500/15 border-yellow-400 shadow-md shadow-yellow-500/20'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-3 h-3 rounded-full ${u.isSpeaking ? 'bg-yellow-400 animate-ping' : 'bg-slate-700'}`} />
                    <div>
                      <p className="font-bold text-white text-xs">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.rank}</p>
                    </div>
                  </div>

                  {u.isSpeaking && (
                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider animate-pulse">
                      🎙️ SPEAKING
                    </span>
                  )}
                </div>
              ))}

              {/* Current Logged-in User Voice Status */}
              <div
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  !isMicMuted
                    ? 'bg-yellow-500/20 border-yellow-400 shadow-lg shadow-yellow-500/20'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-3 h-3 rounded-full ${!isMicMuted ? 'bg-yellow-400 animate-ping' : 'bg-rose-500'}`} />
                  <div>
                    <p className="font-bold text-white text-xs">{userProfile.fullName} (You)</p>
                    <p className="text-[10px] text-slate-400">{userProfile.accountType}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold uppercase tracking-wider ${!isMicMuted ? 'text-yellow-400' : 'text-slate-500'}`}>
                  {!isMicMuted ? '🎙️ MIC ON' : '🔇 MUTED'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Voice Controls */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-center space-x-4">
            
            {/* Mic Toggle Button */}
            <button
              onClick={toggleMic}
              className={`p-4 rounded-2xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-lg ${
                !isMicMuted
                  ? 'bg-yellow-500 text-slate-950 shadow-yellow-500/30'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {!isMicMuted ? <Mic className="w-5 h-5 text-slate-950" /> : <MicOff className="w-5 h-5 text-rose-400" />}
              <span>{!isMicMuted ? 'Microphone Active' : 'Unmute Mic'}</span>
            </button>

            {/* Deafen Toggle */}
            <button
              onClick={() => setIsDeafened(!isDeafened)}
              className={`p-4 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isDeafened
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-slate-900 border border-slate-700 text-slate-300'
              }`}
              title="Deafen Audio"
            >
              {isDeafened ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-yellow-400" />}
            </button>

          </div>

          <p className="text-[10px] text-slate-500 text-center font-mono">Push-to-Talk (PTT) Audio Channel Ready</p>
        </div>

      </div>

    </div>
  );
};
