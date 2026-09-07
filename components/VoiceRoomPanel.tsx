'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { Mic, MicOff, PhoneOff, Radio, Users, Shield, Crown, Volume2, VolumeX, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/types';

interface VoiceRoomMember {
  id: string;
  name: string;
  avatarUrl?: string;
  isMuted: boolean;
  isHost: boolean;
}

interface VoiceRoomMeta {
  id: string;
  label: string;
  type: 'family' | 'root';
  familyId?: string;
  members: VoiceRoomMember[];
}

interface SignalPayload {
  senderId: string;
  targetId?: string;
  type: 'offer' | 'answer' | 'candidate' | 'kick' | 'leave';
  payload?: any;
}

export const VoiceRoomPanel: React.FC<{ userProfile: UserProfile; organizations?: any[] }> = ({ userProfile, organizations = [] }) => {
  const isRootAdmin = userProfile.email?.toLowerCase() === 'basharat81253@gmail.com' || userProfile.isRootAdmin;
  const familyId = userProfile.currentFamilyId || organizations[0]?.id;

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<VoiceRoomMeta[]>([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [statusMessage, setStatusMessage] = useState('No active room');
  const [error, setError] = useState<string | null>(null);
  const [micStatus, setMicStatus] = useState<'unknown' | 'ready' | 'muted' | 'blocked'>('unknown');
  const [speakerStatus, setSpeakerStatus] = useState<'unknown' | 'ready' | 'test' | 'muted'>('unknown');
  const [micLevel, setMicLevel] = useState<number>(0);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, Peer.Instance>>(new Map());
  const roomChannelRef = useRef<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const monitorIntervalRef = useRef<number | null>(null);

  const defaultRooms = useMemo(() => {
    const base: VoiceRoomMeta[] = [
      { id: 'root-command-room', label: 'Root Command Voice', type: 'root', members: [] },
    ];

    if (familyId) {
      base.push({
        id: `family-voice-${familyId}`,
        label: 'Family Tactical Voice',
        type: 'family',
        familyId,
        members: [],
      });
    }

    return base;
  }, [familyId]);

  useEffect(() => {
    setRooms(defaultRooms);
  }, [defaultRooms]);

  useEffect(() => {
    return () => {
      if (monitorIntervalRef.current) window.clearInterval(monitorIntervalRef.current);
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      peersRef.current.forEach(peer => peer.destroy());
      if (roomChannelRef.current && supabase) supabase.removeChannel(roomChannelRef.current);
    };
  }, []);

  const stopLocalStream = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    analyserRef.current = null;
    if (monitorIntervalRef.current) {
      window.clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
  };

  const cleanupPeers = () => {
    peersRef.current.forEach(peer => peer.destroy());
    peersRef.current.clear();
  };

  const syncRoomPresence = (roomId: string, presenceState: Record<string, any>) => {
    const members = Object.entries(presenceState).flatMap(([id, entries]: [string, any]) => {
      // Supabase presence state: { [key]: [presenceEntry, ...] } — values are arrays
      const entryList = Array.isArray(entries) ? entries : [entries];
      return entryList.map((entry: any) => ({
        id: entry.id || id,
        name: entry.name || entry.fullName || 'Member',
        avatarUrl: entry.avatarUrl,
        isMuted: Boolean(entry.isMuted),
        isHost: Boolean(entry.isHost),
      }));
    });

    setRooms(prev => prev.map(room => room.id === roomId ? { ...room, members } : room));
  };

  const monitorMicInput = () => {
    const stream = localStreamRef.current;
    if (!stream || !stream.getAudioTracks().length) {
      setMicStatus('blocked');
      return;
    }

    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) {
      setMicStatus('ready');
      return;
    }

    const audioContext = new AudioCtor();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    if (monitorIntervalRef.current) window.clearInterval(monitorIntervalRef.current);
    monitorIntervalRef.current = window.setInterval(() => {
      if (!analyserRef.current) return;
      const data = new Uint8Array(analyserRef.current.fftSize);
      analyserRef.current.getByteFrequencyData(data);
      const average = data.reduce((sum, value) => sum + value, 0) / data.length;
      const percent = Math.min(100, Math.round((average / 255) * 100));
      setMicLevel(percent);
      setMicStatus(percent > 4 ? 'ready' : 'muted');
    }, 250);
  };

  const playSpeakerTest = () => {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) {
      setSpeakerStatus('ready');
      return;
    }

    const ctx = new AudioCtor();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.08;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    setSpeakerStatus('test');
    setStatusMessage('Speaker test playing — can you hear it?');

    window.setTimeout(() => {
      oscillator.stop();
      oscillator.disconnect();
      gainNode.disconnect();
      ctx.close();
      setSpeakerStatus('ready');
      setStatusMessage(activeRoomId ? `Connected to ${rooms.find(r => r.id === activeRoomId)?.label || 'voice room'}` : 'Speaker confirmed');
    }, 800);
  };

  const handleVoiceSignal = async (payload: SignalPayload) => {
    if (!payload || payload.senderId === userProfile.id) return;

    if (payload.type === 'kick') {
      if (payload.senderId !== userProfile.id && payload.targetId === userProfile.id) {
        leaveRoom();
      }
      return;
    }

    if (payload.type === 'leave') {
      if (payload.targetId === userProfile.id || payload.senderId === userProfile.id) {
        const peer = peersRef.current.get(payload.senderId);
        peer?.destroy();
        peersRef.current.delete(payload.senderId);
      }
      return;
    }

    if (!localStreamRef.current) return;

    if (payload.type === 'offer' || payload.type === 'answer' || payload.type === 'candidate') {
      const remoteUserId = payload.senderId;
      let peer = peersRef.current.get(remoteUserId);

      if (!peer) {
        peer = new Peer({
          initiator: false,
          trickle: true,
          stream: localStreamRef.current,
        });

        peer.on('signal', (signalData: any) => {
          if (!roomChannelRef.current) return;
          roomChannelRef.current.send({
            type: 'broadcast',
            event: 'voice-signal',
            payload: {
              senderId: userProfile.id,
              targetId: remoteUserId,
              type: 'answer',
              payload: signalData,
            } as SignalPayload,
          });
        });

        peer.on('stream', (stream: MediaStream) => {
          const audioEl = document.getElementById(`voice-audio-${remoteUserId}`) as HTMLAudioElement | null;
          if (audioEl) {
            audioEl.srcObject = stream;
            audioEl.play().catch(() => undefined);
          } else {
            const el = document.createElement('audio');
            el.id = `voice-audio-${remoteUserId}`;
            el.srcObject = stream;
            el.autoplay = true;
            document.body.appendChild(el);
          }
        });

        peer.on('error', (err: Error) => {
          console.warn('voice signal error:', err);
        });

        peersRef.current.set(remoteUserId, peer);
      }

      if (payload.type === 'offer' && peer) peer.signal(payload.payload);
      if (payload.type === 'answer' && peer) peer.signal(payload.payload);
      if (payload.type === 'candidate' && peer) peer.signal(payload.payload);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!supabase) {
      setError('Supabase must be configured for live voice channels.');
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      monitorMicInput();
      setIsMicOn(true);

      const channel = supabase.channel(`voice-room-${roomId}`, {
        config: { presence: { key: userProfile.id } },
      });

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        syncRoomPresence(roomId, state as Record<string, any>);
      });

      channel.on('broadcast', { event: 'voice-signal' }, (payload: any) => {
        handleVoiceSignal(payload.payload as SignalPayload);
      });

      channel.on('broadcast', { event: 'voice-command' }, (payload: any) => {
        if (payload.payload?.action === 'kick' && payload.payload.userId === userProfile.id) {
          leaveRoom();
        }
      });

      await channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: userProfile.id,
            name: userProfile.fullName,
            avatarUrl: userProfile.avatarUrl,
            isMuted: !isMicOn,
            isHost: isRootAdmin,
          });

          setActiveRoomId(roomId);
          setStatusMessage(`Connected to ${rooms.find(r => r.id === roomId)?.label || 'voice room'}`);
          syncRoomPresence(roomId, channel.presenceState() as Record<string, any>);

          // Send WebRTC offers to everyone already in the room
          const currentState = channel.presenceState() as Record<string, any>;
          const existingMembers = Object.entries(currentState).flatMap(([, entries]) =>
            (Array.isArray(entries) ? entries : [entries])
          );
          for (const member of existingMembers) {
            const memberId = member.id;
            if (!memberId || memberId === userProfile.id) continue;
            if (peersRef.current.has(memberId)) continue;

            const peer = new Peer({
              initiator: true,
              trickle: true,
              stream: localStreamRef.current!,
            });

            peer.on('signal', (signalData: any) => {
              channel.send({
                type: 'broadcast',
                event: 'voice-signal',
                payload: {
                  senderId: userProfile.id,
                  targetId: memberId,
                  type: 'offer',
                  payload: signalData,
                } as SignalPayload,
              });
            });

            peer.on('stream', (stream: MediaStream) => {
              let audioEl = document.getElementById(`voice-audio-${memberId}`) as HTMLAudioElement | null;
              if (!audioEl) {
                audioEl = document.createElement('audio');
                audioEl.id = `voice-audio-${memberId}`;
                audioEl.autoplay = true;
                document.body.appendChild(audioEl);
              }
              audioEl.srcObject = stream;
              audioEl.play().catch(() => undefined);
            });

            peer.on('error', (err: Error) => console.warn('peer error:', err));
            peersRef.current.set(memberId, peer);
          }
        }
      });

      if (roomChannelRef.current) {
        supabase.removeChannel(roomChannelRef.current);
      }

      roomChannelRef.current = channel;
    } catch (err) {
      console.error('joinRoom failed', err);
      setError('Microphone permission is required. Please allow mic access to join the voice room.');
      setMicStatus('blocked');
    }
  };

  const leaveRoom = async () => {
    if (!roomChannelRef.current) return;

    try {
      roomChannelRef.current.send({
        type: 'broadcast',
        event: 'voice-signal',
        payload: {
          senderId: userProfile.id,
          targetId: '*',
          type: 'leave' as const,
        } as SignalPayload,
      });
    } catch (error) {
      console.warn('leave broadcast error', error);
    }

    await roomChannelRef.current.untrack();
    supabase?.removeChannel(roomChannelRef.current);
    roomChannelRef.current = null;
    cleanupPeers();
    stopLocalStream();
    setActiveRoomId(null);
    setStatusMessage('Voice room left');
    setIsMicOn(false);
    setMicStatus('unknown');

    setRooms(prev => prev.map(room => ({
      ...room,
      members: room.id === activeRoomId ? [] : room.members.filter(member => member.id !== userProfile.id),
    })));
  };

  const toggleMute = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = nextState;
      });
    }
    setMicStatus(nextState ? 'ready' : 'muted');
    setStatusMessage(nextState ? 'Mic live and audible' : 'Mic muted');
  };

  const kickMember = (memberId: string) => {
    if (!roomChannelRef.current) return;

    roomChannelRef.current.send({
      type: 'broadcast',
      event: 'voice-command',
      payload: {
        action: 'kick',
        userId: memberId,
      },
    });
  };

  const availableRooms = rooms.filter((room) => {
    if (room.type === 'root') return isRootAdmin;
    if (room.type === 'family') return Boolean(familyId);
    return false;
  });

  const activeRoomUsers = activeRoomId ? (rooms.find(r => r.id === activeRoomId)?.members || []) : [];

  return (
    <div className="mb-6 rounded-3xl border border-yellow-500/30 bg-[#0b0c10] p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-yellow-400">
          <Radio className="w-5 h-5" />
          <h3 className="text-lg font-black uppercase tracking-wider">Family Voice Channels</h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-2 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> {activeRoomId ? 'online' : 'standby'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 border border-rose-700 bg-rose-950/30 px-3 py-2 text-xs text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-[#0a0d12] p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400">
            <span>Mic</span>
            {micStatus === 'ready' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : micStatus === 'blocked' ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-500" />}
          </div>
          <div className="flex items-center gap-2">
            {micStatus === 'ready' ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-slate-500" />}
            <span className="text-sm font-bold text-white">
              {micStatus === 'ready' ? 'Live' : micStatus === 'muted' ? 'Muted' : micStatus === 'blocked' ? 'Blocked' : 'Unknown'}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-yellow-400" style={{ width: `${Math.max(8, micLevel)}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0a0d12] p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400">
            <span>Speaker</span>
            {speakerStatus === 'ready' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : speakerStatus === 'test' ? <Volume2 className="w-3.5 h-3.5 text-yellow-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </div>
          <div className="flex items-center gap-2">
            {speakerStatus === 'ready' ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span className="text-sm font-bold text-white">
              {speakerStatus === 'ready' ? 'Working' : speakerStatus === 'test' ? 'Testing' : 'Unknown'}
            </span>
          </div>
          <button
            onClick={playSpeakerTest}
            className="mt-3 w-full rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-2 py-1.5 text-[10px] font-black uppercase text-yellow-300"
          >
            Test speaker
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0a0d12] p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400">
            <span>Room status</span>
            {activeRoomId ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />}
          </div>
          <div className="text-sm font-bold text-white">{activeRoomId ? `${activeRoomUsers.length} in room` : 'Not joined'}</div>
          <div className="mt-2 text-[10px] text-slate-400">{activeRoomId ? `Connected to ${rooms.find(r => r.id === activeRoomId)?.label}` : 'Join a room to begin voice chat'}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {availableRooms.map(room => (
          <div key={room.id} className="rounded-2xl border border-slate-800 bg-[#090a0f] p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {room.type === 'root' ? <Shield className="w-4 h-4 text-yellow-400" /> : <Users className="w-4 h-4 text-yellow-400" />}
                <span className="font-bold text-white">{room.label}</span>
              </div>

              {activeRoomId === room.id ? (
                <button
                  onClick={leaveRoom}
                  className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-[10px] font-bold uppercase text-white"
                >
                  <PhoneOff className="w-3.5 h-3.5" /> Leave
                </button>
              ) : (
                <button
                  onClick={() => joinRoom(room.id)}
                  className="rounded-xl bg-yellow-500 px-3 py-1.5 text-[10px] font-black uppercase text-slate-950"
                >
                  Join
                </button>
              )}
            </div>

            <div className="mb-3 flex items-center gap-2 text-[10px] text-slate-400">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 font-mono">
                {room.members.length} active
              </span>
              {activeRoomId === room.id && (
                <button onClick={toggleMute} className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1">
                  {isMicOn ? 'Mic on' : 'Mic off'}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {room.members.length === 0 ? (
                <p className="text-xs text-slate-500">No one currently in this voice channel.</p>
              ) : (
                room.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-2 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={member.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={member.name}
                        className="h-7 w-7 rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                          {member.name}
                          {member.isHost && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400">{member.isMuted ? 'Muted' : 'Listening'}</div>
                      </div>
                    </div>

                    {isRootAdmin && member.id !== userProfile.id && (
                      <button
                        onClick={() => kickMember(member.id)}
                        className="rounded-lg border border-rose-700 bg-rose-950/30 px-2 py-1 text-[10px] font-bold text-rose-200"
                      >
                        Kick
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {activeRoomId ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-slate-500" />}
          <span>{statusMessage}</span>
        </div>

        {activeRoomId && (
          <button
            onClick={leaveRoom}
            className="rounded-xl border border-rose-700 bg-rose-950/40 px-3 py-1.5 font-bold text-rose-200"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
};
