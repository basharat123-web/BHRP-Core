'use client';

import React, { useState } from 'react';
import { Send, Copy, Check, X, Radio, Sparkles, ExternalLink } from 'lucide-react';
import { ConvoyEvent } from '@/lib/types';

interface DiscordWebhookModalProps {
  event: ConvoyEvent;
  onClose: () => void;
}

export const DiscordWebhookModal: React.FC<DiscordWebhookModalProps> = ({ event, onClose }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Generate Discord Webhook Payload
  const payload = {
    content: "📢 **BHRP CONVOY & RP EVENT ANNOUNCEMENT** @everyone",
    embeds: [
      {
        title: `🚨 ${event.title}`,
        description: `**Game**: ${event.game}\n**Route**: ${event.routeDetails}\n**Date & Time**: ${new Date(event.eventDate).toLocaleString()}`,
        color: 3447003, // Indigo hex color in integer
        fields: event.slots.map((slot) => ({
          name: slot.roleName,
          value: slot.claimedByName ? `✅ ${slot.claimedByName}` : '❌ Open Slot',
          inline: true,
        })),
        image: {
          url: event.imageUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
        },
        footer: {
          text: 'BHRP Core Management System • Powered by Next.js & Supabase',
        },
      },
    ],
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWebhook = async () => {
    if (!webhookUrl.startsWith('http')) {
      setStatusMessage('Please enter a valid Discord Webhook URL (starts with https://discord.com/api/webhooks/...)');
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 204) {
        setStatusMessage('✅ Announcement successfully posted to Discord!');
      } else {
        setStatusMessage(`Failed to send (HTTP ${res.status}). Check webhook URL permissions.`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Could not connect to Discord API'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0f1423] border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Discord Webhook Embed Generator</h3>
            <p className="text-xs text-slate-400">Post live formatted convoy announcements to your Discord channels</p>
          </div>
        </div>

        {/* Live Discord Embed Visual Preview */}
        <div className="bg-[#2b2d31] p-4 rounded-xl border border-slate-700 space-y-3 font-sans">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#5865f2] bg-[#5865f2]/10 px-2 py-0.5 rounded">
              Discord Embed Live Preview
            </span>
          </div>

          <div className="border-l-4 border-indigo-500 bg-[#313338] p-3.5 rounded space-y-2">
            <h4 className="text-sm font-bold text-white">🚨 {event.title}</h4>
            <p className="text-xs text-slate-300 whitespace-pre-line">
              <strong>Game:</strong> {event.game}{'\n'}
              <strong>Route:</strong> {event.routeDetails}{'\n'}
              <strong>Time:</strong> {new Date(event.eventDate).toLocaleString()}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
              {event.slots.slice(0, 4).map((slot) => (
                <div key={slot.id} className="text-[11px]">
                  <span className="text-slate-400 block font-semibold">{slot.roleName}</span>
                  <span className={slot.claimedByName ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                    {slot.claimedByName ? `✅ ${slot.claimedByName}` : '❌ Open'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Form: Webhook URL & Send */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Discord Webhook URL (Optional for instant auto-post):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSendWebhook}
              disabled={isSending}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Post to Discord'}</span>
            </button>
          </div>

          {statusMessage && (
            <p className="text-xs text-cyan-300 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-800/40 font-mono">
              {statusMessage}
            </p>
          )}
        </div>

        {/* Copy JSON Payload Option */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopyJSON}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 px-3 py-2 rounded-lg border border-slate-800"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Payload!' : 'Copy JSON for n8n / Bot'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
