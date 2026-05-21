import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';

export function WardenLogin() {
  return (
    <MainLayout>
      <div className="container py-5 d-flex justify-content-center">
        <div className="card w-100 shadow-sm border-0" style={{ maxWidth: '450px' }}>
          <div className="card-header bg-nith-primary text-white py-3">
            <h2 className="fs-5 fw-bold mb-1">Warden Login</h2>
            <p className="small text-white-50 mb-0">Access your hostel complaint dashboard.</p>
          </div>
          
          <div className="card-body p-4">
            <form>
              <div className="mb-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">Email Address</label>
                  <input type="email" className="form-control" placeholder="warden@nith.ac.in" required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">Password</label>
                  <input type="password" className="form-control" placeholder="••••••••" required />
                </div>
              </div>

              <div className="pt-3 border-top">
                <button type="submit" className="btn bg-nith-accent text-white fw-bold w-100 py-2">
                  Login
                </button>
              </div>
              
              <p className="text-center small text-secondary mt-3 mb-0">
                Don't have an account? <Link to="/signup/warden" className="text-nith-primary-light fw-semibold text-decoration-none">Register here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
