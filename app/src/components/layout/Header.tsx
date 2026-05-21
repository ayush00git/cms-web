import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-white py-3 shadow-sm position-relative z-index-20">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <Link to="/" className="d-flex align-items-center mb-3 mb-md-0 text-decoration-none">
          <img 
            src="/logo nith.png" 
            alt="NITH Logo" 
            className="img-fluid me-3"
            style={{ width: '96px', height: '96px', objectFit: 'contain' }}
          />
          <div className="text-center text-md-start d-flex flex-column">
            <h1 className="fs-3 fw-bold text-nith-primary lh-sm mb-0">
              राष्ट्रीय प्रौद्योगिकी संस्थान हमीरपुर
            </h1>
            <h2 className="fs-4 fw-bold text-nith-primary lh-sm mb-1">
              National Institute of Technology Hamirpur
            </h2>
            <p className="small text-secondary mt-1 mb-0">
              An Institute of National Importance under Ministry of Education, Govt. of India
            </p>
          </div>
        </Link>
        <div className="d-flex gap-3">
          {/* Right side logos could go here */}
        </div>
      </div>
    </header>
  );
}
