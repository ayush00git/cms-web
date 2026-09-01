import { createContext, useContext } from 'react';

export interface ProfileData {
  name?: string;
  email?: string;
  is_verified?: boolean;
  phone_number?: string;
  department?: string;
  house_number?: string;
  block?: string;
  type?: string;
  hostel?: string;
  building?: string;
  /** Only present for admin (XEN / AE / JE) sessions. */
  position?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'rate-limited' | 'error';

export interface AuthState {
  profile: ProfileData | null;
  status: AuthStatus;
  errorMessage: string | null;
  /** Re-fetches /api/profile from scratch. */
  refetch: () => void;
  /** Merges a patch into the cached profile without hitting the network again. */
  patchProfile: (patch: Partial<ProfileData>) => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
