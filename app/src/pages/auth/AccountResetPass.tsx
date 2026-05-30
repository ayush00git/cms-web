import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';

const roleToApi: Record<string, string> = {
  faculty:    '/api/auth/faculty/reset-password',
  warden:     '/api/auth/warden/reset-password',
  centrehead: '/api/auth/centrehead/reset-password',
};

const roleToLoginPath: Record<string, string> = {
  faculty:    '/faculty/login',
  warden:     '/warden/login',
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

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [status, setStatus]         = useState<'success' | 'error' | null>(null);
  const [message, setMessage]       = useState('');

  const userToken = searchParams.get('user');
  const role      = userToken ? decodeTokenRole(userToken) : null;
  const apiUrl    = role ? roleToApi[role] : null;
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

  const inputCls = 'w-full px-3.5 py-2.5 border border-[#CCCCCC] rounded-lg focus:outline-none focus:border-[#111111] text-sm text-[#111111] placeholder-[#999999] bg-white transition-colors';
  const labelCls = 'block text-sm font-semibold text-[#111111] mb-1.5';

  if (!userToken || !apiUrl) {
    return (
      <MainLayout>
        <div className="flex-grow flex flex-col">
          <div className="border-b border-[#E5E5E5] py-5">
            <div className="max-w-6xl mx-auto w-full px-8">
              <h1 className="text-xl font-bold text-[#111111]">Reset Password</h1>
              <p className="text-sm text-[#666666] mt-0.5">Invalid or expired reset link.</p>
            </div>
          </div>
          <div className="flex-grow flex items-start justify-center px-8 py-12">
            <div className="w-full max-w-sm space-y-4">
              <p className="text-sm text-[#666666]">This reset link is invalid or has expired. Please request a new one.</p>
              <Link to="/" className="inline-block bg-[#222222] hover:bg-[#000000] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-grow flex flex-col">

        <div className="border-b border-[#E5E5E5] py-5">
          <div className="max-w-6xl mx-auto w-full px-8">
            <h1 className="text-xl font-bold text-[#111111]">Reset Password</h1>
            <p className="text-sm text-[#666666] mt-0.5">Enter your new password below.</p>
          </div>
        </div>

        {message && (
          <div className={`border-b text-sm ${status === 'success' ? 'bg-[#E6F7ED] border-[#bbf0d0] text-[#15803d]' : 'bg-[#FCEBEA] border-[#f5c6c4] text-[#b91c1c]'}`}>
            <div className="max-w-6xl mx-auto w-full px-8 py-3 flex items-center gap-2.5">
              {status === 'success' ? (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        <div className="flex-grow flex items-start justify-center px-8 py-12">
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">New Password</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`${inputCls} pr-10`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-[#666666] hover:text-[#111111] cursor-pointer transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className={`${inputCls} pr-10`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(prev => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-[#666666] hover:text-[#111111] cursor-pointer transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold py-2.5 px-8 rounded-lg transition-colors duration-200 text-sm active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
              {loginPath && (
                <Link to={loginPath} className="text-sm text-[#666666] hover:text-[#111111] transition-colors cursor-pointer">
                  Back to Login
                </Link>
              )}
            </div>

          </form>
        </div>

      </div>
    </MainLayout>
  );
}
