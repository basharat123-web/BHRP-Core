'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Truck, ShieldCheck, Plus, Share2, CheckCircle2, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { ConvoyEvent, EventSlot, GameType } from '@/lib/types';

interface EventSchedulerProps {
  events: ConvoyEvent[];
  onClaimSlot: (eventId: string, slotId: string, username: string) => void;
  onUnclaimSlot: (eventId: string, slotId: string) => void;
  onOpenDiscordModal: (event: ConvoyEvent) => void;
  onCreateEvent: (newEvent: Omit<ConvoyEvent, 'id' | 'slots'>, slots: string[]) => void;
}

export const EventScheduler: React.FC<EventSchedulerProps> = ({
  events,
  onClaimSlot,
  onUnclaimSlot,
  onOpenDiscordModal,
  onCreateEvent,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [claimNameInput, setClaimNameInput] = useState('');
  const [activeClaimTarget, setActiveClaimTarget] = useState<{ eventId: string; slotId: string } | null>(null);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [game, setGame] = useState<GameType>('GTA V RP');
  const [eventDate, setEventDate] = useState('');
  const [routeDetails, setRouteDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [customSlots, setCustomSlots] = useState<string[]>([
    'Lead Pilot / Lead Vehicle',
    'Heavy Cargo Driver',
    'Escort Guard 1',
    'Escort Guard 2',
    'Rear Sweeper',
    'General Convoy Member'
  ]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate) return;

    onCreateEvent(
      {
        title,
        game,
        eventDate,
        routeDetails: routeDetails || 'Detailed route map provided in Discord voice chat',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
        status: 'Upcoming',
      },
      customSlots
    );

    setTitle('');
    setRouteDetails('');
    setImageUrl('');
    setShowCreateModal(false);
  };

  const handleClaimConfirm = () => {
    if (!activeClaimTarget || !claimNameInput.trim()) return;
    onClaimSlot(activeClaimTarget.eventId, activeClaimTarget.slotId, claimNameInput.trim());
    setActiveClaimTarget(null);
    setClaimNameInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>Convoy & Event Scheduler</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              Slot System Active
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Organize GTA V RP patrols & ETS2 convoys with role slots and automated Discord embeds.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Schedule Convoy Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-[#0f1423] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl transition hover:border-slate-700 grid grid-cols-1 lg:grid-cols-12"
          >
            {/* Event Banner Image Column */}
            <div className="lg:col-span-4 relative min-h-[220px] bg-slate-900 overflow-hidden">
              <img
                src={event.imageUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80'}
                alt={event.title}
                className="w-full h-full object-cover opacity-80 hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1423] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0f1423]" />
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md">
                  {event.game}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                  {event.status}
                </span>
              </div>
            </div>

            {/* Event Details & Slots Column */}
            <div className="lg:col-span-8 p-6 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-white tracking-wide">{event.title}</h3>
                  
                  {/* Share to Discord Webhook Button */}
                  <button
                    onClick={() => onOpenDiscordModal(event)}
                    className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 text-xs font-semibold shadow-md transition"
                  >
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <span>Generate Discord Embed</span>
                  </button>
                </div>

                {/* Event Metadata (Date, Time, Route) */}
                <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-300">
                  <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>{new Date(event.eventDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>{event.routeDetails}</span>
                  </div>
                </div>
              </div>

              {/* Role Slots Section */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <span>Claim Convoy Role Slots ({event.slots.filter(s => s.claimedByName).length} / {event.slots.length} Claimed)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {event.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-xl border transition flex items-center justify-between ${
                        slot.claimedByName
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold text-white">{slot.roleName}</p>
                        {slot.claimedByName ? (
                          <p className="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Claimed by: <strong>{slot.claimedByName}</strong></span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">Slot Available</p>
                        )}
                      </div>

                      {slot.claimedByName ? (
                        <button
                          onClick={() => onUnclaimSlot(event.id, slot.id)}
                          className="px-2 py-1 rounded text-[10px] font-bold bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                        >
                          Release
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveClaimTarget({ eventId: event.id, slotId: slot.id })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
                        >
                          Claim Slot
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Claim Slot Input Modal */}
      {activeClaimTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f1423] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <span>Claim Convoy Role Slot</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter your Name or In-Game ID (e.g. Imran / BH-102) to lock this role.
            </p>

            <input
              type="text"
              placeholder="Your Name or In-Game ID..."
              value={claimNameInput}
              onChange={(e) => setClaimNameInput(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              autoFocus
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setActiveClaimTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleClaimConfirm}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg"
              >
                Confirm Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f1423] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Schedule New Convoy Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Black Hawk Weekly Convoy Patrol"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Game *</label>
                  <select
                    value={game}
                    onChange={(e) => setGame(e.target.value as GameType)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GTA V RP">GTA V RP</option>
                    <option value="ETS2 Convoy">ETS2 Convoy</option>
                    <option value="TruckersMP">TruckersMP</option>
                    <option value="Other">Other Game</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Route & Server Details</label>
                <input
                  type="text"
                  placeholder="e.g. Paleto Bay to Sandy Shores via Route 68"
                  value={routeDetails}
                  onChange={(e) => setRouteDetails(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
