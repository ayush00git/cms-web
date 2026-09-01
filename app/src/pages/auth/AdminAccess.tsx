import { useEffect, useRef, useState } from 'react';
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

type AccessStatus = 'loading' | 'error' | 'no-token';

// AdminAccess is the page the emailed login link lands on. It completes the
// passwordless login on mount: exchanges the link token for a session cookie
// and jumps straight to the admin's dashboard.
export function AdminAccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<AccessStatus>(token ? 'loading' : 'no-token');
  const [message, setMessage] = useState(token ? '' : 'No login token found in the link.');

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    // cancel any previous in-flight request (StrictMode double-invoke)
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    fetch(`/api/auth/admin/access?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();

        if (res.ok) {
          const dest = dashboardFor(data.position ?? '');
          if (dest === '/') {
            setStatus('error');
            setMessage(`Unknown position "${data.position}" — contact admin.`);
            return;
          }
          refetch();
          navigate(dest, { replace: true });
        } else {
          setStatus('error');
          setMessage(data.error || 'Login failed. The link may be expired or invalid.');
        }
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return; // cancelled — ignore
        setStatus('error');
        setMessage('Failed to connect to the server. Please try again.');
      });

    return () => {
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — token never changes after the page loads

  return (
    <MainLayout>
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-16 min-h-[60vh]"
        style={{
          backgroundImage: `linear-gradient(rgba(17,17,17,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.06) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      >

        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-5 text-center">
            <Loader size="xl" color="dark" className="w-16 h-16" />
            <p className="text-gray-500 font-medium">Logging you in, please wait…</p>
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
