'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { Mic, MicOff, PhoneOff, Radio, Users, Shield, Crown, Volume2, VolumeX, CheckCircle2, AlertTriangle, Wand2 } from 'lucide-react';
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
  const [isNoiseCancellationOn, setIsNoiseCancellationOn] = useState(true);
  const [statusMessage, setStatusMessage] = useState('No active room');
  const [error, setError] = useState<string | null>(null);
  const [micStatus, setMicStatus] = useState<'unknown' | 'ready' | 'muted' | 'blocked'>('unknown');
  const [speakerStatus, setSpeakerStatus] = useState<'unknown' | 'ready' | 'test' | 'muted'>('unknown');
  const [micLevel, setMicLevel] = useState<number>(0);

  const localStreamRef = useRef<MediaStream | null>(null);
  const processedStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
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
      processedStreamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
      peersRef.current.forEach(peer => peer.destroy());
      if (roomChannelRef.current && supabase) supabase.removeChannel(roomChannelRef.current);
    };
  }, []);

  const buildProcessedStream = async (rawStream: MediaStream): Promise<MediaStream> => {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtor) return rawStream;

    const ctx = new AudioCtor({ sampleRate: 48000 }) as AudioContext;
    audioContextRef.current = ctx;

    try {
      await ctx.audioWorklet.addModule('/rnnoise-worklet.js');
      const source = ctx.createMediaStreamSource(rawStream);
      const rnnoiseNode = new AudioWorkletNode(ctx, 'rnnoise-processor');

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -30;
      compressor.knee.value = 12;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.3;

      const destination = ctx.createMediaStreamDestination();
      source.connect(rnnoiseNode);
      rnnoiseNode.connect(compressor);
      compressor.connect(destination);

      return destination.stream;
    } catch (err) {
      ctx.close();
      return rawStream;
    }
  };

  const stopLocalStream = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    processedStreamRef.current?.getTracks().forEach(track => track.stop());
    localStreamRef.current = null;
    processedStreamRef.current = null;
    analyserRef.current = null;
    if (monitorIntervalRef.current) {
      window.clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
    audioContextRef.current?.close();
    audioContextRef.current = null;
  };

  const cleanupPeers = () => {
    peersRef.current.forEach(peer => peer.destroy());
    peersRef.current.clear();
  };

  const syncRoomPresence = (roomId: string, presenceState: Record<string, any>) => {
    const members = Object.entries(presenceState).flatMap(([id, entries]: [string, any]) => {
      const entryList = Array.isArray(entries) ? entries : [entries];
      if (!entryList.length) return [];
      const data = entryList[0];
      return {
        id,
        name: data.name || 'Unknown Member',
        avatarUrl: data.avatarUrl,
        isMuted: data.isMuted || false,
        isHost: data.isHost || false,
      };
    });

    setRooms(prev => prev.map(room => room.id === roomId ? { ...room, members } : room));
  };

  const playSpeakerTest = () => {
    setSpeakerStatus('test');
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    setTimeout(() => setSpeakerStatus('ready'), 600);
  };

  const monitorMicInput = () => {
    if (!localStreamRef.current) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(localStreamRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      monitorIntervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
      }, 100);
      setMicStatus('ready');
    } catch (e) {
      setMicStatus('blocked');
    }
  };

  const handleVoiceSignal = (payload: SignalPayload) => {
    if (payload.targetId !== userProfile.id) return;
    if (!localStreamRef.current) return;

    if (payload.type === 'offer' || payload.type === 'answer' || payload.type === 'candidate') {
      const remoteUserId = payload.senderId;
        console.log(`[WebRTC] Creating responding Peer for user ${remoteUserId}`);
        peer = new Peer({
          initiator: false,
          trickle: true,
          stream: processedStreamRef.current || localStreamRef.current!,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
              { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
              { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
            ]
          }
        });

        peer.on('error', (err: any) => {
          console.error(`[WebRTC Error - Responder] Peer error for ${remoteUserId}:`, err);
        });

        peer.on('signal', (signalData: any) => {
          console.log(`[WebRTC] Generated signal (answer/candidate) for ${remoteUserId}`, signalData);
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
          console.log(`[WebRTC] Received remote stream from ${remoteUserId}`);
          const audioEl = document.getElementById(`voice-audio-${remoteUserId}`) as HTMLAudioElement | null;
          if (audioEl) {
            audioEl.srcObject = stream;
            audioEl.play().catch(e => console.error(`[WebRTC Error] Audio play failed for ${remoteUserId}:`, e));
          } else {
            console.error(`[WebRTC Error] Audio element not found for ${remoteUserId}`);
          }
        });

        peersRef.current.set(remoteUserId, peer);
      }

      console.log(`[WebRTC] Received ${payload.type} from ${remoteUserId}`, payload.payload);
      if (payload.type === 'offer' && peer) peer.signal(payload.payload);
      if (payload.type === 'answer' && peer) peer.signal(payload.payload);
      if (payload.type === 'candidate' && peer) peer.signal(payload.payload);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!supabase) return setError('Supabase must be configured for live voice channels.');
    console.log(`[WebRTC] Attempting to join room ${roomId}...`);

    try {
      setError(null);
      console.log(`[WebRTC] Requesting microphone access...`);
      const rawStream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true, sampleRate: 48000, channelCount: 1 },
      });
      console.log(`[WebRTC] Microphone access granted.`);
      localStreamRef.current = rawStream;

      const streamToSend = isNoiseCancellationOn ? await buildProcessedStream(rawStream) : rawStream;
      processedStreamRef.current = streamToSend;

      monitorMicInput();
      setIsMicOn(true);

      const channel = supabase.channel(`voice-room-${roomId}`, { config: { presence: { key: userProfile.id } } });

      channel.on('presence', { event: 'sync' }, () => {
        syncRoomPresence(roomId, channel.presenceState() as Record<string, any>);
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

          const currentState = channel.presenceState() as Record<string, any>;
          const existingMembers = Object.entries(currentState).flatMap(([, entries]) => (Array.isArray(entries) ? entries : [entries]));
          
          for (const member of existingMembers) {
            const memberId = member.id;
            if (!memberId || memberId === userProfile.id) continue;
            if (peersRef.current.has(memberId)) continue;

            console.log(`[WebRTC] Creating initiating Peer for existing member ${memberId}`);
            const peer = new Peer({
              initiator: true,
              trickle: true,
              stream: processedStreamRef.current!,
              config: {
                iceServers: [
                  { urls: 'stun:stun.l.google.com:19302' },
                  { urls: 'stun:global.stun.twilio.com:3478' },
                  { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
                  { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
                ]
              }
            });

            peer.on('error', (err: any) => {
              console.error(`[WebRTC Error - Initiator] Peer error for ${memberId}:`, err);
            });

            peer.on('signal', (signalData: any) => {
              console.log(`[WebRTC] Generated signal (offer/candidate) for ${memberId}`, signalData);
              channel.send({
                type: 'broadcast',
                event: 'voice-signal',
                payload: { senderId: userProfile.id, targetId: memberId, type: 'offer', payload: signalData } as SignalPayload,
              });
            });

            peer.on('stream', (stream: MediaStream) => {
              console.log(`[WebRTC] Received remote stream from ${memberId}`);
              const audioEl = document.getElementById(`voice-audio-${memberId}`) as HTMLAudioElement | null;
              if (audioEl) {
                audioEl.srcObject = stream;
                audioEl.play().catch(e => console.error(`[WebRTC Error] Audio play failed for ${memberId}:`, e));
              } else {
                console.error(`[WebRTC Error] Audio element not found for ${memberId}`);
              }
            });

            peersRef.current.set(memberId, peer);
          }
        }
      });

      roomChannelRef.current = channel;
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
        setMicStatus('blocked');
      } else {
        setError(`Could not connect to voice room: ${err.message}`);
      }
    }
  };

  const leaveRoom = () => {
    if (activeRoomId && roomChannelRef.current) {
      roomChannelRef.current.untrack();
      supabase.removeChannel(roomChannelRef.current);
    }
    stopLocalStream();
    cleanupPeers();
    setActiveRoomId(null);
    setStatusMessage('No active room');
    setMicLevel(0);
    setMicStatus('unknown');
    roomChannelRef.current = null;
    setRooms(prev => prev.map(room => ({
      ...room,
      members: room.id === activeRoomId ? [] : room.members.filter(member => member.id !== userProfile.id),
    })));
  };

  const toggleMute = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = nextState; });
    }
    setMicStatus(nextState ? 'ready' : 'muted');
    setStatusMessage(nextState ? 'Mic live and audible' : 'Mic muted');
  };

  const kickMember = (memberId: string) => {
    if (!roomChannelRef.current) return;
    roomChannelRef.current.send({
      type: 'broadcast',
      event: 'voice-command',
      payload: { action: 'kick', userId: memberId },
    });
  };

  const availableRooms = rooms.filter((room) => {
    if (room.type === 'root') return isRootAdmin;
    if (room.type === 'family') return Boolean(familyId);
    return false;
  });

  const activeRoomUsers = activeRoomId ? (rooms.find(r => r.id === activeRoomId)?.members || []) : [];

  return (
    <div className="mb-6 rounded-xl border border-[#2A3942] bg-[#111B21] p-5">
      <div className="mb-5 flex items-center justify-between border-b border-[#2A3942] pb-4">
        <div className="flex items-center gap-2 text-[#E9EDEF]">
          <Radio className="w-5 h-5 text-[#00A884]" />
          <h3 className="text-base font-semibold">Voice Channels</h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNoiseCancellationOn(prev => !prev)}
            title={isNoiseCancellationOn ? 'Noise Cancellation ON' : 'Noise Cancellation OFF'}
            className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
              isNoiseCancellationOn ? 'border-[#00A884] bg-[#00A884]/10 text-[#00A884]' : 'border-[#2A3942] bg-[#1F2C34] text-[#8696A0]'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            NC {isNoiseCancellationOn ? 'ON' : 'OFF'}
          </button>

          <span className="inline-flex items-center gap-1.5 rounded border border-[#2A3942] bg-[#1F2C34] px-2.5 py-1 text-xs text-[#8696A0]">
            <span className={`h-2 w-2 rounded-full ${activeRoomId ? 'bg-[#00A884]' : 'bg-[#8696A0]'}`} />
            {activeRoomId ? 'Online' : 'Standby'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900/50 bg-red-900/20 px-3 py-2 text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-6 grid gap-3 grid-cols-2 md:grid-cols-4">
        <div className="rounded-lg border border-[#2A3942] bg-[#1F2C34] p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] text-[#8696A0] font-medium uppercase tracking-wide">
            <span>Microphone</span>
            {micStatus === 'ready' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00A884]" /> : micStatus === 'blocked' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> : <MicOff className="w-3.5 h-3.5 text-[#8696A0]" />}
          </div>
          <div className="flex items-center gap-2">
            {micStatus === 'ready' ? <Mic className="w-4 h-4 text-[#00A884]" /> : <MicOff className="w-4 h-4 text-[#8696A0]" />}
            <span className="text-sm font-semibold text-[#E9EDEF]">
              {micStatus === 'ready' ? 'Live' : micStatus === 'muted' ? 'Muted' : micStatus === 'blocked' ? 'Blocked' : 'Unknown'}
            </span>
          </div>
          <div className="mt-2.5 h-1 w-full rounded-full bg-[#2A3942] overflow-hidden">
            <div className="h-full rounded-full bg-[#00A884] transition-all duration-75" style={{ width: `${Math.max(0, micLevel)}%` }} />
          </div>
        </div>

        <div className={`rounded-lg border bg-[#1F2C34] p-3 transition-colors ${isNoiseCancellationOn ? 'border-[#00A884]/50' : 'border-[#2A3942]'}`}>
          <div className="mb-2 flex items-center justify-between text-[11px] text-[#8696A0] font-medium uppercase tracking-wide">
            <span>Noise Cancel</span>
            {isNoiseCancellationOn ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00A884]" /> : <VolumeX className="w-3.5 h-3.5 text-[#8696A0]" />}
          </div>
          <div className="flex items-center gap-2">
            <Wand2 className={`w-4 h-4 ${isNoiseCancellationOn ? 'text-[#00A884]' : 'text-[#8696A0]'}`} />
            <span className={`text-sm font-semibold ${isNoiseCancellationOn ? 'text-[#E9EDEF]' : 'text-[#8696A0]'}`}>
              {isNoiseCancellationOn ? 'RNNoise Active' : 'Off'}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-[#8696A0]">
            {isNoiseCancellationOn ? 'ML noise suppression' : 'Raw mic signal'}
          </div>
        </div>

        <div className="rounded-lg border border-[#2A3942] bg-[#1F2C34] p-3 flex flex-col justify-between">
          <div>
            <div className="mb-2 flex items-center justify-between text-[11px] text-[#8696A0] font-medium uppercase tracking-wide">
              <span>Speaker</span>
              {speakerStatus === 'ready' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00A884]" /> : speakerStatus === 'test' ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5 text-[#8696A0]" />}
            </div>
            <div className="flex items-center gap-2">
              {speakerStatus === 'ready' ? <Volume2 className="w-4 h-4 text-[#00A884]" /> : <VolumeX className="w-4 h-4 text-[#8696A0]" />}
              <span className="text-sm font-semibold text-[#E9EDEF]">
                {speakerStatus === 'ready' ? 'Working' : speakerStatus === 'test' ? 'Testing' : 'Unknown'}
              </span>
            </div>
          </div>
          <button onClick={playSpeakerTest} className="mt-2 text-[11px] text-blue-400 hover:text-blue-300 text-left">
            Test audio
          </button>
        </div>

        <div className="rounded-lg border border-[#2A3942] bg-[#1F2C34] p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] text-[#8696A0] font-medium uppercase tracking-wide">
            <span>Room Status</span>
            {activeRoomId ? <Users className="w-3.5 h-3.5 text-[#00A884]" /> : <AlertTriangle className="w-3.5 h-3.5 text-[#8696A0]" />}
          </div>
          <div className="text-sm font-semibold text-[#E9EDEF]">{activeRoomId ? `${activeRoomUsers.length} connected` : 'Not joined'}</div>
          <div className="mt-2 text-[10px] text-[#8696A0] truncate">{activeRoomId ? `In ${rooms.find(r => r.id === activeRoomId)?.label}` : 'Select a room below'}</div>
        </div>
      </div>

      {/* Room Listing */}
      <div className="grid gap-3 md:grid-cols-2">
        {availableRooms.map((room) => (
          <div key={room.id} className={`rounded-lg border p-4 transition-colors ${
            activeRoomId === room.id ? 'border-[#00A884] bg-[#00A884]/5' : 'border-[#2A3942] bg-[#1F2C34]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[#E9EDEF]">
                {room.type === 'root' ? <Crown className="w-4 h-4 text-[#00A884]" /> : <Users className="w-4 h-4" />}
                <h4 className="font-semibold text-sm">{room.label}</h4>
              </div>
              <div className="text-xs text-[#8696A0]">{room.members.length} listening</div>
            </div>

            <div className="mb-4 min-h-[40px] flex flex-wrap gap-2">
              {room.members.length === 0 ? (
                <span className="text-xs text-[#8696A0] italic">Empty room</span>
              ) : (
                room.members.map((member) => (
                  <div key={member.id} className="relative group flex items-center gap-1.5 rounded-full border border-[#2A3942] bg-[#111B21] px-2 py-1">
                    <img src={member.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} alt={member.name} className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-xs text-[#E9EDEF]">{member.name.split(' ')[0]}</span>
                    {member.isMuted ? <MicOff className="w-3 h-3 text-[#8696A0]" /> : <Mic className="w-3 h-3 text-[#00A884]" />}
                    {isRootAdmin && activeRoomId === room.id && member.id !== userProfile.id && (
                      <button onClick={() => kickMember(member.id)} className="ml-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                        <PhoneOff className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              {activeRoomId === room.id ? (
                <>
                  <button onClick={toggleMute} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isMicOn ? 'bg-[#2A3942] text-[#E9EDEF] hover:bg-[#2A3942]/80' : 'bg-red-900/40 text-red-400 hover:bg-red-900/60'
                  }`}>
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    {isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                  </button>
                  <button onClick={leaveRoom} className="flex-1 flex items-center justify-center gap-2 bg-red-600/10 text-red-400 border border-red-900/50 hover:bg-red-600/20 py-2 rounded-lg text-sm font-semibold transition-colors">
                    <PhoneOff className="w-4 h-4" /> Disconnect
                  </button>
                </>
              ) : (
                <button onClick={() => joinRoom(room.id)} disabled={activeRoomId !== null} className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeRoomId !== null ? 'opacity-50 cursor-not-allowed bg-[#2A3942] text-[#8696A0]' : 'bg-[#00A884] text-white hover:bg-[#06CF9C]'
                }`}>
                  <Radio className="w-4 h-4" /> Join Room
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div id="audio-container" className="hidden">
        {activeRoomUsers.filter(u => u.id !== userProfile.id).map(user => (
          <audio key={user.id} id={`voice-audio-${user.id}`} autoPlay playsInline />
        ))}
      </div>
    </div>
  );
};
