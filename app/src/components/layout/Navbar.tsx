import { Search, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="bg-nith-primary-light shadow-sm sticky-top">
      <div className="container">
        <ul className="nav d-flex flex-wrap align-items-center justify-content-center fw-semibold mb-0 w-100">
          <li className="nav-item">
            <Link to="/" className="nav-link text-white px-3 py-3 hover-bg-nith-primary-light">Home</Link>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link text-white px-3 py-3 hover-bg-nith-primary-light d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Lodge Complaint <ChevronDown className="ms-1" size={16} />
            </a>
            <ul className="dropdown-menu border-0 shadow-sm mt-0 rounded-0">
              <li><Link to="/signup/faculty" className="dropdown-item py-2">Faculty</Link></li>
              <li><Link to="/signup/warden" className="dropdown-item py-2">Warden</Link></li>
              <li><Link to="/signup/centre-head" className="dropdown-item py-2">Centre Head</Link></li>
            </ul>
          </li>
          <li className="nav-item">
            <span className="nav-link text-white px-3 py-3 hover-bg-nith-primary-light" style={{cursor: 'pointer'}}>Track Status</span>
          </li>
          <li className="nav-item dropdown">
            <a className="nav-link text-white px-3 py-3 hover-bg-nith-primary-light d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Estate Office Administration <ChevronDown className="ms-1" size={16} />
            </a>
            <ul className="dropdown-menu border-0 shadow-sm mt-0 rounded-0">
              <li><Link to="/login/staff" className="dropdown-item py-2">Staff Login</Link></li>
            </ul>
          </li>
          <li className="nav-item">
            <span className="nav-link text-white px-3 py-3 hover-bg-nith-primary-light" style={{cursor: 'pointer'}}>Guidelines</span>
          </li>
          <li className="nav-item">
            <span className="nav-link text-white px-3 py-3 hover-bg-nith-primary-light" style={{cursor: 'pointer'}}>Contact Us</span>
          </li>
          
          <li className="nav-item ms-auto py-2">
            <div className="position-relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="form-control form-control-sm ps-4 border-0 shadow-none rounded-1"
              />
              <Search className="position-absolute start-0 top-50 translate-middle-y ms-2 text-secondary" size={14} />
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
