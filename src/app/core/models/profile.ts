export type ProfileStatus = 'draft' | 'published' | 'featured' | 'hidden' | 'blocked' | 'archived';
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface ProfilePhoto {
  _id?: string;
  url: string;
  publicId?: string;
  isPrimary?: boolean;
  caption?: string;
}

export interface MatrimonialProfile {
  _id: string;
  profileId: string;
  name: string;
  gender: Gender;
  dateOfBirth?: string;
  age?: number;
  profilePhoto?: string;
  photos: ProfilePhoto[];
  maritalStatus: MaritalStatus;
  height?: string;
  education?: string;
  occupation?: string;
  salary?: string;
  location?: string;
  district?: string;
  state?: string;
  religion?: string;
  community?: string;
  familyDetails?: string;
  about?: string;
  partnerExpectations?: string;
  contactVisibility: 'private' | 'public' | 'admin_only';
  phone?: string;
  email?: string;
  isFeatured: boolean;
  status: ProfileStatus;
  views: number;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  saved?: boolean;
  enquiryExists?: boolean;
  savedCount?: number;
  reportCount?: number;
}

export interface ProfileQuery {
  page?: number;
  limit?: number;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  location?: string;
  district?: string;
  state?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
  height?: string;
  profileId?: string;
  keyword?: string;
  category?: string;
  sort?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProfileListResponse {
  success: boolean;
  data: MatrimonialProfile[];
  pagination: Pagination;
}