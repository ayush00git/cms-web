import { Search, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="bg-nith-primary-light shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <ul className="flex flex-wrap items-center justify-center md:justify-start font-semibold w-full text-white m-0 p-0 list-none">
          <li>
            <Link to="/" className="block px-4 py-3 hover:bg-nith-primary transition-colors">Home</Link>
          </li>
          <li className="relative group">
            <button className="flex items-center px-4 py-3 hover:bg-nith-primary transition-colors cursor-pointer">
              Lodge Complaint <ChevronDown className="ml-1" size={16} />
            </button>
            <ul className="absolute left-0 hidden group-hover:block bg-white text-gray-800 shadow-lg min-w-[200px] border border-gray-100 p-0 m-0 list-none">
              <li><Link to="/signup/faculty" className="block px-4 py-2 hover:bg-gray-100">Faculty</Link></li>
              <li><Link to="/signup/warden" className="block px-4 py-2 hover:bg-gray-100">Warden</Link></li>
              <li><Link to="/signup/centre-head" className="block px-4 py-2 hover:bg-gray-100">Centre Head</Link></li>
            </ul>
          </li>
          <li>
            <span className="block px-4 py-3 hover:bg-nith-primary transition-colors cursor-pointer">Track Status</span>
          </li>
          <li className="relative group">
            <button className="flex items-center px-4 py-3 hover:bg-nith-primary transition-colors cursor-pointer">
              Estate Office Administration <ChevronDown className="ml-1" size={16} />
            </button>
            <ul className="absolute left-0 hidden group-hover:block bg-white text-gray-800 shadow-lg min-w-[200px] border border-gray-100 p-0 m-0 list-none">
              <li><Link to="/login/staff" className="block px-4 py-2 hover:bg-gray-100">Staff Login</Link></li>
            </ul>
          </li>
          <li>
            <span className="block px-4 py-3 hover:bg-nith-primary transition-colors cursor-pointer">Guidelines</span>
          </li>
          <li>
            <span className="block px-4 py-3 hover:bg-nith-primary transition-colors cursor-pointer">Contact Us</span>
          </li>
          
          <li className="md:ml-auto py-2 px-4 w-full md:w-auto">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full md:w-48 pl-8 pr-3 py-1.5 text-sm bg-white border border-transparent rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-nith-accent text-gray-800"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
