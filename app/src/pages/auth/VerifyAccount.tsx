import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Loader } from '../../components/Loader';

type VerifyStatus = 'loading' | 'success' | 'error' | 'no-token';

const roleLoginRoute: Record<string, string> = {
  faculty:    '/faculty/login',
  warden:     '/warden/login',
  centrehead: '/centre-head/login',
};

export function VerifyAccount() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const token           = searchParams.get('token');

  const [status,    setStatus]    = useState<VerifyStatus>(token ? 'loading' : 'no-token');
  const [message,   setMessage]   = useState(token ? '' : 'No verification token found in the link.');
  const [countdown, setCountdown] = useState(3);

  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    // cancel any previous in-flight request (StrictMode double-invoke)
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
      method: 'GET',
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();

        if (res.ok) {
          const route = roleLoginRoute[data.role as string];

          setStatus('success');
          setMessage(data.success || 'Account verified successfully!');

          if (!route) {
            // role unknown — don't auto-redirect, leave user on the success screen
            return;
          }

          let secs = 3;
          intervalRef.current = setInterval(() => {
            secs -= 1;
            setCountdown(secs);
            if (secs <= 0) {
              clearInterval(intervalRef.current!);
              navigate(route);
            }
          }, 1000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. The link may be expired or invalid.');
        }
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return; // cancelled — ignore
        setStatus('error');
        setMessage('Failed to connect to the server. Please try again.');
      });

    return () => {
      controller.abort();
      if (intervalRef.current) clearInterval(intervalRef.current);
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
            <p className="text-gray-500 font-medium">Verifying your account, please wait…</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-5 text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">You're Verified!</h2>
              <p className="text-gray-500 mt-1 text-sm">{message}</p>
            </div>
            <p className="text-sm text-gray-400">
              Redirecting to login in <span className="font-bold text-[#111111]">{countdown}s</span>…
            </p>
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
              <h2 className="text-2xl font-extrabold text-gray-800">Verification Failed</h2>
              <p className="text-gray-500 mt-1 text-sm">{message}</p>
            </div>
            <Link
              to="/"
              className="bg-[#222222] hover:bg-[#111111] text-white font-bold py-2.5 px-8 rounded-lg transition-colors text-sm"
            >
              Back to Home
            </Link>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
