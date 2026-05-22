import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

export function Landing() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="w-full relative border-b-4 border-nith-accent overflow-hidden h-[400px]">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/c/ca/NIT_Hamirpur%2C_Himachal_Pradesh.jpg" 
          alt="NIT Hamirpur Campus" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-white bg-black/30">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-3">Complaint Management System</h2>
          <p className="text-lg md:text-xl text-center">Estate Office, National Institute of Technology Hamirpur</p>
        </div>
      </div>

      {/* Quick Tracking Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="text-xl font-semibold text-nith-primary">Quick Track:</div>
          <div className="flex w-full max-w-[600px] shadow-sm rounded-md overflow-hidden">
            <input 
              type="text" 
              placeholder="Enter your Complaint ID (e.g. CMS-1042)" 
              className="flex-grow px-4 py-3 border border-r-0 border-gray-300 focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary"
            />
            <button className="bg-nith-accent hover:bg-orange-600 transition-colors font-bold text-white px-6 py-3 flex items-center whitespace-nowrap">
              <Search className="mr-2" size={20} /> Track Status
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="container mx-auto px-4 flex-grow py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Estate Office Notices */}
          <div className="col-span-1">
            <div className="bg-white h-full shadow-sm rounded-md overflow-hidden border border-gray-100 flex flex-col">
              <div className="bg-nith-primary text-white py-3 px-4 font-semibold flex justify-between items-center">
                <span className="m-0">Estate Office Notices</span>
                <button className="bg-nith-accent hover:bg-orange-600 transition-colors text-white py-1 px-3 text-xs rounded">View All</button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[350px] flex-grow">
                <ul className="list-none m-0 p-0">
                  <li className="border-b border-gray-100 pb-3 mb-3">
                    <span className="inline-block bg-red-600 text-white text-xs px-2 py-0.5 rounded mb-2">Urgent</span>
                    <a href="#" className="block text-gray-800 no-underline font-medium text-sm mb-1 hover:text-nith-primary-light">
                      Scheduled Power Outage in Main Admin Block due to HT panel maintenance.
                    </a>
                    <span className="text-xs text-gray-500">20 May, 2026</span>
                  </li>
                  <li className="border-b border-gray-100 pb-3 mb-3">
                    <span className="inline-block bg-nith-accent text-white text-xs px-2 py-0.5 rounded mb-2">New</span>
                    <a href="#" className="block text-gray-800 no-underline font-medium text-sm mb-1 hover:text-nith-primary-light">
                      Water supply disruption expected in Kailash Boys Hostel for pipe repair.
                    </a>
                    <span className="text-xs text-gray-500">18 May, 2026</span>
                  </li>
                  <li className="border-b border-gray-100 pb-3 mb-3">
                    <a href="#" className="block text-gray-800 no-underline font-medium text-sm mb-1 hover:text-nith-primary-light">
                      Annual AC servicing schedule released for Departmental Buildings.
                    </a>
                    <span className="text-xs text-gray-500">15 May, 2026</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Guidelines & Manuals */}
          <div className="col-span-1">
            <div className="bg-white h-full shadow-sm rounded-md overflow-hidden border border-gray-100 flex flex-col">
              <div className="bg-nith-primary text-white py-3 px-4 font-semibold flex justify-between items-center">
                <span className="m-0">Filing Guidelines</span>
              </div>
              <div className="p-4 overflow-y-auto max-h-[350px] flex-grow">
                <ul className="list-none m-0 p-0">
                  <li className="flex items-start border-b border-gray-100 pb-3 mb-3">
                    <span className="bg-blue-50 text-blue-600 border border-blue-200 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shrink-0">1</span>
                    <a href="#" className="text-gray-800 no-underline font-medium text-sm hover:text-nith-primary-light">
                      Select correct category (Civil/Electrical) to avoid delays.
                    </a>
                  </li>
                  <li className="flex items-start border-b border-gray-100 pb-3 mb-3">
                    <span className="bg-blue-50 text-blue-600 border border-blue-200 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shrink-0">2</span>
                    <a href="#" className="text-gray-800 no-underline font-medium text-sm hover:text-nith-primary-light">
                      Provide accurate location (Building/Room No) in the description.
                    </a>
                  </li>
                  <li className="flex items-start border-b border-gray-100 pb-3 mb-3">
                    <span className="bg-blue-50 text-blue-600 border border-blue-200 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shrink-0">3</span>
                    <a href="#" className="text-gray-800 no-underline font-medium text-sm hover:text-nith-primary-light">
                      Only Wardens can file complaints for hostel common areas.
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-nith-primary-light font-bold text-sm no-underline hover:underline">
                      Read Complete Manual &rarr;
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Links & Portal Access */}
          <div className="col-span-1">
            <div className="bg-white h-full shadow-sm rounded-md overflow-hidden border border-gray-100 flex flex-col">
              <div className="bg-nith-primary text-white py-3 px-4 font-semibold flex justify-between items-center">
                <span className="m-0">Portal Access</span>
              </div>
              <div className="flex flex-col gap-3 p-5 flex-grow">
                <Link to="/login/faculty" className="bg-nith-primary-light hover:bg-nith-primary transition-colors text-white text-center w-full py-2.5 rounded font-semibold no-underline">
                  Login as Faculty
                </Link>
                <Link to="/login/warden" className="bg-nith-primary-light hover:bg-nith-primary transition-colors text-white text-center w-full py-2.5 rounded font-semibold no-underline">
                  Login as Warden
                </Link>
                <Link to="/login/centre-head" className="bg-nith-primary-light hover:bg-nith-primary transition-colors text-white text-center w-full py-2.5 rounded font-semibold no-underline">
                  Login as Centre Head
                </Link>
                
                <div className="mt-auto pt-5 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Estate Office Administration</p>
                  <Link to="/login/staff" className="block text-center border-2 border-nith-primary text-nith-primary hover:bg-nith-primary hover:text-white transition-colors w-full py-2 rounded font-semibold no-underline">
                    Staff Login (XEN / AE / JE)
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </MainLayout>
  );
}
