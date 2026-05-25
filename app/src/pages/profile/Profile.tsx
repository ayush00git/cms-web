import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, Home, Building, ShieldCheck, LogOut, PlusCircle, AlertCircle, Edit3, UserCheck, Inbox, Zap, Hammer, ServerCrash } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  Pending_XEN: 'bg-amber-50 text-amber-700 border-amber-200',
  Pending_AE:  'bg-blue-50 text-blue-700 border-blue-200',
  Pending_JE:  'bg-indigo-50 text-indigo-700 border-indigo-200',
  Resolved_JE: 'bg-teal-50 text-teal-700 border-teal-200',
  Resolved:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed:      'bg-red-50 text-red-600 border-red-200',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch profile. Please login.');
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setTimeout(() => navigate('/'), 3000);
      });
  }, [navigate]);

  // Once profile is known, pick the right posts endpoint by role
  useEffect(() => {
    if (!profile) return;

    let endpoint = '';
    if ('department' in profile)   endpoint = '/api/post/faculty';
    else if ('hostel' in profile)  endpoint = '/api/post/warden';
    else if ('building' in profile) endpoint = '/api/post/centre_head';
    else return;

    setPostsLoading(true);
    setPostsError(null);
    fetch(endpoint, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        return res.json();
      })
      .then((data) => {
        setPosts(data.posts ?? []);
        setPostsLoading(false);
      })
      .catch((err: Error) => {
        setPostsError(err.message);
        setPostsLoading(false);
      });
  }, [profile]);

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
            <h3 className="text-lg font-bold text-gray-800 pb-4 border-b border-gray-100 mb-6 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-gray-500" /> Your Complaints and their Status
              {!postsLoading && (
                <span className="ml-auto bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {posts.length}
                </span>
              )}
            </h3>

            {/* Posts loading */}
            {postsLoading && (
              <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                <div className="w-5 h-5 border-2 border-[#ff9900] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold">Fetching your complaints…</span>
              </div>
            )}

            {/* Posts error */}
            {!postsLoading && postsError && (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
                <ServerCrash className="w-8 h-8" />
                <span className="text-sm font-semibold text-red-500">{postsError}</span>
              </div>
            )}

            {/* Empty state */}
            {!postsLoading && !postsError && posts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <Inbox className="w-8 h-8 mb-2 opacity-40" />
                <span className="text-sm font-semibold">No complaints filed yet.</span>
                <span className="text-xs mt-1">Use "Register a Complaint" to file your first one.</span>
              </div>
            )}

            {/* Posts list */}
            {!postsLoading && !postsError && posts.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {posts.map((post: any) => {
                  const statusCls = STATUS_STYLES[post.status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
                  return (
                    <li key={post.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 first:pt-0 last:pb-0">
                      {/* ID */}
                      <span className="shrink-0 text-[11px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded self-start">
                        #{post.id}
                      </span>

                      {/* Title + date */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(post.created_at)}</p>
                      </div>

                      {/* Type badge */}
                      <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded self-start sm:self-auto">
                        {post.type_of_post === 'Electrical'
                          ? <Zap className="w-3 h-3" />
                          : <Hammer className="w-3 h-3" />
                        }
                        {post.type_of_post}
                      </span>

                      {/* Status badge */}
                      <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto ${statusCls}`}>
                        {post.status.replace('_', ' ')}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
