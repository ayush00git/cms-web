import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';

const roleToApi: Record<string, string> = {
  faculty: '/api/auth/faculty/reset-password',
  warden: '/api/auth/warden/reset-password',
  centrehead: '/api/auth/centrehead/reset-password',
};

const roleToLoginPath: Record<string, string> = {
  faculty: '/faculty/login',
  warden: '/warden/login',
  centrehead: '/centre-head/login',
};

function decodeTokenRole(token: string): string | null {
  try {
    const base64url = token.split('.')[1];
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const payload = JSON.parse(atob(padded));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function AccountResetPass() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  const userToken = searchParams.get('user');
  const role = userToken ? decodeTokenRole(userToken) : null;
  const apiUrl = role ? roleToApi[role] : null;
  const loginPath = role ? roleToLoginPath[role] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (!userToken || !apiUrl) {
      setStatus('error');
      setMessage('Invalid or missing reset token.');
      return;
    }

    setLoading(true);
    setStatus(null);
    setMessage('');

    try {
      const response = await fetch(`${apiUrl}?user=${encodeURIComponent(userToken)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.success || 'Password reset successfully! Redirecting...');
        setTimeout(() => navigate(loginPath!), 1500);
      } else {
        setStatus('error');
        const errorMsg = data.error || Object.values(data)[0] || 'An error occurred';
        setMessage(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch {
      setStatus('error');
      setMessage('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userToken || !apiUrl) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="w-full max-w-md bg-white border border-gray-200 shadow-md rounded-lg p-6 text-center">
            <p className="text-rose-600 font-semibold">Invalid or expired reset link. Please request a new one.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-md bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
          <div className="bg-[#2d2d2d] text-white px-6 py-4">
            <h2 className="text-xl font-bold">Reset Password</h2>
            <p className="text-sm text-zinc-300 mt-1">Enter your new password below.</p>
          </div>

          {message && (
            <div className={`mx-6 mt-6 p-4 rounded-md border text-sm flex items-start space-x-2 ${
              status === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {status === 'success' ? (
                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff9900]"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff9900]"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff9900] hover:bg-orange-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            {loginPath && (
              <p className="text-center text-sm text-gray-600 mt-4">
                <Link to={loginPath} className="text-[#4a4a4a] font-semibold hover:underline cursor-pointer">Back to Login</Link>
              </p>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
