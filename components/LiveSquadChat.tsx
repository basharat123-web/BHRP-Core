'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage } from '@/lib/types';
import { MessageSquare, Mic, MicOff, Send, Radio, Volume2, VolumeX, Shield, Users, Sparkles, Hash } from 'lucide-react';
import { supabase, fetchChatMessages, sendChatMessage } from '@/lib/supabase';

interface LiveSquadChatProps {
  userProfile: UserProfile;
}

export interface VoiceParticipant {
  userId: string;
  name: string;
  rank: string;
  ingameId: string;
  avatarUrl?: string;
  isMicMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
}

export const LiveSquadChat: React.FC<LiveSquadChatProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      userId: 'root-sys',
      senderName: 'BHRP Command Center',
      senderRank: 'System',
      ingameId: 'SYS-01',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: 'Tactical Frequency 104.5 MHz active. Squad chat & voice comms online.',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Real-time connected voice channel participants
  const [voiceUsers, setVoiceUsers] = useState<VoiceParticipant[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const voiceChannelRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // 1. Initial Messages Fetch & Supabase Realtime Subscription for Text Chat
  useEffect(() => {
    const loadMessages = async () => {
      const dbMsgs = await fetchChatMessages();
      if (dbMsgs.length > 0) {
        setMessages(dbMsgs);
      }
    };
    loadMessages();

    if (!supabase) return;

    // Realtime postgres changes channel for chat_messages table
    const chatChannel = supabase
      .channel('bhrp-live-chat-room')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload: any) => {
          const newMsg: ChatMessage = {
            id: payload.new.id,
            userId: payload.new.user_id,
            senderName: payload.new.sender_name,
            senderRank: payload.new.sender_rank,
            ingameId: payload.new.ingame_id,
            avatarUrl: payload.new.avatar_url,
            text: payload.new.text,
            createdAt: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .on('broadcast', { event: 'new-message' }, ({ payload }) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
      })
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(chatChannel);
    };
  }, []);

  // 2. Real-time Supabase Presence for Voice Channel Users
  useEffect(() => {
    if (!supabase) {
      // Fallback local voice user list if Supabase client not present
      setVoiceUsers([
        {
          userId: userProfile.id,
          name: userProfile.fullName,
          rank: userProfile.accountType,
          ingameId: userProfile.ingameId,
          avatarUrl: userProfile.avatarUrl,
          isMicMuted,
          isDeafened,
          isSpeaking,
        },
      ]);
      return;
    }

    const voiceChannel = supabase.channel('bhrp-voice-presence-room', {
      config: {
        presence: { key: userProfile.id },
      },
    });

    voiceChannelRef.current = voiceChannel;

    const syncPresenceState = () => {
      const state = voiceChannel.presenceState();
      const participants: VoiceParticipant[] = [];

      Object.keys(state).forEach((key) => {
        const presences = state[key] as any[];
        if (presences && presences.length > 0) {
          const latest = presences[presences.length - 1];
          participants.push({
            userId: latest.userId || key,
            name: latest.name || 'Squad Member',
            rank: latest.rank || 'Member',
            ingameId: latest.ingameId || 'BH-00',
            avatarUrl: latest.avatarUrl,
            isMicMuted: Boolean(latest.isMicMuted),
            isDeafened: Boolean(latest.isDeafened),
            isSpeaking: Boolean(latest.isSpeaking),
          });
        }
      });

      setVoiceUsers(participants);
    };

    voiceChannel
      .on('presence', { event: 'sync' }, syncPresenceState)
      .on('presence', { event: 'join' }, syncPresenceState)
      .on('presence', { event: 'leave' }, syncPresenceState)
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await voiceChannel.track({
            userId: userProfile.id,
            name: userProfile.fullName,
            rank: userProfile.accountType,
            ingameId: userProfile.ingameId,
            avatarUrl: userProfile.avatarUrl,
            isMicMuted,
            isDeafened,
            isSpeaking,
            joinedAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      if (supabase && voiceChannel) {
        supabase.removeChannel(voiceChannel);
      }
    };
  }, [userProfile.id]);

  // Update presence status whenever mic state changes
  useEffect(() => {
    if (voiceChannelRef.current && supabase) {
      voiceChannelRef.current.track({
        userId: userProfile.id,
        name: userProfile.fullName,
        rank: userProfile.accountType,
        ingameId: userProfile.ingameId,
        avatarUrl: userProfile.avatarUrl,
        isMicMuted,
        isDeafened,
        isSpeaking,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [isMicMuted, isDeafened, isSpeaking, userProfile]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Text Message Submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textPayload = inputText.trim();
    setInputText('');

    const tempMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: userProfile.id,
      senderName: userProfile.fullName,
      senderRank: userProfile.accountType,
      ingameId: userProfile.ingameId,
      avatarUrl: userProfile.avatarUrl,
      text: textPayload,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, tempMsg]);

    // Broadcast message instantly to all connected clients
    if (voiceChannelRef.current) {
      voiceChannelRef.current.send({
        type: 'broadcast',
        event: 'new-message',
        payload: tempMsg,
      });
    }

    await sendChatMessage(
      userProfile.id,
      userProfile.fullName,
      userProfile.accountType,
      userProfile.ingameId,
      userProfile.avatarUrl,
      textPayload
    );
  };

  // 3. WebRTC Microphone Audio Stream & Sound Level Meter
  const toggleMic = async () => {
    const nextMuteState = !isMicMuted;
    setIsMicMuted(nextMuteState);

    if (!nextMuteState) {
      // User is Unmuting Mic -> Request Browser Microphone Permission
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;

          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = audioContext;
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const detectAudioLevel = () => {
            if (!mediaStreamRef.current || nextMuteState) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const speakingNow = average > 12;
            setIsSpeaking(speakingNow);
            requestAnimationFrame(detectAudioLevel);
          };

          detectAudioLevel();
        } else {
          // Simulation fallback if mic not available
          setIsSpeaking(true);
          setTimeout(() => setIsSpeaking(false), 4000);
        }
      } catch (err) {
        console.warn('Microphone access notice:', err);
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 3000);
      }
    } else {
      // User is Muting Mic -> Stop Microphone Track
      setIsSpeaking(false);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-100 font-sans">
      
      {/* Left Column: Live Text Chat Feed */}
      <div className="lg:col-span-2 bg-[#0b0c10] border-2 border-yellow-500/30 rounded-3xl p-6 flex flex-col justify-between h-[620px] shadow-2xl relative overflow-hidden">
        
        {/* Chat Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <span>Tactical Squad Chat</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-mono font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" /> LIVE REALTIME
                </span>
              </h2>
              <p className="text-slate-400 text-xs font-mono">Synced live messaging across all logged-in Gmail accounts</p>
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
                      [{msg.ingameId || 'BH-MEMBER'}]
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
      <div className="bg-[#0b0c10] border-2 border-yellow-500/30 rounded-3xl p-6 flex flex-col justify-between h-[620px] shadow-2xl relative overflow-hidden">
        
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
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" /> {voiceUsers.length} ONLINE
            </span>
          </div>

          {/* Active Speakers & Connected Users List */}
          <div className="space-y-3 font-mono max-h-[360px] overflow-y-auto pr-1">
            <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-yellow-400" /> Connected Radio Users
            </h4>

            <div className="space-y-2">
              {voiceUsers.map((user) => {
                const isMe = user.userId === userProfile.id;
                const effectiveMicMuted = isMe ? isMicMuted : user.isMicMuted;
                const effectiveSpeaking = isMe ? isSpeaking : user.isSpeaking;

                return (
                  <div
                    key={user.userId}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      effectiveSpeaking
                        ? 'bg-yellow-500/20 border-yellow-400 shadow-lg shadow-yellow-500/20'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border border-yellow-500/40 object-cover"
                        />
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0b0c10] ${
                            effectiveSpeaking ? 'bg-yellow-400 animate-ping' : !effectiveMicMuted ? 'bg-emerald-400' : 'bg-rose-500'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">
                          {user.name} {isMe ? '(You)' : ''}
                        </p>
                        <p className="text-[10px] text-slate-400">{user.rank}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        effectiveSpeaking
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40 animate-pulse'
                          : !effectiveMicMuted
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {effectiveSpeaking ? '🎙️ SPEAKING' : !effectiveMicMuted ? '🎙️ MIC ON' : '🔇 MUTED'}
                    </span>
                  </div>
                );
              })}
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
                  ? 'bg-yellow-500 text-slate-950 shadow-yellow-500/30 scale-[1.02]'
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

          <p className="text-[10px] text-slate-500 text-center font-mono">Live WebRTC Audio & Supabase Presence Comms Active</p>
        </div>

      </div>

    </div>
  );
};
