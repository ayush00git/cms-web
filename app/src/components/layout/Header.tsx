import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-white py-4 shadow-sm relative z-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <Link to="/" className="flex flex-col md:flex-row items-center mb-3 md:mb-0 no-underline">
          <img 
            src="/logo nith.png" 
            alt="NITH Logo" 
            className="w-24 h-24 object-contain md:mr-4 mb-2 md:mb-0"
          />
          <div className="text-center md:text-left flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold text-nith-primary leading-tight mb-0">
              राष्ट्रीय प्रौद्योगिकी संस्थान हमीरपुर
            </h1>
            <h2 className="text-lg md:text-xl font-bold text-nith-primary leading-tight mb-1">
              National Institute of Technology Hamirpur
            </h2>
            <p className="text-sm text-gray-600 mt-1 mb-0">
              An Institute of National Importance under Ministry of Education, Govt. of India
            </p>
          </div>
        </Link>
        <div className="flex gap-3">
          {/* Right side logos could go here */}
        </div>
      </div>
    </header>
  );
}
