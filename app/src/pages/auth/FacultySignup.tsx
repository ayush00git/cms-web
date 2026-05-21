import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { DEPARTMENTS, BLOCK_LABELS, BLOCK_TYPES } from '../../constants/models';

export function FacultySignup() {
  return (
    <MainLayout>
      <div className="container py-5 d-flex justify-content-center">
        <div className="card w-100 shadow-sm border-0" style={{ maxWidth: '750px' }}>
          <div className="card-header bg-nith-primary text-white py-3">
            <h2 className="fs-5 fw-bold mb-1">Faculty Registration</h2>
            <p className="small text-white-50 mb-0">Register to lodge and track Estate Office complaints.</p>
          </div>
          
          <div className="card-body p-4">
            <form>
              <div className="row g-3 mb-4">
                
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark small">Full Name</label>
                  <input type="text" className="form-control" placeholder="Dr. John Doe" required />
                </div>
                
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark small">Email Address</label>
                  <input type="email" className="form-control" placeholder="john@nith.ac.in" required />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark small">Password</label>
                  <input type="password" className="form-control" placeholder="••••••••" required />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-dark small">Phone Number</label>
                  <input type="tel" className="form-control" placeholder="10-digit number" pattern="[0-9]{10}" required />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-dark small">Department</label>
                  <select className="form-select" required defaultValue="">
                    <option value="" disabled>Select your Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold text-dark small">House Number</label>
                  <input type="text" className="form-control" placeholder="e.g. 104" required />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold text-dark small">Block</label>
                  <select className="form-select" required defaultValue="">
                    <option value="" disabled>Select Block</option>
                    {BLOCK_LABELS.map(block => (
                      <option key={block.value} value={block.value}>{block.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold text-dark small">Type</label>
                  <select className="form-select" required defaultValue="">
                    <option value="" disabled>Select Type</option>
                    {BLOCK_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="pt-3 border-top">
                <button type="submit" className="btn bg-nith-accent text-white fw-bold w-100 py-2">
                  Register as Faculty
                </button>
              </div>
              
              <p className="text-center small text-secondary mt-3 mb-0">
                Already registered? <Link to="/login/faculty" className="text-nith-primary-light fw-semibold text-decoration-none">Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
