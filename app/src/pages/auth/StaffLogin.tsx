import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Loader } from '../../components/Loader';

export function StaffLogin() {
  const [email, setEmail] = useState('');
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
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(`A login link has been sent to ${email}. Check your inbox to continue.`);
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

  const inputCls = 'w-full px-3.5 py-2.5 border border-[#CCCCCC] rounded-lg focus:outline-none focus:border-[#111111] text-sm text-[#111111] placeholder-[#999999] bg-white transition-colors';
  const labelCls = 'block text-sm font-semibold text-[#111111] mb-1.5';

  return (
    <MainLayout>
      <div className="flex-grow flex flex-col">

        {/* Header strip */}
        <div className="border-b border-[#E5E5E5] py-5">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-8">
            <h1 className="text-xl font-bold text-[#111111]">Staff Login</h1>
            <p className="text-sm text-[#666666] mt-0.5">Secure portal for XEN / AE / JE. We'll email you a login link.</p>
          </div>
        </div>

        {/* Status banner */}
        {message && (
          <div className={`border-b text-sm ${status === 'success' ? 'bg-[#E6F7ED] border-[#bbf0d0] text-[#15803d]' : 'bg-[#FCEBEA] border-[#f5c6c4] text-[#b91c1c]'}`}>
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-3 flex items-center gap-2.5">
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

        {/* Form area */}
        <div className="flex-grow flex items-start justify-center px-4 sm:px-8 py-8 sm:py-12">
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">Passwordless Login</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Staff Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="staff@nith.ac.in"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold py-2.5 px-8 rounded-lg transition-colors duration-200 text-sm active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {loading && <Loader size="sm" color="white" />}
                {loading ? 'Sending link…' : 'Mail me a login link'}
              </button>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            {/* Other Roles */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-3">Other Roles</h2>
              <div className="flex flex-wrap gap-2">
                <Link to="/faculty/login" className="bg-[#222222] hover:bg-[#000000] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer">
                  Login as Employee
                </Link>
                <Link to="/warden/login" className="bg-[#222222] hover:bg-[#000000] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer">
                  Login as Warden
                </Link>
                <Link to="/centre-head/login" className="bg-[#222222] hover:bg-[#000000] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer">
                  Login as Centre Head
                </Link>
              </div>
            </div>

          </form>
        </div>

      </div>
    </MainLayout>
  );
}
