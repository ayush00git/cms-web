import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-white border-b border-[#E5E5E5] py-4">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-5">
          <img
            src="/logo nith.png"
            alt="NITH Logo"
            className="w-16 h-16 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#666666] tracking-wide">
              राष्ट्रीय प्रौद्योगिकी संस्थान हमीरपुर
            </span>
            <span className="text-xl font-bold text-[#111111] leading-tight">
              National Institute of Technology Hamirpur
            </span>
            <span className="text-xs text-[#666666] mt-0.5">
              An Institute of National Importance · Ministry of Education, Govt. of India
            </span>
          </div>
        </Link>

        <div className="hidden md:flex flex-col items-end gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#666666]">Estate Office</span>
          <span className="text-lg font-bold text-[#111111]">Complaint Management</span>
        </div>
      </div>
    </header>
  );
}
