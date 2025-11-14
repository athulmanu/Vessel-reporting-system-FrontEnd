export type UserRole = 'admin' | 'crew';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  assignedVesselIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

