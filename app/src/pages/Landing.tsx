import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

export function Landing() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="w-100 position-relative border-bottom border-4 border-nith-accent overflow-hidden" style={{ height: '400px' }}>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/c/ca/NIT_Hamirpur%2C_Himachal_Pradesh.jpg" 
          alt="NIT Hamirpur Campus" 
          className="w-100 h-100 object-fit-cover"
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <h2 className="display-5 fw-bold text-center mb-3">Complaint Management System</h2>
          <p className="fs-5 text-center">Estate Office, National Institute of Technology Hamirpur</p>
        </div>
      </div>

      {/* Quick Tracking Bar */}
      <div className="bg-light border-bottom border-secondary shadow-sm py-4">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-center gap-3">
          <div className="fs-5 fw-semibold text-nith-primary">Quick Track:</div>
          <div className="input-group w-100" style={{ maxWidth: '600px' }}>
            <input 
              type="text" 
              placeholder="Enter your Complaint ID (e.g. CMS-1042)" 
              className="form-control form-control-lg border-0 shadow-sm"
            />
            <button className="btn bg-nith-accent fw-bold text-white shadow-sm d-flex align-items-center px-4">
              <Search className="me-2" size={20} /> Track Status
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="container flex-grow-1 py-5">
        <div className="row g-4">
          
          {/* Estate Office Notices */}
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-nith-primary text-white py-3 fw-semibold d-flex justify-content-between align-items-center rounded-top">
                <span className="mb-0">Estate Office Notices</span>
                <button className="btn btn-sm bg-nith-accent text-white py-0 px-2" style={{ fontSize: '0.75rem' }}>View All</button>
              </div>
              <div className="card-body overflow-auto" style={{ maxHeight: '350px' }}>
                <ul className="list-unstyled mb-0">
                  <li className="border-bottom pb-3 mb-3">
                    <span className="badge bg-danger mb-2">Urgent</span>
                    <a href="#" className="d-block text-dark text-decoration-none fw-medium small mb-1 hover-text-nith-primary-light">
                      Scheduled Power Outage in Main Admin Block due to HT panel maintenance.
                    </a>
                    <small className="text-secondary">20 May, 2026</small>
                  </li>
                  <li className="border-bottom pb-3 mb-3">
                    <span className="badge bg-nith-accent mb-2">New</span>
                    <a href="#" className="d-block text-dark text-decoration-none fw-medium small mb-1 hover-text-nith-primary-light">
                      Water supply disruption expected in Kailash Boys Hostel for pipe repair.
                    </a>
                    <small className="text-secondary">18 May, 2026</small>
                  </li>
                  <li className="border-bottom pb-3 mb-3">
                    <a href="#" className="d-block text-dark text-decoration-none fw-medium small mb-1 hover-text-nith-primary-light">
                      Annual AC servicing schedule released for Departmental Buildings.
                    </a>
                    <small className="text-secondary">15 May, 2026</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Guidelines & Manuals */}
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-nith-primary text-white py-3 fw-semibold d-flex justify-content-between align-items-center rounded-top">
                <span className="mb-0">Filing Guidelines</span>
              </div>
              <div className="card-body overflow-auto" style={{ maxHeight: '350px' }}>
                <ul className="list-unstyled mb-0">
                  <li className="d-flex align-items-start border-bottom pb-3 mb-3">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle me-3 mt-1">1</span>
                    <a href="#" className="text-dark text-decoration-none fw-medium small hover-text-nith-primary-light">
                      Select correct category (Civil/Electrical) to avoid delays.
                    </a>
                  </li>
                  <li className="d-flex align-items-start border-bottom pb-3 mb-3">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle me-3 mt-1">2</span>
                    <a href="#" className="text-dark text-decoration-none fw-medium small hover-text-nith-primary-light">
                      Provide accurate location (Building/Room No) in the description.
                    </a>
                  </li>
                  <li className="d-flex align-items-start border-bottom pb-3 mb-3">
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle me-3 mt-1">3</span>
                    <a href="#" className="text-dark text-decoration-none fw-medium small hover-text-nith-primary-light">
                      Only Wardens can file complaints for hostel common areas.
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-nith-primary-light fw-bold small text-decoration-none">
                      Read Complete Manual &rarr;
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Links & Portal Access */}
          <div className="col-12 col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-header bg-nith-primary text-white py-3 fw-semibold d-flex justify-content-between align-items-center rounded-top">
                <span className="mb-0">Portal Access</span>
              </div>
              <div className="card-body d-flex flex-column gap-3 p-4">
                <Link to="/login/faculty" className="btn btn-nith-primary-light text-white w-100 py-2 fw-semibold border-0" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                  Login as Faculty
                </Link>
                <Link to="/login/warden" className="btn btn-nith-primary-light text-white w-100 py-2 fw-semibold border-0" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                  Login as Warden
                </Link>
                <Link to="/login/centre-head" className="btn btn-nith-primary-light text-white w-100 py-2 fw-semibold border-0" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                  Login as Centre Head
                </Link>
                
                <div className="mt-auto pt-4 border-top">
                  <p className="small text-secondary mb-2">Estate Office Administration</p>
                  <Link to="/login/staff" className="btn btn-outline-primary text-nith-primary border-nith-primary w-100 py-2 fw-semibold">
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
