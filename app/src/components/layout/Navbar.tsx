import { Search, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="bg-[#00509e] text-white shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap items-center justify-center text-sm md:text-base font-semibold">
          <li className="px-4 py-3 hover:bg-[#003366] cursor-pointer">
            <Link to="/">Home</Link>
          </li>
          <li className="px-4 py-3 hover:bg-[#003366] cursor-pointer flex items-center group relative">
            Lodge Complaint <ChevronDown className="ml-1 w-4 h-4" />
            <div className="absolute top-full left-0 hidden group-hover:block bg-white text-gray-800 shadow-lg min-w-[200px] rounded-b border border-gray-100">
              <Link to="/signup/faculty" className="block px-4 py-2 hover:bg-gray-100">Faculty</Link>
              <Link to="/signup/warden" className="block px-4 py-2 hover:bg-gray-100">Warden</Link>
              <Link to="/signup/centre-head" className="block px-4 py-2 hover:bg-gray-100">Centre Head</Link>
            </div>
          </li>
          <li className="px-4 py-3 hover:bg-[#003366] cursor-pointer">Track Status</li>
          <li className="px-4 py-3 hover:bg-[#003366] cursor-pointer flex items-center">
            Estate Office Administration <ChevronDown className="ml-1 w-4 h-4" />
          </li>
          <li className="px-4 py-3 hover:bg-[#003366] cursor-pointer">Guidelines</li>
          <li className="px-4 py-3 hover:bg-[#003366] cursor-pointer">Contact Us</li>
          
          <li className="ml-auto px-4 py-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-8 pr-2 py-1 rounded-sm text-black focus:outline-none focus:ring-2 focus:ring-[#ff9900]"
              />
              <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-500" />
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
