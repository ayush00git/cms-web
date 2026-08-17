import { useState } from 'react';
import { ChevronDown, Menu, X, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lodgeOpen, setLodgeOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const { status } = useAuth();
  const isAuth = status === 'loading' ? null : status === 'authenticated';

  const closeMobile = () => {
    setMobileOpen(false);
    setLodgeOpen(false);
    setAdminOpen(false);
    setLoginDropdownOpen(false);
  };

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    window.location.href = '/';
  };

  return (
    <nav className="bg-[#111111] text-white sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Desktop nav */}
        <div className="hidden md:flex items-center justify-between">
          <ul className="flex items-center text-sm font-medium">
            <li>
              <Link to="/" className="block px-4 py-3 hover:bg-white/10 transition-colors">
                Home
              </Link>
            </li>

            <li className="relative group">
              <button className="flex items-center gap-1 px-4 py-3 hover:bg-white/10 transition-colors w-full">
                Lodge Complaint <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white text-[#111111] shadow-lg border border-[#E5E5E5] rounded-b-lg min-w-[180px] z-50">
                <Link to="/faculty/signup" className="block px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors">Employee</Link>
                <Link to="/warden/signup" className="block px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors">Warden</Link>
                <Link to="/centre-head/signup" className="block px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors">Centre Head</Link>
              </div>
            </li>

            <li>
              <button className="block px-4 py-3 hover:bg-white/10 transition-colors">
                Track Status
              </button>
            </li>

            <li className="relative group">
              <button className="flex items-center gap-1 px-4 py-3 hover:bg-white/10 transition-colors">
                Administration <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white text-[#111111] shadow-lg border border-[#E5E5E5] rounded-b-lg min-w-[180px] z-50">
                <Link to="/staff/login" className="block px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors">Staff Login</Link>
              </div>
            </li>

            <li>
              <button className="block px-4 py-3 hover:bg-white/10 transition-colors">
                Guidelines
              </button>
            </li>

            <li>
              <a href="mailto:admin.cccms@nith.ac.in" className="block px-4 py-3 hover:bg-white/10 transition-colors">
                Contact Us
              </a>
            </li>
          </ul>

          {/* Desktop Right - Profile / Login */}
          <div className="flex items-center text-sm font-medium">
            {isAuth === true ? (
              <>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-white cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
                <Link to="/profile" className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-white">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
              </>
            ) : (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-4 py-3 hover:bg-white/10 transition-colors text-white">
                  <User className="w-4 h-4" />
                  <span>Login</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
                <div className="absolute top-full right-0 hidden group-hover:block bg-white text-[#111111] shadow-lg border border-[#E5E5E5] rounded-b-lg min-w-[180px] z-50">
                  <Link to="/faculty/login" className="block px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors">Employee Login</Link>
                  <Link to="/warden/login" className="block px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors">Warden Login</Link>
                  <Link to="/centre-head/login" className="block px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors">Centre Head Login</Link>
                  <div className="border-t border-[#E5E5E5] my-1"></div>
                  <Link to="/staff/login" className="block px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors font-semibold">Admin Staff Login</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile header row */}
        <div className="flex md:hidden items-center justify-between py-2">
          <span className="text-sm font-semibold text-white/80">Menu</span>
          <div className="flex items-center gap-2">
            {isAuth === true ? (
              <>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
                <Link to="/profile" className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <User className="w-3.5 h-3.5" />
                  Profile
                </Link>
              </>
            ) : (
              <Link to="/faculty/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors">
                <User className="w-3.5 h-3.5" />
                Login
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              className="p-2 rounded hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#111111] text-sm font-medium">
          <Link to="/" onClick={closeMobile} className="block px-5 py-3 hover:bg-white/10 transition-colors border-b border-white/5">
            Home
          </Link>

          {/* User Profile / Login Option in Mobile Drawer */}
          {isAuth === true ? (
            <div className="flex items-stretch border-b border-white/5">
              <button
                onClick={() => { closeMobile(); handleLogout(); }}
                className="flex items-center gap-2 px-5 py-3 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
              <Link to="/profile" onClick={closeMobile} className="flex items-center gap-2 px-5 py-3 hover:bg-white/10 transition-colors text-[#16a34a] font-semibold">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
            </div>
          ) : (
            <div className="border-b border-white/5">
              <button
                onClick={() => setLoginDropdownOpen(prev => !prev)}
                className="flex items-center justify-between w-full px-5 py-3 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </div>
                <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${loginDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {loginDropdownOpen && (
                <div className="bg-white/5">
                  <Link to="/faculty/login" onClick={closeMobile} className="block px-8 py-2.5 hover:bg-white/10 transition-colors">Employee Login</Link>
                  <Link to="/warden/login" onClick={closeMobile} className="block px-8 py-2.5 hover:bg-white/10 transition-colors">Warden Login</Link>
                  <Link to="/centre-head/login" onClick={closeMobile} className="block px-8 py-2.5 hover:bg-white/10 transition-colors">Centre Head Login</Link>
                  <Link to="/staff/login" onClick={closeMobile} className="block px-8 py-2.5 hover:bg-white/10 transition-colors font-semibold text-white/90">Admin Staff Login</Link>
                </div>
              )}
            </div>
          )}

          {/* Lodge Complaint accordion */}
          <div className="border-b border-white/5">
            <button
              onClick={() => setLodgeOpen(prev => !prev)}
              className="flex items-center justify-between w-full px-5 py-3 hover:bg-white/10 transition-colors"
            >
              <span>Lodge Complaint</span>
              <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${lodgeOpen ? 'rotate-180' : ''}`} />
            </button>
            {lodgeOpen && (
              <div className="bg-white/5">
                <Link to="/faculty/signup" onClick={closeMobile} className="block px-8 py-2.5 hover:bg-white/10 transition-colors">Employee</Link>
                <Link to="/warden/signup" onClick={closeMobile} className="block px-8 py-2.5 hover:bg-white/10 transition-colors">Warden</Link>
                <Link to="/centre-head/signup" onClick={closeMobile} className="block px-8 py-2.5 hover:bg-white/10 transition-colors">Centre Head</Link>
              </div>
            )}
          </div>

          <button className="block w-full text-left px-5 py-3 hover:bg-white/10 transition-colors border-b border-white/5">
            Track Status
          </button>

          {/* Administration accordion */}
          <div className="border-b border-white/5">
            <button
              onClick={() => setAdminOpen(prev => !prev)}
              className="flex items-center justify-between w-full px-5 py-3 hover:bg-white/10 transition-colors"
            >
              <span>Administration</span>
              <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${adminOpen ? 'rotate-180' : ''}`} />
            </button>
            {adminOpen && (
              <div className="bg-white/5">
                <Link to="/staff/login" onClick={closeMobile} className="block px-8 py-2.5 hover:bg-white/10 transition-colors">Staff Login</Link>
              </div>
            )}
          </div>

          <button className="block w-full text-left px-5 py-3 hover:bg-white/10 transition-colors border-b border-white/5">
            Guidelines
          </button>

          <a href="mailto:admin.cccms@nith.ac.in" className="block w-full text-left px-5 py-3 hover:bg-white/10 transition-colors">
            Contact Us
          </a>
        </div>
      )}
    </nav>
  );
}

