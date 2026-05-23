import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

export function Landing() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="w-full h-[200px] relative bg-[#2d2d2d] border-b-4 border-[#ff9900] overflow-hidden flex items-center">
        {/* Sleek Solid Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="container mx-auto px-6 relative z-10 w-full">
          {/* Left Content */}
          <div className="flex flex-col max-w-2xl">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ff9900]/10 text-[#ff9900] border border-[#ff9900]/20 w-fit mb-2">
              ESTATE OFFICE PORTAL
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Complaint Management System
            </h2>
            <p className="text-sm md:text-base text-zinc-300 mt-1.5 font-medium">
              National Institute of Technology Hamirpur
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tracking Bar */}
      <div className="bg-gray-50 border-b border-gray-200 shadow-sm py-3">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="text-xs font-bold text-[#2d2d2d] tracking-wider uppercase">Quick Track:</div>
          <div className="flex w-full md:w-1/2 max-w-xl relative bg-white border border-gray-200 focus-within:border-[#ff9900] focus-within:ring-4 focus-within:ring-[#ff9900]/10 rounded-full p-1 transition-all duration-300 shadow-sm">
            <input 
              type="text" 
              placeholder="Enter Complaint ID (e.g. CMS-1042)" 
              className="w-full pl-5 pr-3 py-2 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
            />
            <button className="bg-[#ff9900] hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-2 rounded-full transition-all duration-300 flex items-center whitespace-nowrap shadow-sm">
              <Search className="w-3.5 h-3.5 mr-1.5" /> Track Status
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Estate Office Notices */}
          <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="bg-[#2d2d2d] text-white px-4 py-2 font-semibold flex justify-between items-center">
              <span>Estate Office Notices</span>
              <button className="text-xs bg-[#ff9900] px-2 py-1 rounded">View All</button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              <ul className="space-y-4">
                <li className="border-b border-gray-100 pb-2">
                  <span className="text-xs text-red-500 font-bold block mb-1">Urgent</span>
                  <a href="#" className="text-sm text-gray-700 hover:text-[#4a4a4a] font-medium leading-tight block">
                    Scheduled Power Outage in Main Admin Block due to HT panel maintenance.
                  </a>
                  <span className="text-xs text-gray-500 block mt-1">20 May, 2026</span>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <span className="text-xs text-[#ff9900] font-bold block mb-1">New</span>
                  <a href="#" className="text-sm text-gray-700 hover:text-[#4a4a4a] font-medium leading-tight block">
                    Water supply disruption expected in Kailash Boys Hostel for pipe repair.
                  </a>
                  <span className="text-xs text-gray-500 block mt-1">18 May, 2026</span>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <a href="#" className="text-sm text-gray-700 hover:text-[#4a4a4a] font-medium leading-tight block">
                    Annual AC servicing schedule released for Departmental Buildings.
                  </a>
                  <span className="text-xs text-gray-500 block mt-1">15 May, 2026</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Guidelines & Manuals */}
          <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="bg-[#2d2d2d] text-white px-4 py-2 font-semibold flex justify-between items-center">
              <span>Filing Guidelines</span>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              <ul className="space-y-4">
                <li className="border-b border-gray-100 pb-3">
                  <div className="flex space-x-3 items-start">
                    <div className="bg-gray-100 text-gray-800 rounded px-2 py-1 text-xs font-bold mt-1">1</div>
                    <div>
                      <a href="#" className="text-sm text-gray-700 hover:text-[#4a4a4a] font-medium block">
                        Select correct category (Civil/Electrical) to avoid delays.
                      </a>
                    </div>
                  </div>
                </li>
                <li className="border-b border-gray-100 pb-3">
                  <div className="flex space-x-3 items-start">
                    <div className="bg-gray-100 text-gray-800 rounded px-2 py-1 text-xs font-bold mt-1">2</div>
                    <div>
                      <a href="#" className="text-sm text-gray-700 hover:text-[#4a4a4a] font-medium block">
                        Provide accurate location (Building/Room No) in the description.
                      </a>
                    </div>
                  </div>
                </li>
                <li className="border-b border-gray-100 pb-3">
                  <div className="flex space-x-3 items-start">
                    <div className="bg-gray-100 text-gray-800 rounded px-2 py-1 text-xs font-bold mt-1">3</div>
                    <div>
                      <a href="#" className="text-sm text-gray-700 hover:text-[#4a4a4a] font-medium block">
                        Only Wardens can file complaints for hostel common areas.
                      </a>
                    </div>
                  </div>
                </li>
                <li>
                  <a href="#" className="text-sm text-[#4a4a4a] hover:underline font-bold block mt-2">
                    Read Complete Manual &rarr;
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Links & Portal Access */}
          <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="bg-[#2d2d2d] text-white px-4 py-2 font-semibold flex justify-between items-center">
              <span>Portal Access</span>
            </div>
            <div className="p-6 overflow-y-auto flex-grow flex flex-col space-y-4">
              <Link to="/faculty/login" className="w-full bg-[#4a4a4a] hover:bg-[#2d2d2d] text-white py-3 rounded text-sm font-semibold transition-colors text-center block">
                Login as Faculty
              </Link>
              <Link to="/warden/login" className="w-full bg-[#4a4a4a] hover:bg-[#2d2d2d] text-white py-3 rounded text-sm font-semibold transition-colors text-center block">
                Login as Warden
              </Link>
              <Link to="/centre-head/login" className="w-full bg-[#4a4a4a] hover:bg-[#2d2d2d] text-white py-3 rounded text-sm font-semibold transition-colors text-center block">
                Login as Centre Head
              </Link>
              
              <div className="mt-auto pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Estate Office Administration</p>
                <Link to="/staff/login" className="w-full border border-[#4a4a4a] text-[#4a4a4a] hover:bg-gray-50 py-2 rounded text-sm font-semibold transition-colors text-center block">
                  Staff Login (XEN / AE / JE)
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </MainLayout>
  );
}
