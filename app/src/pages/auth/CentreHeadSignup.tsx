import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { BUILDINGS } from '../../constants/models';

export function CentreHeadSignup() {
  return (
    <MainLayout>
      <div className="container py-5 d-flex justify-content-center">
        <div className="card w-100 shadow-sm border-0" style={{ maxWidth: '550px' }}>
          <div className="card-header bg-nith-primary text-white py-3">
            <h2 className="fs-5 fw-bold mb-1">Centre Head Registration</h2>
            <p className="small text-white-50 mb-0">Register to manage complaints for your Building/Centre.</p>
          </div>
          
          <div className="card-body p-4">
            <form>
              <div className="mb-4">
                
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">Email Address</label>
                  <input type="email" className="form-control" placeholder="head@nith.ac.in" required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">Password</label>
                  <input type="password" className="form-control" placeholder="••••••••" required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">Phone Number</label>
                  <input type="tel" className="form-control" placeholder="10-digit number" pattern="[0-9]{10}" required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">Assigned Building / Centre</label>
                  <select className="form-select" required defaultValue="">
                    <option value="" disabled>Select your Building</option>
                    {BUILDINGS.map(building => (
                      <option key={building.value} value={building.value}>{building.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="pt-3 border-top">
                <button type="submit" className="btn bg-nith-accent text-white fw-bold w-100 py-2">
                  Register as Centre Head
                </button>
              </div>
              
              <p className="text-center small text-secondary mt-3 mb-0">
                Already registered? <Link to="/login/centre-head" className="text-nith-primary-light fw-semibold text-decoration-none">Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
