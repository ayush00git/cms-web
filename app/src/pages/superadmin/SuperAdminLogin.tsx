import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Loader } from '../../components/Loader';

// SuperAdminLogin requests a passwordless magic link for a pre-seeded
// super admin. The link lands on /superadmin/access.
export function SuperAdminLogin() {
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
      const response = await fetch('/api/superadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(`An access link has been sent to ${email}. Check your inbox to continue.`);
      } else {
        setStatus('error');
        setMessage(data.error || 'An error occurred');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3.5 py-2.5 border border-[#CCCCCC] rounded-lg focus:outline-none focus:border-[#111111] text-sm text-[#111111] placeholder-[#999999] bg-white transition-colors';

  return (
    <MainLayout>
      <div className="flex-grow flex flex-col">
        <div className="border-b border-[#E5E5E5] py-5">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#ff9900]" />
            <div>
              <h1 className="text-xl font-bold text-[#111111]">Super Admin Login</h1>
              <p className="text-sm text-[#666666] mt-0.5">Read-only oversight of every complaint. We'll email you an access link.</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`border-b text-sm ${status === 'success' ? 'bg-[#E6F7ED] border-[#bbf0d0] text-[#15803d]' : 'bg-[#FCEBEA] border-[#f5c6c4] text-[#b91c1c]'}`}>
            <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-3 font-medium">{message}</div>
          </div>
        )}

        <div className="flex-grow flex items-start justify-center px-4 sm:px-8 py-8 sm:py-12">
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">Passwordless Login</h2>
              <label className="block text-sm font-semibold text-[#111111] mb-1.5">Super Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                placeholder="superadmin@nith.ac.in"
                required
              />
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold py-2.5 px-8 rounded-lg transition-colors text-sm active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {loading && <Loader size="sm" color="white" />}
              {loading ? 'Sending link…' : 'Mail me an access link'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
