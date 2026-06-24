import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

type Profile = { department?: string; hostel?: string; building?: string } | null;

function getPostRoute(profile: NonNullable<Profile>): string {
  if ('department' in profile) return '/faculty/post';
  if ('hostel' in profile)     return '/warden/post';
  return '/centre-head/post';
}

export function Landing() {
  const [profile, setProfile]           = useState<Profile>(null);
  const [isAuth, setIsAuth]             = useState<boolean | null>(null);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const menuRef                         = useRef<HTMLDivElement>(null);
  const navigate                        = useNavigate();

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then(res => {
        if (!res.ok) { setIsAuth(false); return null; }
        return res.json();
      })
      .then(data => { if (data) { setProfile(data); setIsAuth(true); } })
      .catch(() => setIsAuth(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowLoginMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleComplaintClick() {
    if (isAuth === null) return;
    if (isAuth && profile) {
      navigate(getPostRoute(profile));
    } else {
      setShowLoginMenu(prev => !prev);
    }
  }

  return (
    <MainLayout>

      {/* Hero */}
      <section className="relative bg-white border-b border-[#E5E5E5]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1111111a_1px,transparent_1px),linear-gradient(to_bottom,#1111111a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative z-10 container mx-auto px-6 py-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center border border-[#111111] rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#111111] mb-6">
            Estate Office Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#111111] leading-tight tracking-tight mb-4 max-w-2xl">
            Campus Complaint<br />Management System
          </h1>
          <p className="text-[#666666] text-base leading-relaxed max-w-xl mb-8">
            A unified platform for NIT Hamirpur faculty, wardens, and centre heads to file,
            track, and resolve campus maintenance complaints efficiently.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleComplaintClick}
                className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Lodge a Complaint <ArrowRight className="w-4 h-4" />
              </button>
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#222222] border border-[#333333] rounded-lg shadow-xl overflow-hidden z-50 min-w-[190px] transition-all duration-200 origin-top ${
                  showLoginMenu ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
                }`}
              >
                <Link to="/faculty/login" className="block px-5 py-3 text-sm font-medium text-white hover:bg-[#333333] transition-colors border-b border-[#333333] cursor-pointer">
                  Login as Faculty
                </Link>
                <Link to="/warden/login" className="block px-5 py-3 text-sm font-medium text-white hover:bg-[#333333] transition-colors border-b border-[#333333] cursor-pointer">
                  Login as Warden
                </Link>
                <Link to="/centre-head/login" className="block px-5 py-3 text-sm font-medium text-white hover:bg-[#333333] transition-colors cursor-pointer">
                  Login as Centre Head
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Notices */}
          <div className="border border-[#111111] rounded-lg overflow-hidden flex flex-col">
            <div className="bg-[#111111] text-white px-5 py-3 flex items-center justify-between">
              <span className="text-sm font-bold">Estate Office Notices</span>
              <button className="text-xs border border-white/30 hover:border-white px-2.5 py-1 rounded-lg transition-colors">
                View All
              </button>
            </div>
            <div className="p-5 flex-grow overflow-y-auto space-y-4">
              {[
                { tag: 'Urgent', tagBg: '#FCEBEA', title: 'Scheduled power outage in Main Admin Block due to HT panel maintenance.', date: '20 May 2026' },
                { tag: 'New', tagBg: '#E6F7ED', title: 'Water supply disruption in Kailash Boys Hostel for pipe repair work.', date: '18 May 2026' },
                { tag: 'Info', tagBg: '#E8F4F9', title: 'Annual AC servicing schedule released for Departmental Buildings.', date: '15 May 2026' },
                { tag: 'Notice', tagBg: '#F5F5F5', title: 'Road resurfacing work to begin near Admin block from June 1st.', date: '12 May 2026' },
              ].map(({ tag, tagBg, title, date }) => (
                <div key={title} className="border-b border-[#E5E5E5] pb-4 last:border-0 last:pb-0">
                  <span
                    className="inline-flex items-center border border-[#111111] rounded-lg px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#111111] mb-1.5"
                    style={{ backgroundColor: tagBg }}
                  >
                    {tag}
                  </span>
                  <p className="text-sm text-[#111111] font-medium leading-snug mb-1">{title}</p>
                  <span className="text-xs text-[#666666]">{date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filing Guidelines */}
          <div className="border border-[#111111] rounded-lg overflow-hidden flex flex-col">
            <div className="bg-[#111111] text-white px-5 py-3">
              <span className="text-sm font-bold">Filing Guidelines</span>
            </div>
            <div className="p-5 flex-grow space-y-4">
              {[
                { step: '01', text: 'Select the correct category — Civil or Electrical — to ensure proper routing.' },
                { step: '02', text: 'Provide the exact building and room number in the complaint description.' },
                { step: '03', text: 'Only Wardens may file complaints for hostel common areas.' },
                { step: '04', text: 'Do not file duplicate complaints for the same issue.' },
              ].map(({ step, text }) => (
                <div key={step} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 text-xs font-bold text-[#666666] w-6 pt-0.5">{step}</span>
                  <p className="text-sm text-[#111111] leading-snug">{text}</p>
                </div>
              ))}
              <a href="#" className="inline-flex items-center gap-1 text-sm font-bold text-[#111111] hover:underline mt-2">
                Read Complete Manual <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Portal Access */}
          <div className="border border-[#111111] rounded-lg overflow-hidden flex flex-col">
            <div className="bg-[#111111] text-white px-5 py-3">
              <span className="text-sm font-bold">Portal Access</span>
            </div>
            <div className="p-5 flex-grow flex flex-col gap-3">

              {isAuth === true && (
                <Link
                  to="/profile"
                  className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold py-3 rounded-lg text-center transition-colors duration-200"
                >
                  My Profile
                </Link>
              )}
              {isAuth === false && (
                <p className="text-xs text-[#666666] text-center pb-1">
                  <span className="font-semibold text-[#111111]">New here?</span> Sign up to create your profile.
                </p>
              )}

              <Link
                to="/faculty/login"
                className="w-full border border-[#111111] bg-white hover:bg-[#F5F5F5] text-[#111111] text-sm font-semibold py-3 rounded-lg text-center transition-colors duration-200"
              >
                Login as Faculty
              </Link>
              <Link
                to="/warden/login"
                className="w-full border border-[#111111] bg-white hover:bg-[#F5F5F5] text-[#111111] text-sm font-semibold py-3 rounded-lg text-center transition-colors duration-200"
              >
                Login as Warden
              </Link>
              <Link
                to="/centre-head/login"
                className="w-full border border-[#111111] bg-white hover:bg-[#F5F5F5] text-[#111111] text-sm font-semibold py-3 rounded-lg text-center transition-colors duration-200"
              >
                Login as Centre Head
              </Link>

              <div className="mt-auto pt-4 border-t border-[#E5E5E5]">
                <p className="text-xs text-[#666666] mb-2 font-medium">Estate Office Administration</p>
                <Link
                  to="/staff/login"
                  className="w-full bg-[#222222] hover:bg-[#000000] text-white text-sm font-semibold py-3 rounded-lg text-center transition-colors duration-200 block"
                >
                  Staff Login — XEN / AE / JE
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

    </MainLayout>
  );
}
