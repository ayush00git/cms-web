import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Loader } from '../../components/Loader';

type AccessStatus = 'idle' | 'loading' | 'error' | 'no-token';

// SuperAdminAccess is where the emailed magic link lands. Clicking the
// button exchanges the token for a session cookie and opens the dashboard.
export function SuperAdminAccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<AccessStatus>(token ? 'idle' : 'no-token');
  const [message, setMessage] = useState(token ? '' : 'No access token found in the link.');

  const handleLogin = async () => {
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch(`/api/superadmin/access?token=${encodeURIComponent(token)}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/superadmin', { replace: true });
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 min-h-[60vh]">
        {(status === 'idle' || status === 'loading') && (
          <div className="flex flex-col items-center gap-5 text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-[#ff9900]" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">Super Admin Access</h2>
              <p className="text-gray-500 mt-1 text-sm">Continue to open the oversight dashboard.</p>
            </div>
            <button
              onClick={handleLogin}
              disabled={status === 'loading'}
              className={`inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-2.5 px-8 rounded-lg transition-colors text-sm active:scale-[0.98] ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {status === 'loading' && <Loader size="sm" color="white" />}
              {status === 'loading' ? 'Logging in…' : 'Open Dashboard'}
            </button>
          </div>
        )}

        {(status === 'error' || status === 'no-token') && (
          <div className="flex flex-col items-center gap-5 text-center max-w-sm">
            <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800">Access Failed</h2>
              <p className="text-gray-500 mt-1 text-sm">{message}</p>
            </div>
            <Link to="/superadmin/login" className="bg-[#222222] hover:bg-[#111111] text-white font-bold py-2.5 px-8 rounded-lg transition-colors text-sm">
              Request a New Link
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
