import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';

const gridBg = {
  backgroundImage: `linear-gradient(rgba(17,17,17,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.06) 1px, transparent 1px)`,
  backgroundSize: '32px 32px',
};

function dashboardFor(position: string): string {
  if (position.startsWith('XEN')) return '/admin/xen';
  if (position.startsWith('AE'))  return '/admin/ae';
  if (position.startsWith('JE'))  return '/admin/je';
  return '/';
}

export function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setMessage('');

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        const dest = dashboardFor(data.position ?? '');
        if (dest === '/') {
          setStatus('error');
          setMessage(`Unknown position "${data.position}" — contact admin.`);
        } else {
          sessionStorage.setItem('adminPosition', data.position ?? '');
          navigate(dest);
        }
      } else {
        setStatus('error');
        const errorMsg = data.error || data.email || Object.values(data)[0] || 'An error occurred';
        setMessage(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch {
      setStatus('error');
      setMessage('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 flex justify-center" style={gridBg}>
        <div className="w-full max-w-md bg-white border border-[#E5E5E5] border-t-2 border-t-[#111111] rounded-lg overflow-hidden shadow-sm">

          <div className="px-8 pt-8 pb-2">
            <h2 className="text-2xl font-bold text-[#111111] tracking-tight">Staff Login</h2>
            <p className="text-sm text-[#666666] mt-1">Secure portal for XEN / AE / JE.</p>
          </div>

          {message && (
            <div className={`mx-8 mt-6 p-3.5 rounded-lg border text-sm flex items-start gap-2.5 ${
              status === 'success'
                ? 'bg-[#E6F7ED] text-[#111111] border-[#111111]'
                : 'bg-[#FCEBEA] text-[#111111] border-[#111111]'
            }`}>
              {status === 'success' ? (
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-medium">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111111]">Staff Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#111111] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] text-sm"
                placeholder="staff@nith.ac.in"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#111111]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 border border-[#111111] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111111] text-sm"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#222222] hover:bg-[#000000] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 cursor-pointer active:scale-[0.98] text-sm"
              >
                {loading ? 'Logging in…' : 'Login to Portal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
