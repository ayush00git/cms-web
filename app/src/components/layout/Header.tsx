import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-white border-b border-[#E5E5E5] py-3 sm:py-4">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 sm:gap-5 min-w-0">
          <img
            src="/logo_nith.png"
            alt="NITH Logo"
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-[#666666] tracking-wide truncate">
              राष्ट्रीय प्रौद्योगिकी संस्थान हमीरपुर
            </span>
            <span className="text-base sm:text-xl font-bold text-[#111111] leading-tight">
              National Institute of Technology Hamirpur
            </span>
            <span className="hidden sm:block text-xs text-[#666666] mt-0.5">
              An Institute of National Importance · Ministry of Education, Govt. of India
            </span>
          </div>
        </Link>

        <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
          <span className="text-lg font-bold text-[#111111]">Construction Cell Complaint Management</span>
        </div>
      </div>
    </header>
  );
}

