import { Search, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      {/* Top Bar */}
      <div className="bg-[#003366] text-white py-1 px-4 text-xs">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <a href="#" className="hover:text-[#ff9900]">Grey Scale</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-[#ff9900]">Light Mode</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-[#ff9900]">Intranet</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-[#ff9900]">eOffice</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-[#ff9900]">Webmail</a>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-[#ff9900]">Directory</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-[#ff9900]">Contact Us</a>
          </div>
        </div>
      </div>

      {/* Header Section */}
      <header className="bg-white py-4 shadow-sm relative z-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          
          {/* Logo Left */}
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <img 
              src="/logo nith.png" 
              alt="NITH Logo" 
              className="w-24 h-24 object-contain"
            />
            
            <div className="text-center md:text-left flex flex-col">
              <h1 className="text-2xl md:text-3xl font-bold text-[#003366] leading-tight">
                राष्ट्रीय प्रौद्योगिकी संस्थान हमीरपुर
              </h1>
              <h2 className="text-xl md:text-2xl font-bold text-[#003366] leading-tight">
                National Institute of Technology Hamirpur
              </h2>
              <p className="text-sm text-gray-600 mt-1">An Institute of National Importance under Ministry of Education, Govt. of India</p>
            </div>
          </div>

          {/* Logos Right (Removed as per user request) */}
          <div className="flex space-x-4">
            {/* No secondary logos */}
          </div>

        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="bg-[#00509e] text-white shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <ul className="flex flex-wrap items-center justify-center text-sm md:text-base font-semibold">
            <li className="px-4 py-3 hover:bg-[#003366] cursor-pointer">Home</li>
            <li className="px-4 py-3 hover:bg-[#003366] cursor-pointer flex items-center">
              Lodge Complaint <ChevronDown className="ml-1 w-4 h-4" />
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
              <button className="w-full bg-[#00509e] hover:bg-[#003366] text-white py-3 rounded text-sm font-semibold transition-colors">
                Login as Faculty
              </button>
              <button className="w-full bg-[#00509e] hover:bg-[#003366] text-white py-3 rounded text-sm font-semibold transition-colors">
                Login as Warden
              </button>
              <button className="w-full bg-[#00509e] hover:bg-[#003366] text-white py-3 rounded text-sm font-semibold transition-colors">
                Login as Centre Head
              </button>
              
              <div className="mt-auto pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Estate Office Administration</p>
                <button className="w-full border border-[#00509e] text-[#00509e] hover:bg-gray-50 py-2 rounded text-sm font-semibold transition-colors">
                  Staff Login (XEN / AE / JE)
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-[#002244] text-gray-300 py-10 border-t-4 border-[#ff9900]">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">NIT Hamirpur</h3>
            <p className="text-sm leading-relaxed mb-4">
              National Institute of Technology Hamirpur is a public technical university located in Hamirpur, Himachal Pradesh, India.
              The Estate Office is responsible for the overall maintenance of the campus.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="text-sm space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 text-[#ff9900] shrink-0" />
                <span>National Institute of Technology, Anu, Hamirpur, Himachal Pradesh 177005</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-[#ff9900] shrink-0" />
                <span>+91-1972-254011</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-[#ff9900] shrink-0" />
                <span>registrar@nith.ac.in</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-6 border-t border-gray-700 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} National Institute of Technology Hamirpur. All Rights Reserved.</p>
        </div>
      </footer>

    </div>
  );
}
