import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-white py-2 shadow-sm relative z-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <Link to="/" className="flex items-center space-x-4 mb-4 md:mb-0">
          <img 
            src="/logo nith.png" 
            alt="NITH Logo" 
            className="w-18 h-18 object-contain"
          />
          <div className="text-center md:text-left flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-[#2d2d2d] leading-tight">
              राष्ट्रीय प्रौद्योगिकी संस्थान हमीरपुर
            </h1>
            <h2 className="text-lg md:text-xl font-bold text-[#2d2d2d] leading-tight">
              National Institute of Technology Hamirpur
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              An Institute of National Importance under Ministry of Education, Govt. of India
              </p>
          </div>
        </Link>
        <div className="flex space-x-4">
          {/* Right side logos could go here */}
        </div>
      </div>
    </header>
  );
}
