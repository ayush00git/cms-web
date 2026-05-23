import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { HOSTELS } from '../../constants/models';

export function WardenSignup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone_number: '',
    hostel: ''
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
      const response = await fetch('/api/auth/warden/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    } catch (err) {
      setStatus('error');
      setMessage('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-lg bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
          <div className="bg-[#2d2d2d] text-white px-6 py-4">
            <h2 className="text-xl font-bold">Warden Registration</h2>
            <p className="text-sm text-zinc-300 mt-1">Register to manage complaints for your Hostel.</p>
          </div>

          {message && (
            <div className={`mx-6 mt-6 p-4 rounded-md border text-sm flex items-start space-x-2 transition-all duration-300 ${
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
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff9900]" 
                  placeholder="warden@nith.ac.in" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff9900]"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff9900]" 
                  placeholder="10-digit number" 
                  pattern="[0-9]{10}" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Assigned Hostel</label>
                <select 
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#ff9900]" 
                  required
                >
                  <option value="" disabled>Select your Hostel</option>
                  {HOSTELS.map(hostel => (
                    <option key={hostel.value} value={hostel.value}>{hostel.label}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#ff9900] hover:bg-orange-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register as Warden'}
              </button>
            </div>
            
            <p className="text-center text-sm text-gray-600 mt-4">
              Already registered? <Link to="/warden/login" className="text-[#4a4a4a] font-semibold hover:underline">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
