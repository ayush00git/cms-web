import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lodgeOpen, setLodgeOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
    setLodgeOpen(false);
    setAdminOpen(false);
  };

  return (
    <nav className="bg-[#111111] text-white sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center text-sm font-medium">
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
              <Link to="/faculty/signup" className="block px-4 py-2.5 text-sm hover:bg-[#F5F5F5] transition-colors">Faculty</Link>
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
            <button className="block px-4 py-3 hover:bg-white/10 transition-colors">
              Contact Us
            </button>
          </li>
        </ul>

        {/* Mobile header row */}
        <div className="flex md:hidden items-center justify-between py-2">
          <span className="text-sm font-semibold text-white/80">Menu</span>
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="p-2 rounded hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#111111] text-sm font-medium">
          <Link to="/" onClick={closeMobile} className="block px-5 py-3 hover:bg-white/10 transition-colors border-b border-white/5">
            Home
          </Link>

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
                <Link to="/faculty/signup" onClick={closeMobile} className="block px-8 py-2.5 hover:bg-white/10 transition-colors">Faculty</Link>
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

          <button className="block w-full text-left px-5 py-3 hover:bg-white/10 transition-colors">
            Contact Us
          </button>
        </div>
      )}
    </nav>
  );
}
