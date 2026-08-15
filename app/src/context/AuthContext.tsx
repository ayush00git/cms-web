import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './auth-context';
import type { AuthStatus, ProfileData } from './auth-context';

// AuthProvider fetches /api/profile exactly once for the whole app and shares
// the result via context. Every component that previously fetched /api/profile
// on its own (Navbar, Footer, Landing, GuestRoute, Profile) reads from here
// instead, so a single page load makes one request, not five.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setStatus('loading');
    setErrorMessage(null);
    fetch('/api/profile', { credentials: 'include' })
      .then(async (res) => {
        if (res.status === 429) {
          const b = await res.json().catch(() => ({}));
          setErrorMessage(b.error ?? "You've hit the rate limit. Please try again in a moment.");
          setStatus('rate-limited');
          return null;
        }
        if (!res.ok) {
          setProfile(null);
          setStatus('unauthenticated');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setProfile(data);
          setStatus('authenticated');
        }
      })
      .catch(() => {
        setErrorMessage('Failed to reach the server.');
        setStatus('error');
      });
  }, []);

  const patchProfile = useCallback((patch: Partial<ProfileData>) => {
    setProfile((prev) => prev ? { ...prev, ...patch } : prev);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return (
    <AuthContext.Provider value={{ profile, status, errorMessage, refetch, patchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
