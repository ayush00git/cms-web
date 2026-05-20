import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

export function Landing() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="w-full h-[400px] relative border-b-4 border-[#ff9900] overflow-hidden">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/c/ca/NIT_Hamirpur%2C_Himachal_Pradesh.jpg" 
          alt="NIT Hamirpur Campus" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center flex-col text-white">
          <h2 className="text-4xl md:text-5xl font-bold text-center drop-shadow-lg mb-4">Complaint Management System</h2>
          <p className="text-lg md:text-xl text-center drop-shadow-md">Estate Office, National Institute of Technology Hamirpur</p>
        </div>
      </div>

      {/* Quick Tracking Bar */}
      <div className="bg-gray-100 border-b border-gray-300 shadow-sm py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="text-lg font-semibold text-[#003366]">Quick Track:</div>
          <div className="flex w-full md:w-1/2 max-w-xl relative shadow-md rounded-md overflow-hidden">
            <input 
              type="text" 
              placeholder="Enter your Complaint ID (e.g. CMS-1042)" 
              className="w-full px-4 py-3 outline-none text-gray-700"
            />
            <button className="bg-[#ff9900] hover:bg-orange-500 text-white font-bold px-6 py-3 transition-colors flex items-center whitespace-nowrap">
              <Search className="w-5 h-5 mr-2" /> Track Status
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Estate Office Notices */}
          <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="bg-[#003366] text-white px-4 py-3 font-semibold flex justify-between items-center">
              <span>Estate Office Notices</span>
              <button className="text-xs bg-[#ff9900] px-2 py-1 rounded">View All</button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              <ul className="space-y-4">
                <li className="border-b border-gray-100 pb-2">
                  <span className="text-xs text-red-500 font-bold block mb-1">Urgent</span>
                  <a href="#" className="text-sm text-gray-700 hover:text-[#00509e] font-medium leading-tight block">
                    Scheduled Power Outage in Main Admin Block due to HT panel maintenance.
                  </a>
                  <span className="text-xs text-gray-500 block mt-1">20 May, 2026</span>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <span className="text-xs text-[#ff9900] font-bold block mb-1">New</span>
                  <a href="#" className="text-sm text-gray-700 hover:text-[#00509e] font-medium leading-tight block">
                    Water supply disruption expected in Kailash Boys Hostel for pipe repair.
                  </a>
                  <span className="text-xs text-gray-500 block mt-1">18 May, 2026</span>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <a href="#" className="text-sm text-gray-700 hover:text-[#00509e] font-medium leading-tight block">
                    Annual AC servicing schedule released for Departmental Buildings.
                  </a>
                  <span className="text-xs text-gray-500 block mt-1">15 May, 2026</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Guidelines & Manuals */}
          <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="bg-[#003366] text-white px-4 py-3 font-semibold flex justify-between items-center">
              <span>Filing Guidelines</span>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              <ul className="space-y-4">
                <li className="border-b border-gray-100 pb-3">
                  <div className="flex space-x-3 items-start">
                    <div className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs font-bold mt-1">1</div>
                    <div>
                      <a href="#" className="text-sm text-gray-700 hover:text-[#00509e] font-medium block">
                        Select correct category (Civil/Electrical) to avoid delays.
                      </a>
                    </div>
                  </div>
                </li>
                <li className="border-b border-gray-100 pb-3">
                  <div className="flex space-x-3 items-start">
                    <div className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs font-bold mt-1">2</div>
                    <div>
                      <a href="#" className="text-sm text-gray-700 hover:text-[#00509e] font-medium block">
                        Provide accurate location (Building/Room No) in the description.
                      </a>
                    </div>
                  </div>
                </li>
                <li className="border-b border-gray-100 pb-3">
                  <div className="flex space-x-3 items-start">
                    <div className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs font-bold mt-1">3</div>
                    <div>
                      <a href="#" className="text-sm text-gray-700 hover:text-[#00509e] font-medium block">
                        Only Wardens can file complaints for hostel common areas.
                      </a>
                    </div>
                  </div>
                </li>
                <li>
                  <a href="#" className="text-sm text-[#00509e] hover:underline font-bold block mt-2">
                    Read Complete Manual &rarr;
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Links & Portal Access */}
          <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="bg-[#003366] text-white px-4 py-3 font-semibold flex justify-between items-center">
              <span>Portal Access</span>
            </div>
            <div className="p-6 overflow-y-auto flex-grow flex flex-col space-y-4">
              <Link to="/login/faculty" className="w-full bg-[#00509e] hover:bg-[#003366] text-white py-3 rounded text-sm font-semibold transition-colors text-center block">
                Login as Faculty
              </Link>
              <Link to="/login/warden" className="w-full bg-[#00509e] hover:bg-[#003366] text-white py-3 rounded text-sm font-semibold transition-colors text-center block">
                Login as Warden
              </Link>
              <Link to="/login/centre-head" className="w-full bg-[#00509e] hover:bg-[#003366] text-white py-3 rounded text-sm font-semibold transition-colors text-center block">
                Login as Centre Head
              </Link>
              
              <div className="mt-auto pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Estate Office Administration</p>
                <Link to="/login/staff" className="w-full border border-[#00509e] text-[#00509e] hover:bg-gray-50 py-2 rounded text-sm font-semibold transition-colors text-center block">
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
