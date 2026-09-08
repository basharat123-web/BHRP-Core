import VoiceRoom from '@/components/VoiceRoom';

export default function ConvoyPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 flex justify-center items-center">
       <div className="w-full max-w-7xl">
          <VoiceRoom roomID="ets2-daily-convoy" />
       </div>
    </div>
  );
}
