'use client';
import { useEffect, useRef } from 'react';

interface VoiceRoomProps {
  roomID: string;
  userID: string;
  userName: string;
  onLeave?: () => void;
}

export default function VoiceRoom({ roomID, userID, userName, onLeave }: VoiceRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);

  useEffect(() => {
    const startVoiceChat = async () => {
      // 1. Dynamically import ZegoCloud to avoid SSR issues
      const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');

      // 2. Add API details from env
      const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '';
      
      // 3. Generate Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID, 
        serverSecret, 
        roomID, 
        userID, 
        userName
      );

      // 4. Initialize Room
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;
      
      zp.joinRoom({
        container: containerRef.current,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 50,
        layout: "Sidebar",
        showLayoutButton: true,
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
          config: {
            role: "Host",
          },
        },
        onLeaveRoom: () => {
          if (onLeave) onLeave();
        }
      });
    };

    if (containerRef.current) {
      startVoiceChat();
    }
    
    return () => {
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (e) {
          console.error("Error destroying Zego room", e);
        }
      }
    };
  }, [roomID, userID, userName, onLeave]);

  return (
    <div className="w-full flex flex-col items-center mt-6">
      <div className="w-full flex justify-between items-center mb-2 px-2">
         <h2 className="text-[#E9EDEF] text-lg font-bold">Live Room: {roomID}</h2>
      </div>
      {/* Container for ZegoCloud UI */}
      <div 
        ref={containerRef} 
        className="w-full h-[80vh] min-h-[600px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700"
      ></div>
    </div>
  );
}
