export type EnquiryStatus =
  | 'pending'
  | 'contacted'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'closed'
  | 'cancelled';

export interface Enquiry {
  _id: string;
  user: string | { _id: string; name: string; email?: string; mobile?: string };
  profile:
    | string
    | {
        _id: string;
        profileId: string;
        name: string;
        gender: string;
        age?: number;
        location?: string;
        education?: string;
        occupation?: string;
        maritalStatus?: string;
        profilePhoto?: string;
      };
  message?: string;
  status: EnquiryStatus;
  adminReply?: string;
  repliedAt?: Date;
  internalNotes?: string;
  history?: Array<{ status: string; note?: string; at: string }>;
  createdAt?: Date;
}

export interface SupportConversation {
  _id: string;
  user: string | { _id: string; name: string; email?: string; mobile?: string };
  status: 'open' | 'closed' | 'blocked';
  subject?: string;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  unreadForUser: number;
  unreadForAdmin: number;
  internalNotes?: string;
  createdAt?: Date;
}

export interface SupportMessage {
  _id: string;
  conversation: string;
  sender: 'user' | 'admin';
  senderName?: string;
  body: string;
  readByUser: boolean;
  readByAdmin: boolean;
  createdAt?: Date;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  createdAt?: Date;
}

export interface SiteSettings {
  [key: string]: unknown;
}