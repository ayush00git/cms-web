import React, { useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { POST_TYPES } from '../../constants/models';

export function CentreHeadPost() {
  const [formData, setFormData] = useState({
    type_of_post: '',
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setMessage('');

    try {
      const response = await fetch('/api/post/centrehead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.success || 'Complaint submitted successfully!');
        setFormData({ type_of_post: '', title: '', description: '' });
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
  const selectCls = `${inputCls} appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px_16px] pr-9` +
    ` bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")]`;
  const labelCls = 'block text-sm font-semibold text-[#111111] mb-1.5';

  return (
    <MainLayout>
      <div className="flex-grow flex flex-col">

        {/* Header strip */}
        <div className="border-b border-[#E5E5E5] py-5">
          <div className="max-w-6xl mx-auto w-full px-8">
            <h1 className="text-xl font-bold text-[#111111]">Submit a Centre Complaint</h1>
            <p className="text-sm text-[#666666] mt-0.5">Lodge a civil or electrical maintenance complaint for your building.</p>
          </div>
        </div>

        {/* Status banner */}
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

        {/* Two-column layout */}
        <div className="flex flex-grow divide-x divide-[#E5E5E5] max-w-6xl mx-auto w-full">

          {/* LEFT — Form */}
          <form onSubmit={handleSubmit} className="flex-1 px-8 py-8 space-y-6 min-w-0">

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">Complaint Details</h2>
              <div className="max-w-sm">
                <label className={labelCls}>Type of Complaint</label>
                <select name="type_of_post" value={formData.type_of_post} onChange={handleChange} className={selectCls} required>
                  <option value="" disabled>Select Type</option>
                  {POST_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">Title & Description</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="e.g. Faulty wiring in corridor"
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`${inputCls} resize-none`}
                    placeholder="Provide a detailed description including the floor or zone..."
                    rows={6}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <div>
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
                {loading ? 'Submitting…' : 'Submit Complaint'}
              </button>
            </div>

          </form>

          {/* RIGHT — Sidebar */}
          <aside className="w-72 shrink-0 px-6 py-8 space-y-6 bg-white">

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-3">Filing Guidelines</h3>
              <ol className="space-y-3">
                {[
                  'File only for areas within your assigned Building or Centre.',
                  'Select Civil or Electrical accurately — misrouting causes delays.',
                  'Mention the specific floor or zone in the description.',
                  'Do not file duplicate complaints for the same issue.',
                  'Complaints are reviewed within 2 working days.',
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-xs font-bold text-[#666666] shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <p className="text-sm text-[#111111] leading-snug">{text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-3">Centre Head Scope</h3>
              <p className="text-sm text-[#111111] leading-relaxed">
                Centre Heads may only file complaints for buildings and centres under their official jurisdiction.
              </p>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-3">Complaint Types</h3>
              <p className="text-sm text-[#111111] leading-relaxed">
                <span className="font-semibold">Civil</span> — structural, plumbing, water supply.<br />
                <span className="font-semibold">Electrical</span> — wiring, power, lighting failures.
              </p>
            </div>

          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
