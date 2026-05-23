import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, Home, Building, ShieldCheck, LogOut, PlusCircle, AlertCircle, Edit3, UserCheck, Inbox } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch profile. Please login.');
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      });
  }, [navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center bg-gray-50 py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#ff9900] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading profile data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center bg-gray-50 py-12">
          <div className="max-w-md w-full mx-4 bg-white border border-red-200 rounded-xl p-6 shadow-md text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">Access Denied</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <p className="text-xs text-gray-500">Redirecting to Homepage...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Determine user role and properties based on response fields
  let role = 'User';
  let roleBadgeColor = 'bg-gray-100 text-gray-800 border-gray-200';
  let registerRoute = '/';

  if ('department' in profile) {
    role = 'Faculty Member';
    roleBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    registerRoute = '/faculty/post';
  } else if ('hostel' in profile) {
    role = 'Hostel Warden';
    roleBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    registerRoute = '/warden/post';
  } else if ('building' in profile) {
    role = 'Centre Head';
    roleBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    registerRoute = '/centre-head/post';
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      window.location.href = '/';
    } catch (err) {
      window.location.href = '/';
    }
  };

  return (
    <MainLayout>
      <div className="flex-grow bg-gray-50 py-12 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">User Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1">Manage and view your credentials, residency, and portal access details.</p>
            </div>
            
            <button 
              onClick={() => alert('Edit profile functionality coming soon')}
              className="bg-[#2d2d2d] hover:bg-[#4a4a4a] text-white border border-[#2d2d2d] px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center shadow-sm w-fit shrink-0 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 mr-2" /> Edit Profile Details
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Form Sheet (2/3 width) */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 pb-4 border-b border-gray-100 mb-6 flex items-center">
                <UserCheck className="w-5 h-5 text-gray-500 mr-2" /> Profile Information Sheet
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Form Row: Name */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</span>
                  <span className="block text-base font-semibold text-gray-900">
                    {profile.name || profile.email.split('@')[0]}
                  </span>
                </div>

                {/* Form Row: Account Verification / Role */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Verification Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeColor}`}>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      {role}
                    </span>
                    {profile.is_verified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Form Row: Email Address */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                  <span className="block text-base font-semibold text-gray-800">{profile.email}</span>
                </div>

                {/* Form Row: Phone Number */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                  <span className="block text-base font-semibold text-gray-800">{profile.phone_number || 'N/A'}</span>
                </div>

                {/* Faculty Role Specifics */}
                {'department' in profile && (
                  <>
                    <div className="space-y-1.5">
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Academic Department</span>
                      <span className="block text-base font-semibold text-gray-800">{profile.department}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Residence Allotment</span>
                      <span className="block text-base font-semibold text-gray-800">
                        House No. {profile.house_number}, Block {profile.block} (Type {profile.type})
                      </span>
                    </div>
                  </>
                )}

                {/* Warden Role Specifics */}
                {'hostel' in profile && (
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Hostel Jurisdiction</span>
                    <span className="block text-base font-semibold text-gray-800">{profile.hostel}</span>
                  </div>
                )}

                {/* Centre Head Role Specifics */}
                {'building' in profile && (
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Centre Jurisdiction</span>
                    <span className="block text-base font-semibold text-gray-800">{profile.building}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Guidelines Console (1/3 width) */}
            <div className="space-y-6">
              {/* Actions Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-4 pb-2 border-b border-gray-100">
                  Quick Portal Actions
                </h3>
                <div className="space-y-3">
                  <Link 
                    to={registerRoute} 
                    className="w-full bg-[#ff9900] hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-md shadow-orange-500/10 text-sm cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Register a Complaint
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center text-sm cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> End Session / Logout
                  </button>
                </div>
              </div>

              {/* Guidelines Info box */}
              <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Need Assistance?</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  If any profile information above is incorrect, please select the "Edit Profile Details" button above or email the Estate Office administration directly.
                </p>
                <a href="#" className="text-xs text-gray-600 hover:text-gray-900 font-bold underline flex items-center cursor-pointer">
                  Read Complaint Filing Manual &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Complaints Status Section */}
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 pb-4 border-b border-gray-100 mb-6 flex items-center">
              <Inbox className="w-5 h-5 text-gray-500 mr-2" /> Your Complaints and their Status
            </h3>
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <span className="text-sm font-semibold">No active complaints found</span>
              <span className="text-xs text-gray-400 mt-1">// Coming soon: Tracking dashboard for your submitted complaints will list here.</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
