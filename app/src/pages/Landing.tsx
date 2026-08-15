import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuth } from '../context/auth-context';

type Profile = { department?: string; hostel?: string; building?: string } | null;

function getPostRoute(profile: NonNullable<Profile>): string {
  if ('department' in profile) return '/faculty/posts';
  if ('hostel' in profile)     return '/warden/posts';
  return '/centre-head/posts';
}

export function Landing() {
  const { profile, status }             = useAuth();
  const isAuth                          = status === 'loading' ? null : status === 'authenticated';
  const [showLoginMenu, setShowLoginMenu]   = useState(false);
  const [showSignupMenu, setShowSignupMenu] = useState(false);
  const menuRef                         = useRef<HTMLDivElement>(null);
  const signupMenuRef                   = useRef<HTMLDivElement>(null);
  const navigate                        = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowLoginMenu(false);
      }
      if (signupMenuRef.current && !signupMenuRef.current.contains(e.target as Node)) {
        setShowSignupMenu(false);
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
      <section className="relative bg-white flex-grow flex flex-col">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1111111a_1px,transparent_1px),linear-gradient(to_bottom,#1111111a_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative z-10 container mx-auto px-6 py-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center border border-[#111111] rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#111111] mb-6">
            Estate Office Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#111111] leading-tight tracking-tight mb-4 max-w-2xl">
            Construction Cell Complaint<br />Management System
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

            {isAuth !== true && (
              <div className="relative" ref={signupMenuRef}>
                <button
                  onClick={() => setShowSignupMenu(prev => !prev)}
                  className="inline-flex items-center gap-2 border border-[#111111] bg-white hover:bg-[#F5F5F5] text-[#111111] text-sm font-semibold px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Create an Account
                </button>
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#222222] border border-[#333333] rounded-lg shadow-xl overflow-hidden z-50 min-w-[190px] transition-all duration-200 origin-top ${
                    showSignupMenu ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
                  }`}
                >
                  <Link to="/faculty/signup" className="block px-5 py-3 text-sm font-medium text-white hover:bg-[#333333] transition-colors border-b border-[#333333] cursor-pointer">
                    Signup as Faculty / Staff
                  </Link>
                  <Link to="/warden/signup" className="block px-5 py-3 text-sm font-medium text-white hover:bg-[#333333] transition-colors border-b border-[#333333] cursor-pointer">
                    Signup as Warden
                  </Link>
                  <Link to="/centre-head/signup" className="block px-5 py-3 text-sm font-medium text-white hover:bg-[#333333] transition-colors cursor-pointer">
                    Signup as Centre Head
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </MainLayout>
  );
}
