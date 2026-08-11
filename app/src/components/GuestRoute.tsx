import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader } from './Loader';

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          setIsAuth(false);
          return;
        }
        setIsAuth(true);
      })
      .catch(() => setIsAuth(false));
  }, []);

  if (isAuth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader size="lg" color="dark" />
      </div>
    );
  }

  if (isAuth) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
