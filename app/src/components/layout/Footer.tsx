import { useState } from 'react';
import { Mail, MapPin, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';

type Profile = { department?: string; hostel?: string; building?: string } | null;

function getPostRoute(profile: NonNullable<Profile>): string {
  if ('department' in profile) return '/faculty/posts';
  if ('hostel' in profile)     return '/warden/posts';
  return '/centre-head/posts';
}

export function Footer() {
  const { profile, status } = useAuth();
  const isAuth = status === 'authenticated';
  const [lodgeOpen, setLodgeOpen] = useState(false);
  const navigate = useNavigate();

  function handleLodgeComplaintClick() {
    if (isAuth && profile) {
      navigate(getPostRoute(profile));
    } else {
      setLodgeOpen(prev => !prev);
    }
  }

  return (
    <footer className="bg-[#111111] text-white mt-auto border-t border-[#222222]">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-bold text-base mb-3">NIT Hamirpur</h3>
          <p className="text-sm text-[#999999] leading-relaxed">
            National Institute of Technology Hamirpur is a public technical university in Himachal Pradesh.
            The Construction Cell oversees campus maintenance and infrastructure.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-base mb-3">Quick Links</h3>
          <ul className="text-sm text-[#999999] space-y-2.5">
            <li>
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li className="relative">
              <button
                onClick={handleLodgeComplaintClick}
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-left"
              >
                <span>Lodge a Complaint</span>
                {!isAuth && <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform ${lodgeOpen ? 'rotate-180' : ''}`} />}
              </button>
              {!isAuth && lodgeOpen && (
                <div className="mt-2 bg-[#222222] border border-[#333333] rounded-lg p-2 space-y-1 text-xs">
                  <Link to="/faculty/login" className="block px-3 py-1.5 hover:bg-[#333333] rounded transition-colors text-white">Employee Login</Link>
                  <Link to="/warden/login" className="block px-3 py-1.5 hover:bg-[#333333] rounded transition-colors text-white">Warden Login</Link>
                  <Link to="/centre-head/login" className="block px-3 py-1.5 hover:bg-[#333333] rounded transition-colors text-white">Centre Head Login</Link>
                </div>
              )}
            </li>
            <li>
              <Link to={isAuth ? "/profile" : "/faculty/login"} className="hover:text-white transition-colors">
                Track Complaint Status
              </Link>
            </li>
            <li>
              <Link to="/staff/login" className="hover:text-white transition-colors">
                Staff Portal (XEN / AE / JE)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-base mb-3">Developers</h3>
          <ul className="text-sm text-[#999999] space-y-2.5">
            <li>
              <a
                href="https://github.com/ayush00git"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Ayush</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/divyansh-v15-06"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Divyansh</span>
              </a>
            </li>
            <li className="pt-1">
              <a
                href="https://github.com/ayush00git/cms-web"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1.5 text-xs text-white/80 bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-md font-medium"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>Source Code</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-base mb-3">Contact Us</h3>
          <ul className="text-sm text-[#999999] space-y-3">
            <li>
              <a
                href="https://maps.google.com/?q=NIT+Hamirpur,+Himachal+Pradesh+177005"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 hover:text-white transition-colors"
              >
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#666666]" />
                <span>NIT Hamirpur, Anu, Hamirpur, Himachal Pradesh 177005</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:admin.cccms@nith.ac.in"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0 text-[#666666]" />
                <span>admin.cccms@nith.ac.in</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#222222] py-4 text-center text-xs text-[#555555]">
        &copy; {new Date().getFullYear()} National Institute of Technology Hamirpur. All Rights Reserved.
      </div>
    </footer>
  );
}

