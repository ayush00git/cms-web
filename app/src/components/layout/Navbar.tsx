import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="bg-[#111111] text-white sticky top-0 z-30">
      <div className="container mx-auto px-6">
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
      </div>
    </nav>
  );
}
