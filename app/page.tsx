'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MemberRoster } from '@/components/MemberRoster';
import { EventScheduler } from '@/components/EventScheduler';
import { DiscordWebhookModal } from '@/components/DiscordWebhookModal';
import { MemberModal } from '@/components/MemberModal';
import { DeployGuide } from '@/components/DeployGuide';
import { Member, ConvoyEvent, EventSlot } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Shield, Users, Calendar, Award, Zap, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'roster' | 'events'>('roster');
  
  // Initial Mock State
  const [members, setMembers] = useState<Member[]>([
    {
      id: 'm-1',
      name: 'Rafay King',
      discordTag: 'rafay#0001',
      ingameId: 'BH-101',
      rank: 'Leader',
      status: 'Active',
      strikes: 0,
      xp: 1450,
      joinedDate: '2024-01-15',
    },
    {
      id: 'm-2',
      name: 'Imran Khan',
      discordTag: 'imran#1234',
      ingameId: 'BH-102',
      rank: 'High Command',
      status: 'Active',
      strikes: 0,
      xp: 1200,
      joinedDate: '2024-02-01',
    },
    {
      id: 'm-3',
      name: 'Daniyal Shah',
      discordTag: 'daniyal#9999',
      ingameId: 'BH-105',
      rank: 'Officer',
      status: 'Active',
      strikes: 1,
      xp: 850,
      joinedDate: '2024-03-10',
    },
    {
      id: 'm-4',
      name: 'Zain Malik',
      discordTag: 'zain#5544',
      ingameId: 'BH-112',
      rank: 'Member',
      status: 'Active',
      strikes: 0,
      xp: 420,
      joinedDate: '2024-04-18',
    },
    {
      id: 'm-5',
      name: 'Hamza Ali',
      discordTag: 'hamza#8811',
      ingameId: 'BH-120',
      rank: 'Recruit',
      status: 'On Leave',
      strikes: 2,
      xp: 180,
      joinedDate: '2024-05-02',
    },
  ]);

  const [events, setEvents] = useState<ConvoyEvent[]>([
    {
      id: 'e-1',
      title: 'Mega City Patrol & Cargo Convoy',
      game: 'GTA V RP',
      eventDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      routeDetails: 'Paleto Bay to Los Santos Port via Route 68',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      status: 'Upcoming',
      slots: [
        { id: 's-1', roleName: 'Lead Pilot / Lead Vehicle', claimedByName: 'Rafay King' },
        { id: 's-2', roleName: 'Heavy Cargo Driver', claimedByName: 'Imran Khan' },
        { id: 's-3', roleName: 'Escort Guard 1', claimedByName: 'Daniyal Shah' },
        { id: 's-4', roleName: 'Rear Sweeper' },
        { id: 's-5', roleName: 'General Member Slot' },
      ],
    },
    {
      id: 'e-2',
      title: 'Euro Truck Simulator 2 Highway Rally',
      game: 'ETS2 Convoy',
      eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      routeDetails: 'Berlin to Paris via Luxembourg (Sim 1)',
      imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80',
      status: 'Upcoming',
      slots: [
        { id: 's-21', roleName: 'Lead Convoy Captain', claimedByName: 'Imran Khan' },
        { id: 's-22', roleName: 'Heavy Cargo 100T' },
        { id: 's-23', roleName: 'Pilot Escort Vehicle' },
        { id: 's-24', roleName: 'Convoy Tail Guard' },
      ],
    },
  ]);

  // Modals state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedDiscordEvent, setSelectedDiscordEvent] = useState<ConvoyEvent | null>(null);

  // Fetch Supabase Data if configured
  useEffect(() => {
    if (supabase) {
      const client = supabase;
      const fetchSupabaseData = async () => {
        try {
          const { data: dbMembers } = await client.from('members').select('*');
          if (dbMembers && dbMembers.length > 0) {
            const formatted: Member[] = dbMembers.map((m: any) => ({
              id: m.id,
              name: m.name,
              discordTag: m.discord_tag,
              ingameId: m.ingame_id,
              rank: m.rank,
              status: m.status,
              strikes: m.strikes || 0,
              xp: m.xp || 100,
              joinedDate: m.joined_date || new Date().toISOString().split('T')[0],
            }));
            setMembers(formatted);
          }
        } catch (e) {
          console.warn('Supabase fetch error, using local state fallback');
        }
      };

      fetchSupabaseData();
    }
  }, []);

  // Handlers
  const handleAddMember = async (newMemData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...newMemData,
      id: `m-${Date.now()}`,
    };

    setMembers((prev) => [newMember, ...prev]);

    if (supabase) {
      await supabase.from('members').insert([
        {
          name: newMember.name,
          discord_tag: newMember.discordTag,
          ingame_id: newMember.ingameId,
          rank: newMember.rank,
          status: newMember.status,
          strikes: newMember.strikes,
          xp: newMember.xp,
        },
      ]);
    }
  };

  const handleUpdateMember = async (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    if (supabase) {
      await supabase.from('members').update(updates).eq('id', id);
    }
  };

  const handleDeleteMember = async (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));

    if (supabase) {
      await supabase.from('members').delete().eq('id', id);
    }
  };

  const handleClaimSlot = (eventId: string, slotId: string, username: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          return {
            ...ev,
            slots: ev.slots.map((s) =>
              s.id === slotId ? { ...s, claimedByName: username } : s
            ),
          };
        }
        return ev;
      })
    );
  };

  const handleUnclaimSlot = (eventId: string, slotId: string) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          return {
            ...ev,
            slots: ev.slots.map((s) =>
              s.id === slotId ? { ...s, claimedByName: undefined } : s
            ),
          };
        }
        return ev;
      })
    );
  };

  const handleCreateEvent = (
    newEventData: Omit<ConvoyEvent, 'id' | 'slots'>,
    slotRoles: string[]
  ) => {
    const newEvent: ConvoyEvent = {
      ...newEventData,
      id: `e-${Date.now()}`,
      slots: slotRoles.map((role, idx) => ({
        id: `s-${Date.now()}-${idx}`,
        roleName: role,
      })),
    };

    setEvents((prev) => [newEvent, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14]">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        memberCount={members.length}
        upcomingEventCount={events.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Overview Quick Stats Widget */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f1423] p-5 rounded-2xl border border-slate-800 flex items-center space-x-4 shadow-lg">
            <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Roster</p>
              <h4 className="text-2xl font-black text-white">{members.length} Members</h4>
            </div>
          </div>

          <div className="bg-[#0f1423] p-5 rounded-2xl border border-slate-800 flex items-center space-x-4 shadow-lg">
            <div className="p-3 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Upcoming Convoys</p>
              <h4 className="text-2xl font-black text-white">{events.length} Events</h4>
            </div>
          </div>

          <div className="bg-[#0f1423] p-5 rounded-2xl border border-slate-800 flex items-center space-x-4 shadow-lg">
            <div className="p-3 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Active Leaders</p>
              <h4 className="text-2xl font-black text-amber-300">
                {members.filter((m) => m.rank === 'Leader' || m.rank === 'High Command').length} HC
              </h4>
            </div>
          </div>

          <div className="bg-[#0f1423] p-5 rounded-2xl border border-slate-800 flex items-center space-x-4 shadow-lg">
            <div className="p-3 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Strikes Issued</p>
              <h4 className="text-2xl font-black text-rose-400">
                {members.reduce((acc, m) => acc + m.strikes, 0)} Total
              </h4>
            </div>
          </div>
        </div>

        {/* Tab View Switcher */}
        {activeTab === 'roster' && (
          <MemberRoster
            members={members}
            onAddMember={() => setShowMemberModal(true)}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        )}

        {activeTab === 'events' && (
          <EventScheduler
            events={events}
            onClaimSlot={handleClaimSlot}
            onUnclaimSlot={handleUnclaimSlot}
            onOpenDiscordModal={(event) => setSelectedDiscordEvent(event)}
            onCreateEvent={handleCreateEvent}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0d121f] py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-200">BHRP CORE Management Platform</span>
            <span>• Royal Kingdom Gaming</span>
          </div>
          <p className="text-slate-500 font-mono">Ready for Vercel & Supabase Free Hosting (0 PKR)</p>
        </div>
      </footer>

      {/* Modals */}
      {showMemberModal && (
        <MemberModal
          onClose={() => setShowMemberModal(false)}
          onAddMember={handleAddMember}
        />
      )}

      {selectedDiscordEvent && (
        <DiscordWebhookModal
          event={selectedDiscordEvent}
          onClose={() => setSelectedDiscordEvent(null)}
        />
      )}
    </div>
  );
}
