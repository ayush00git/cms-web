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
      const response = await fetch('/api/post/centre_head', {
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

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff9900]';
  const labelCls = 'text-sm font-semibold text-gray-700';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-2xl bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">

          {/* Header */}
          <div className="bg-[#2d2d2d] text-white px-6 py-4">
            <h2 className="text-xl font-bold">Submit a Centre Complaint</h2>
            <p className="text-sm text-zinc-300 mt-1">
              Lodge a civil or electrical maintenance complaint for your building.
            </p>
          </div>

          {/* Alert */}
          {message && (
            <div
              className={`mx-6 mt-6 p-4 rounded-md border text-sm flex items-start space-x-2 transition-all duration-300 ${
                status === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">

              {/* Type of Post */}
              <div className="space-y-2">
                <label className={labelCls}>Type of Complaint</label>
                <select
                  name="type_of_post"
                  value={formData.type_of_post}
                  onChange={handleChange}
                  className={inputCls}
                  required
                >
                  <option value="" disabled>Select Type</option>
                  {POST_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="space-y-2">
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

              {/* Description */}
              <div className="space-y-2">
                <label className={labelCls}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputCls} resize-none`}
                  placeholder="Provide a detailed description of the issue..."
                  rows={5}
                  required
                />
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff9900] hover:bg-orange-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </MainLayout>
  );
}
