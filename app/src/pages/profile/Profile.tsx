import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, LogOut, PlusCircle, AlertCircle, Pencil, UserCheck,
  Inbox, ServerCrash, Info,
} from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { ComplaintCard } from '../../components/ComplaintCard';
import type { ComplaintPost, EditForm, Role } from '../../components/ComplaintCard';

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const navigate = useNavigate();

  const [posts, setPosts]               = useState<ComplaintPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError]     = useState<string | null>(null);

  const [editingId, setEditingId]   = useState<number | null>(null);
  const [editForm, setEditForm]     = useState<EditForm>({
    title: '', description: '', place: '', room_number: '',
  });
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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

  const fetchPosts = useCallback((silent = false) => {
    if (!profile) return;
    let endpoint = '';
    if ('department' in profile)    endpoint = '/api/post/faculty';
    else if ('hostel' in profile)   endpoint = '/api/post/warden';
    else if ('building' in profile) endpoint = '/api/post/centrehead';
    else return;

    if (!silent) setPostsLoading(true);
    setPostsError(null);
    fetch(endpoint, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        return res.json();
      })
      .then((data) => { setPosts(data.posts ?? []); setPostsLoading(false); })
      .catch((err: Error) => { setPostsError(err.message); setPostsLoading(false); });
  }, [profile]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#666666] font-semibold text-sm">Loading profile data…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center py-12">
          <div className="max-w-md w-full mx-4 bg-white border border-[#E5E5E5] border-t-2 border-t-[#111111] rounded-lg p-6 shadow-sm text-center">
            <AlertCircle className="w-10 h-10 text-[#111111] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#111111] mb-2">Access Denied</h3>
            <p className="text-sm text-[#666666] mb-4">{error}</p>
            <p className="text-xs text-[#666666]">Redirecting to Homepage…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isFaculty    = 'department' in profile;
  const isWarden     = 'hostel' in profile;
  const isCentreHead = 'building' in profile;

  let roleLabel    = 'User';
  let registerRoute = '/';
  let role: Role   = 'centrehead';
  if (isFaculty)         { roleLabel = 'Faculty Member'; registerRoute = '/faculty/post';      role = 'faculty'; }
  else if (isWarden)     { roleLabel = 'Hostel Warden';  registerRoute = '/warden/post';       role = 'warden'; }
  else if (isCentreHead) { roleLabel = 'Centre Head';    registerRoute = '/centre-head/post';  role = 'centrehead'; }

  const editBase   = isFaculty ? '/api/post/faculty/edit'   : isWarden ? '/api/post/warden/edit'   : '/api/post/centrehead/edit';
  const deleteBase = isFaculty ? '/api/post/faculty/delete' : isWarden ? '/api/post/warden/delete' : '/api/post/centrehead/delete';

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

  return (
    <MainLayout>
      <div className="flex-grow relative">
        <div className="container mx-auto px-6 pt-12 pb-16 max-w-7xl">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5E5E5]">
            <div>
              <h2 className="text-2xl font-bold text-[#111111] tracking-tight">User Dashboard</h2>
              <p className="text-sm text-[#666666] mt-1">Manage your credentials, residency, and portal access details.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={registerRoute}
                className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200 active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Register Complaint
              </Link>
              <button
                onClick={() => alert('Edit profile functionality coming soon')}
                className="inline-flex items-center gap-2 bg-[#222222] hover:bg-[#000000] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <Pencil className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 border border-[#111111] bg-white hover:bg-[#F5F5F5] text-[#111111] text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>

          {/* ── Profile info card ── */}
          <div className="bg-white border border-[#E5E5E5] rounded-lg mb-10">
            {/* Identity row */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5E5]">
              <div>
                <p className="text-base font-bold text-[#111111]">{profile.name || profile.email.split('@')[0]}</p>
                <p className="text-sm text-[#666666] mt-0.5">{profile.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#111111] bg-[#F5F5F5] text-xs font-bold text-[#111111] uppercase tracking-wide">
                  <ShieldCheck className="w-3 h-3" /> {roleLabel}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wide ${
                  profile.is_verified ? 'bg-[#E6F7ED] border-[#111111] text-[#111111]' : 'bg-[#FCEBEA] border-[#111111] text-[#111111]'
                }`}>
                  {profile.is_verified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-[#E5E5E5]">
              <div className="px-6 py-4">
                <p className="text-xs text-[#666666] mb-1">Phone</p>
                <p className="text-sm font-semibold text-[#111111]">{profile.phone_number || 'N/A'}</p>
              </div>
              {isFaculty && (
                <>
                  <div className="px-6 py-4">
                    <p className="text-xs text-[#666666] mb-1">Department</p>
                    <p className="text-sm font-semibold text-[#111111]">{profile.department}</p>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-xs text-[#666666] mb-1">House / Block</p>
                    <p className="text-sm font-semibold text-[#111111]">No. {profile.house_number}, Block {profile.block}</p>
                  </div>
                  <div className="px-6 py-4">
                    <p className="text-xs text-[#666666] mb-1">Type</p>
                    <p className="text-sm font-semibold text-[#111111]">{profile.type}</p>
                  </div>
                </>
              )}
              {isWarden && (
                <div className="px-6 py-4">
                  <p className="text-xs text-[#666666] mb-1">Hostel</p>
                  <p className="text-sm font-semibold text-[#111111]">{profile.hostel}</p>
                </div>
              )}
              {isCentreHead && (
                <div className="px-6 py-4">
                  <p className="text-xs text-[#666666] mb-1">Centre</p>
                  <p className="text-sm font-semibold text-[#111111]">{profile.building}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Complaints ── */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E5E5]">
            <Inbox className="w-4 h-4 text-[#666666]" />
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-widest">Your Complaints</h3>
            <div className="relative group">
              <Info className="w-3.5 h-3.5 text-[#999999] cursor-default" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                  Posts can only be edited within 30 minutes of creation
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
              </div>
            </div>
            {!postsLoading && (
              <span className="bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666] text-xs font-bold px-2 py-0.5 rounded-lg">{posts.length}</span>
            )}
          </div>

          {postsLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-[#666666]">
              <div className="w-5 h-5 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Fetching your complaints…</span>
            </div>
          )}

          {!postsLoading && postsError && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-[#666666]">
              <ServerCrash className="w-8 h-8" />
              <span className="text-sm font-semibold text-[#111111]">{postsError}</span>
            </div>
          )}

          {!postsLoading && !postsError && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg border border-dashed border-[#E5E5E5]">
              <Inbox className="w-10 h-10 mb-3 text-[#E5E5E5]" />
              <span className="text-sm font-semibold text-[#111111]">No complaints filed yet.</span>
              <span className="text-xs mt-1 text-[#666666]">Use "Register Complaint" above to file your first one.</span>
            </div>
          )}

          {!postsLoading && !postsError && posts.length > 0 && (
            <div className="flex flex-col gap-4">
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
                  onCommentPosted={() => fetchPosts(true)}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
