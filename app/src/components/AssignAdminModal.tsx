import React, { useEffect, useState } from 'react';
import { X, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Loader } from './Loader';

interface AssignAdminModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful assignment, with the new admin's details. */
  onAssigned?: (admin: { name: string; email: string }) => void;
}

// AssignAdminModal lets a logged-in super admin add another super admin by
// name and email. The new admin logs in through the same magic-link flow.
export function AssignAdminModal({ open, onClose, onAssigned }: AssignAdminModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  // Reset the form each time the modal opens.
  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setStatus(null);
      setMessage('');
      setLoading(false);
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setMessage('');
    try {
      const res = await fetch('/api/superadmin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('success');
        setMessage(`${name.trim()} can now log in at /superadmin/login with ${email.trim()}.`);
        onAssigned?.({ name: name.trim(), email: email.trim() });
      } else {
        setStatus('error');
        setMessage(data.error || `Request failed (${res.status}).`);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-[2px]"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-admin-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <span className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#ff9900]">
            <UserPlus className="w-4 h-4" />
          </span>
          <div>
            <h2 id="assign-admin-title" className="text-sm font-bold text-gray-800">Assign a new super admin</h2>
            <p className="text-[11px] text-gray-400">They will get the same read-only oversight access as you.</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-700 rounded-md p-1 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="px-5 py-8 flex flex-col items-center text-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="text-sm font-semibold text-gray-800">Super admin assigned</p>
            <p className="text-xs text-gray-500">{message}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { setStatus(null); setName(''); setEmail(''); setMessage(''); }}
                className="text-xs font-semibold px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
              >
                Add another
              </button>
              <button
                onClick={onClose}
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#222222] hover:bg-[#111111] text-white transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
            {status === 'error' && (
              <div className="flex items-start gap-2 bg-[#FCEBEA] border border-[#f5c6c4] text-[#b91c1c] text-xs rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                <span className="font-medium">{message}</span>
              </div>
            )}

            <div>
              <label className={labelCls} htmlFor="assign-admin-name">Full name</label>
              <input
                id="assign-admin-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={inputCls}
                placeholder="e.g. Dr. A. Sharma"
                maxLength={50}
                required
                autoFocus
              />
            </div>

            <div>
              <label className={labelCls} htmlFor="assign-admin-email">Email address</label>
              <input
                id="assign-admin-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                placeholder="name@nith.ac.in"
                maxLength={255}
                required
              />
              <p className="text-[11px] text-gray-400 mt-1.5">Login links will be mailed to this address.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-500 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {loading && <Loader size="sm" color="white" />}
                {loading ? 'Assigning…' : 'Assign super admin'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
