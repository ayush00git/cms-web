import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader } from './Loader';
import { useAuth } from '../context/auth-context';

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader size="lg" color="dark" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
