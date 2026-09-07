export type MemberRank = 'Leader' | 'High Command' | 'Officer' | 'Member' | 'Recruit';
export type MemberStatus = 'Active' | 'On Leave' | 'Inactive';
export type GameType = 'GTA V RP' | 'ETS2 Convoy' | 'TruckersMP' | 'Other';
export type EventStatus = 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';

export type AccountType = 'Unassigned' | 'Member' | 'Family Leader' | 'Root Admin';
export type ApplicationStatus = 'None' | 'Pending' | 'Approved' | 'Rejected';
export type OrganizationStatus = 'Pending Approval' | 'Approved' | 'Rejected';

export interface Organization {
  id: string;
  name: string;
  tag: string;
  logoUrl?: string;
  description?: string;
  status: OrganizationStatus;
  createdAt?: string;
}

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
  orgId?: string;
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
  accountType: AccountType;
  isRootAdmin: boolean;
  isBlocked?: boolean;
  currentFamilyId?: string;
  currentFamilyName?: string;
  appliedFamilyId?: string;
  applicationStatus?: ApplicationStatus;
  discordTag: string;
  bio: string;
  xp: number;
  createdAt?: string;
}

export interface FamilyApplication {
  id: string;
  userId: string;
  familyId: string;
  familyName?: string;
  applicantName: string;
  applicantEmail: string;
  discordTag: string;
  ingameId: string;
  message?: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  senderName: string;
  senderRank: string;
  ingameId: string;
  avatarUrl?: string;
  text: string;
  messageType?: 'global' | 'family' | 'direct';
  familyId?: string;
  recipientId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PresenceState {
  onlineAt: string;
  userId?: string;
  name?: string;
  avatar?: string;
}
