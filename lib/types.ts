export type MemberRank = 'Leader' | 'High Command' | 'Officer' | 'Member' | 'Recruit';
export type MemberStatus = 'Active' | 'On Leave' | 'Inactive';
export type GameType = 'GTA V RP' | 'ETS2 Convoy' | 'TruckersMP' | 'Other';
export type EventStatus = 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';

export interface Member {
  id: string;
  name: string;
  discordTag: string;
  ingameId: string;
  rank: MemberRank;
  status: MemberStatus;
  strikes: number;
  xp: number;
  joinedDate: string;
}

export interface EventSlot {
  id: string;
  roleName: string;
  claimedByName?: string;
  claimedById?: string;
}

export interface ConvoyEvent {
  id: string;
  title: string;
  game: GameType;
  eventDate: string;
  routeDetails: string;
  imageUrl?: string;
  status: EventStatus;
  slots: EventSlot[];
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  ingameId: string;
  rank: MemberRank;
  discordTag: string;
  bio: string;
  xp: number;
  createdAt?: string;
}

export interface PresenceState {
  onlineAt: string;
  userId?: string;
  name?: string;
  avatar?: string;
}

