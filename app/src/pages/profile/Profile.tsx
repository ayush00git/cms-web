import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, LogOut, PlusCircle, AlertCircle, Edit3, UserCheck,
  Inbox, ServerCrash,
} from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { ComplaintCard } from '../../components/ComplaintCard';
import type { ComplaintPost, EditForm, Role } from '../../components/ComplaintCard';

// ── Component ──────────────────────────────────────────────────────────────────

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();

  const [posts, setPosts]           = useState<ComplaintPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editForm, setEditForm]     = useState<EditForm>({
    title: '', description: '', place: '', room_number: '',
  });
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ── Fetch profile ──
  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch profile. Please login.');
        return res.json();
      })
      .then((data) => { setProfile(data); setLoading(false); })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setTimeout(() => navigate('/'), 3000);
      });
  }, [navigate]);

  // ── Fetch posts once profile known ──
  useEffect(() => {
    if (!profile) return;
    let endpoint = '';
    if ('department' in profile)    endpoint = '/api/post/faculty';
    else if ('hostel' in profile)   endpoint = '/api/post/warden';
    else if ('building' in profile) endpoint = '/api/post/centrehead';
    else return;

    setPostsLoading(true);
    setPostsError(null);
    fetch(endpoint, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        return res.json();
      })
      .then((data) => { setPosts(data.posts ?? []); setPostsLoading(false); })
      .catch((err: Error) => { setPostsError(err.message); setPostsLoading(false); });
  }, [profile]);

  // ── Loading / Error states ──
  if (loading) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center bg-gray-50 py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#ff9900] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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

  // ── Derive role ──
  const isFaculty    = 'department' in profile;
  const isWarden     = 'hostel' in profile;
  const isCentreHead = 'building' in profile;

  let roleLabel     = 'User';
  let roleBadgeCls  = 'bg-gray-100 text-gray-800 border-gray-200';
  let registerRoute = '/';
  let role: Role    = 'centrehead';
  if (isFaculty)    { roleLabel = 'Faculty Member'; roleBadgeCls = 'bg-emerald-50 text-emerald-700 border-emerald-200'; registerRoute = '/faculty/post'; role = 'faculty'; }
  else if (isWarden)     { roleLabel = 'Hostel Warden';  roleBadgeCls = 'bg-indigo-50 text-indigo-700 border-indigo-200';  registerRoute = '/warden/post'; role = 'warden'; }
  else if (isCentreHead) { roleLabel = 'Centre Head';    roleBadgeCls = 'bg-amber-50 text-amber-700 border-amber-200';    registerRoute = '/centre-head/post'; role = 'centrehead'; }

  // ── API base paths ──
  const editBase   = isFaculty ? '/api/post/faculty/edit'       : isWarden ? '/api/post/warden/edit'       : '/api/post/centrehead/edit';
  const deleteBase = isFaculty ? '/api/post/faculty/delete'     : isWarden ? '/api/post/warden/delete'     : '/api/post/centrehead/delete';

  // ── Handlers ──
  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    window.location.href = '/';
  };

  function startEdit(post: ComplaintPost) {
    setEditingId(post.id);
    setEditForm({
      title:       post.title       ?? '',
      description: post.description ?? '',
      place:       post.place       ?? '',
      room_number: post.room_number ?? '',
    });
  }

  async function handleDelete(postId: number) {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    setActionLoading(postId);
    try {
      const res = await fetch(`${deleteBase}/${postId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? `Failed to delete (${res.status})`);
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSaveEdit(postId: number) {
    if (!window.confirm('Save changes to this complaint?')) return;
    setActionLoading(postId);

    const body: Record<string, string> = { title: editForm.title, description: editForm.description };
    if (isFaculty) body.place = editForm.place;
    if (isWarden)  body.room_number = editForm.room_number;

    try {
      const res = await fetch(`${editBase}/${postId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? `Failed to update (${res.status})`);
      }
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, ...body } : p));
      setEditingId(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  }

  // ── Render ──
  return (
    <MainLayout>
      <div className="flex-grow bg-gray-50 relative overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        {/* ── Profile section (constrained) ── */}
        <div className="container mx-auto px-6 pt-12 relative z-10 max-w-7xl">

          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">User Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1">Manage and view your credentials, residency, and portal access details.</p>
            </div>
            <button
              onClick={() => alert('Edit profile functionality coming soon')}
              className="bg-[#2d2d2d] hover:bg-[#4a4a4a] text-white border border-[#2d2d2d] px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center shadow-sm w-fit shrink-0 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 mr-2" /> Edit Profile Details
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile info (2/3) */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 pb-4 border-b border-gray-100 mb-6 flex items-center">
                <UserCheck className="w-5 h-5 text-gray-500 mr-2" /> Profile Information Sheet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</span>
                  <span className="block text-base font-semibold text-gray-900">{profile.name || profile.email.split('@')[0]}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Verification Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeCls}`}>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {roleLabel}
                    </span>
                    {profile.is_verified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                  <span className="block text-base font-semibold text-gray-800">{profile.email}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                  <span className="block text-base font-semibold text-gray-800">{profile.phone_number || 'N/A'}</span>
                </div>
                {isFaculty && (
                  <>
                    <div className="space-y-1.5">
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Academic Department</span>
                      <span className="block text-base font-semibold text-gray-800">{profile.department}</span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Residence Allotment</span>
                      <span className="block text-base font-semibold text-gray-800">House No. {profile.house_number}, Block {profile.block} (Type {profile.type})</span>
                    </div>
                  </>
                )}
                {isWarden && (
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Hostel Jurisdiction</span>
                    <span className="block text-base font-semibold text-gray-800">{profile.hostel}</span>
                  </div>
                )}
                {isCentreHead && (
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Centre Jurisdiction</span>
                    <span className="block text-base font-semibold text-gray-800">{profile.building}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions (1/3) */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 tracking-wider uppercase mb-4 pb-2 border-b border-gray-100">Quick Portal Actions</h3>
                <div className="space-y-3">
                  <Link to={registerRoute} className="w-full bg-[#ff9900] hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center shadow-md shadow-orange-500/10 text-sm cursor-pointer">
                    <PlusCircle className="w-4 h-4 mr-2" /> Register a Complaint
                  </Link>
                  <button onClick={handleLogout} className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition-all flex items-center justify-center text-sm cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" /> End Session / Logout
                  </button>
                </div>
              </div>
              <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Need Assistance?</h4>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  If any profile information above is incorrect, please select "Edit Profile Details" or email the Estate Office administration directly.
                </p>
                <a href="#" className="text-xs text-gray-600 hover:text-gray-900 font-bold underline flex items-center cursor-pointer">
                  Read Complaint Filing Manual →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Complaints section (full-width) ── */}
        <div className="mt-10 px-6 pb-12 relative z-10">

          {/* Section header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <Inbox className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Your Complaints</h3>
            {!postsLoading && (
              <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">{posts.length}</span>
            )}
          </div>

          {/* Loading */}
          {postsLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-[#ff9900] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Fetching your complaints…</span>
            </div>
          )}

          {/* Error */}
          {!postsLoading && postsError && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400">
              <ServerCrash className="w-8 h-8" />
              <span className="text-sm font-semibold text-red-500">{postsError}</span>
            </div>
          )}

          {/* Empty */}
          {!postsLoading && !postsError && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              <Inbox className="w-10 h-10 mb-3 opacity-30" />
              <span className="text-sm font-semibold">No complaints filed yet.</span>
              <span className="text-xs mt-1 text-gray-400">Use "Register a Complaint" above to file your first one.</span>
            </div>
          )}

          {/* Cards grid */}
          {!postsLoading && !postsError && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {posts.map((post) => (
                <ComplaintCard
                  key={post.id}
                  post={post}
                  role={role}
                  isEditing={editingId === post.id}
                  isBusy={actionLoading === post.id}
                  editForm={editForm}
                  onEditFormChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
                  onStartEdit={startEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={handleSaveEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
