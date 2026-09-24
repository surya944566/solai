export interface User {
  _id: string;
  name: string;
  email?: string;
  mobile?: string;
  status: 'active' | 'blocked' | 'pending' | 'inactive';
  lastLoginAt?: Date;
  createdAt?: Date;
  isAdminCreated?: boolean;
  loginHistory?: Array<{ at: string; ip: string; userAgent: string }>;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
  status: 'active' | 'blocked';
  lastLoginAt?: Date;
  createdAt?: Date;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  adminContact?: {
    officeName: string;
    officePhone: string;
    officeAddress: string;
  };
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  admin: AdminUser;
}