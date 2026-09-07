'use client';

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Truck, ShieldCheck, Plus, Share2, CheckCircle2, UserCheck, AlertCircle, Sparkles, X } from 'lucide-react';
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
    <div className="space-y-6 text-[#E9EDEF] font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1F2C34] p-5 sm:p-6 rounded-xl border border-[#2A3942]">
        <div>
          <h2 className="text-xl font-bold text-[#E9EDEF] flex items-center gap-3">
            <span>Convoy & Event Scheduler</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#00A884]/10 text-[#00A884] font-semibold border border-[#00A884]/20">
              Slot System Active
            </span>
          </h2>
          <p className="text-[#8696A0] text-sm mt-1">
            Organize GTA V RP patrols & ETS2 convoys with role slots and automated Discord embeds.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 rounded bg-[#00A884] hover:bg-[#06CF9C] text-white font-semibold text-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-[#1F2C34] rounded-xl border border-[#2A3942] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors hover:border-[#00A884]/50"
          >
            {/* Event Banner Image Column */}
            <div className="lg:col-span-4 relative min-h-[200px] bg-[#111B21] border-r border-[#2A3942] overflow-hidden">
              <img
                src={event.imageUrl || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80'}
                alt={event.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111B21] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#111B21]" />
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#111B21]/80 text-[#E9EDEF] border border-[#2A3942] backdrop-blur">
                  {event.game}
                </span>
                <span className="px-2.5 py-1 rounded text-[10px] font-semibold bg-[#00A884]/20 text-[#00A884] border border-[#00A884]/30 backdrop-blur">
                  {event.status}
                </span>
              </div>
            </div>

            {/* Event Details & Slots Column */}
            <div className="lg:col-span-8 p-5 sm:p-6 space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-[#E9EDEF]">{event.title}</h3>
                  
                  {/* Share to Discord Webhook Button */}
                  <button
                    onClick={() => onOpenDiscordModal(event)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded bg-[#111B21] hover:bg-[#2A3942] border border-[#2A3942] text-[#8696A0] hover:text-[#E9EDEF] text-xs font-semibold transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Discord Embed</span>
                  </button>
                </div>

                {/* Event Metadata (Date, Time, Route) */}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-[#8696A0]">
                  <div className="flex items-center space-x-1.5 bg-[#111B21] px-2.5 py-1.5 rounded border border-[#2A3942]">
                    <Clock className="w-4 h-4 text-[#00A884]" />
                    <span>{new Date(event.eventDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-[#111B21] px-2.5 py-1.5 rounded border border-[#2A3942]">
                    <MapPin className="w-4 h-4 text-[#E9EDEF]" />
                    <span>{event.routeDetails}</span>
                  </div>
                </div>
              </div>

              {/* Role Slots Section */}
              <div className="space-y-3 pt-4 border-t border-[#2A3942]">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#8696A0] flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    <span>Role Slots ({event.slots.filter(s => s.claimedByName).length}/{event.slots.length})</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {event.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded border transition-colors flex items-center justify-between ${
                        slot.claimedByName
                          ? 'bg-[#00A884]/10 border-[#00A884]/30'
                          : 'bg-[#111B21] border-[#2A3942]'
                      }`}
                    >
                      <div>
                        <p className={`text-xs font-semibold ${slot.claimedByName ? 'text-[#00A884]' : 'text-[#E9EDEF]'}`}>{slot.roleName}</p>
                        {slot.claimedByName ? (
                          <p className="text-[10px] text-[#8696A0] mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#00A884]" />
                            <span>{slot.claimedByName}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-[#8696A0] mt-0.5">Available</p>
                        )}
                      </div>

                      {slot.claimedByName ? (
                        <button
                          onClick={() => onUnclaimSlot(event.id, slot.id)}
                          className="px-2 py-1 rounded text-[10px] font-semibold text-[#8696A0] hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        >
                          Release
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveClaimTarget({ eventId: event.id, slotId: slot.id })}
                          className="px-3 py-1.5 rounded text-xs font-semibold bg-[#2A3942] hover:bg-[#00A884] text-[#E9EDEF] hover:text-white transition-colors"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center py-12 bg-[#1F2C34] rounded-xl border border-[#2A3942]">
            <Calendar className="w-12 h-12 text-[#8696A0] mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-[#E9EDEF]">No scheduled events</h3>
            <p className="text-sm text-[#8696A0]">Click "Schedule Event" to create a new convoy patrol.</p>
          </div>
        )}
      </div>

      {/* Claim Slot Modal Overlay */}
      {activeClaimTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1F2C34] border border-[#2A3942] rounded-xl w-full max-w-sm p-5 sm:p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-[#00A884]" />
              <h3 className="text-lg font-bold text-[#E9EDEF]">Claim Role Slot</h3>
            </div>
            
            <p className="text-[#8696A0] text-sm mb-4">
              Enter your member name or callsign to lock this slot.
            </p>

            <input
              type="text"
              placeholder="e.g. Ghost_Leader or BH-101"
              value={claimNameInput}
              onChange={(e) => setClaimNameInput(e.target.value)}
              className="w-full bg-[#111B21] border border-[#2A3942] rounded px-4 py-2.5 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884] mb-5"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleClaimConfirm()}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setActiveClaimTarget(null)}
                className="flex-1 px-4 py-2 rounded bg-[#111B21] border border-[#2A3942] text-[#8696A0] hover:text-[#E9EDEF] font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClaimConfirm}
                disabled={!claimNameInput.trim()}
                className="flex-1 px-4 py-2 rounded bg-[#00A884] hover:bg-[#06CF9C] text-white font-semibold text-sm disabled:opacity-50 transition-colors"
              >
                Confirm Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1F2C34] border border-[#2A3942] rounded-xl w-full max-w-2xl my-8 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-[#2A3942] bg-[#111B21]">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#00A884]" />
                <h3 className="text-lg font-bold text-[#E9EDEF]">Schedule New Event</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[#8696A0] hover:text-[#E9EDEF] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-[#8696A0] font-semibold uppercase tracking-wide">Event Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Operation Desert Storm"
                    className="w-full bg-[#111B21] border border-[#2A3942] rounded px-3 py-2 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-[#8696A0] font-semibold uppercase tracking-wide">Game / Platform</label>
                  <select
                    value={game}
                    onChange={(e) => setGame(e.target.value as GameType)}
                    className="w-full bg-[#111B21] border border-[#2A3942] rounded px-3 py-2 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884] appearance-none"
                  >
                    <option value="GTA V RP">GTA V RP</option>
                    <option value="ETS2">ETS2</option>
                    <option value="Arma 3">Arma 3</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-[#8696A0] font-semibold uppercase tracking-wide">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#111B21] border border-[#2A3942] rounded px-3 py-2 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-[#8696A0] font-semibold uppercase tracking-wide">Banner Image URL (Optional)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#111B21] border border-[#2A3942] rounded px-3 py-2 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#8696A0] font-semibold uppercase tracking-wide">Route / Mission Details</label>
                <textarea
                  value={routeDetails}
                  onChange={(e) => setRouteDetails(e.target.value)}
                  placeholder="e.g. Start at Paleto Bay, escort cargo to LS Docks."
                  rows={3}
                  className="w-full bg-[#111B21] border border-[#2A3942] rounded px-3 py-2 text-[#E9EDEF] text-sm focus:outline-none focus:border-[#00A884] resize-none"
                />
              </div>

              {/* Slot Customization */}
              <div className="space-y-3 pt-4 border-t border-[#2A3942]">
                <label className="text-[11px] text-[#8696A0] font-semibold uppercase tracking-wide flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Define Role Slots
                </label>
                <p className="text-xs text-[#8696A0]">Edit the names of the required convoy roles.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {customSlots.map((slot, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={slot}
                        onChange={(e) => {
                          const newSlots = [...customSlots];
                          newSlots[index] = e.target.value;
                          setCustomSlots(newSlots);
                        }}
                        className="flex-1 bg-[#111B21] border border-[#2A3942] rounded px-3 py-1.5 text-[#E9EDEF] text-xs focus:outline-none focus:border-[#00A884]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customSlots.length <= 1) return;
                          setCustomSlots(customSlots.filter((_, i) => i !== index));
                        }}
                        className="p-1.5 rounded bg-red-900/40 text-red-400 hover:bg-red-900/60 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => setCustomSlots([...customSlots, `New Slot ${customSlots.length + 1}`])}
                  className="mt-2 text-xs font-semibold text-[#00A884] hover:text-[#06CF9C] flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Slot
                </button>
              </div>

              <div className="pt-5 border-t border-[#2A3942] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded bg-[#111B21] border border-[#2A3942] text-[#E9EDEF] font-semibold text-sm hover:bg-[#2A3942] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title || !eventDate}
                  className="px-5 py-2.5 rounded bg-[#00A884] hover:bg-[#06CF9C] text-white font-semibold text-sm disabled:opacity-50 transition-colors"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
