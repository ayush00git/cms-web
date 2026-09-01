import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../context/auth-context';

function dashboardFor(position: string): string {
  if (position.startsWith('XEN')) return '/admin/xen';
  if (position.startsWith('AE'))  return '/admin/ae';
  if (position.startsWith('JE'))  return '/admin/je';
  return '/';
}

type AccessStatus = 'idle' | 'loading' | 'error' | 'no-token';

// AdminAccess is the page the emailed login link lands on. The explicit
// button keeps automated email link scanners from triggering the login;
// clicking it exchanges the link token for a session cookie, then redirects
// to the admin's dashboard.
export function AdminAccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<AccessStatus>(token ? 'idle' : 'no-token');
  const [message, setMessage] = useState(token ? '' : 'No login token found in the link.');

  const handleLogin = async () => {
    if (!token) return;
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`/api/auth/admin/access?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        const dest = dashboardFor(data.position ?? '');
        if (dest === '/') {
          setStatus('error');
          setMessage(`Unknown position "${data.position}" — contact admin.`);
        } else {
          refetch();
          navigate(dest, { replace: true });
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Login failed. The link may be expired or invalid.');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to connect to the server. Please try again.');
    }
  };

  return (
    <MainLayout>
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-16 min-h-[60vh]"
        style={{
          backgroundImage: `linear-gradient(rgba(17,17,17,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.06) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      >

        {/* Idle / Loading — ready to complete login */}
        {(status === 'idle' || status === 'loading') && (
          <div className="flex flex-col items-center gap-5 text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">Staff Portal Login</h2>
              <p className="text-gray-500 mt-1 text-sm">
                Continue to log in to your staff account.
              </p>
            </div>
            <button
              onClick={handleLogin}
              disabled={status === 'loading'}
              className={`inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-2.5 px-8 rounded-lg transition-colors text-sm active:scale-[0.98] ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {status === 'loading' && <Loader size="sm" color="white" />}
              {status === 'loading' ? 'Logging in…' : 'Log in to Portal'}
            </button>
          </div>
        )}

        {/* Error / No token */}
        {(status === 'error' || status === 'no-token') && (
          <div className="flex flex-col items-center gap-5 text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">Login Failed</h2>
              <p className="text-gray-500 mt-1 text-sm">{message}</p>
            </div>
            <Link
              to="/staff/login"
              className="bg-[#222222] hover:bg-[#111111] text-white font-bold py-2.5 px-8 rounded-lg transition-colors text-sm"
            >
              Request a New Link
            </Link>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
