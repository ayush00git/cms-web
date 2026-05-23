import { Search, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="bg-[#4a4a4a] text-white shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap items-center justify-center text-sm md:text-base font-semibold">
          <li className="px-4 py-1.5 hover:bg-[#2d2d2d] cursor-pointer">
            <Link to="/">Home</Link>
          </li>
          <li className="px-4 py-1.5 hover:bg-[#2d2d2d] cursor-pointer flex items-center group relative">
            Lodge Complaint <ChevronDown className="ml-1 w-4 h-4" />
            <div className="absolute top-full left-0 hidden group-hover:block bg-white text-gray-800 shadow-lg min-w-[200px] rounded-b border border-gray-100">
              <Link to="/faculty/signup" className="block px-4 py-2 hover:bg-gray-100">Faculty</Link>
              <Link to="/warden/signup" className="block px-4 py-2 hover:bg-gray-100">Warden</Link>
              <Link to="/centre-head/signup" className="block px-4 py-2 hover:bg-gray-100">Centre Head</Link>
            </div>
          </li>
          <li className="px-4 py-1.5 hover:bg-[#2d2d2d] cursor-pointer">Track Status</li>
          <li className="px-4 py-1.5 hover:bg-[#2d2d2d] cursor-pointer flex items-center">
            Estate Office Administration <ChevronDown className="ml-1 w-4 h-4" />
          </li>
          <li className="px-4 py-1.5 hover:bg-[#2d2d2d] cursor-pointer">Guidelines</li>
          <li className="px-4 py-1.5 hover:bg-[#2d2d2d] cursor-pointer">Contact Us</li>
          
          <li className="ml-auto px-4 py-1 flex items-center">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-1 w-44 text-xs bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-gray-300 rounded-full border border-white/10 focus:border-[#ff9900] outline-none transition-all duration-300 focus:w-52"
              />
              <Search className="absolute left-3 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
