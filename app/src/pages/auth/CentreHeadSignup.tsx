import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { BUILDINGS } from '../../constants/models';

export function CentreHeadSignup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    building: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setMessage('');

    try {
      const response = await fetch('/api/auth/centrehead/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.success || 'Registered successfully! Please verify your email.');
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
  const selectCls = `${inputCls} appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px_16px] pr-9` +
    ` bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")]`;
  const labelCls = 'block text-sm font-semibold text-[#111111] mb-1.5';

  return (
    <MainLayout>
      <div className="flex-grow flex flex-col">

        {/* Page header strip */}
        <div className="border-b border-[#E5E5E5] py-5">
          <div className="max-w-6xl mx-auto w-full px-8">
            <h1 className="text-xl font-bold text-[#111111]">Centre Head Registration</h1>
            <p className="text-sm text-[#666666] mt-0.5">Register to manage complaints for your Building / Centre.</p>
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
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">Account Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelCls}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Anita Sharma"
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="head@nith.ac.in"
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="10-digit number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Password</label>
                  <div className="relative max-w-sm">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
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
              </div>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-4">Building Assignment</h2>
              <div className="max-w-sm">
                <label className={labelCls}>Assigned Building / Centre</label>
                <select
                  name="building"
                  value={formData.building}
                  onChange={handleChange}
                  className={selectCls}
                  required
                >
                  <option value="" disabled>Select your Building</option>
                  {BUILDINGS.map(building => (
                    <option key={building.value} value={building.value}>{building.label}</option>
                  ))}
                </select>
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
                {loading ? 'Registering…' : 'Register as Centre Head'}
              </button>
              <Link
                to="/centre-head/login"
                className="text-sm text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
              >
                Already registered? Login
              </Link>
            </div>

          </form>

          {/* RIGHT — Sidebar */}
          <aside className="w-72 shrink-0 px-6 py-8 space-y-6 bg-white">

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-3">Who can register?</h3>
              <p className="text-sm text-[#111111] leading-relaxed">
                Only officially designated NIT Hamirpur centre heads with a valid institute email (<span className="font-semibold">@nith.ac.in</span>) are eligible.
              </p>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-3">Building Complaints</h3>
              <p className="text-sm text-[#111111] leading-relaxed">
                Centre Heads can file complaints for academic and administrative buildings assigned to them by the Estate Office.
              </p>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-3">After Registration</h3>
              <p className="text-sm text-[#111111] leading-relaxed">
                A verification email will be sent to your registered address. You must verify your account before filing complaints.
              </p>
            </div>

            <div className="border-t border-[#CCCCCC]" />

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-3">Other Roles</h3>
              <div className="space-y-2">
                <Link to="/faculty/signup" className="block w-full bg-[#222222] hover:bg-[#000000] text-white text-xs font-semibold px-3 py-2 rounded-lg text-center transition-colors cursor-pointer">Register as Faculty</Link>
                <Link to="/warden/signup" className="block w-full bg-[#222222] hover:bg-[#000000] text-white text-xs font-semibold px-3 py-2 rounded-lg text-center transition-colors cursor-pointer">Register as Warden</Link>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
