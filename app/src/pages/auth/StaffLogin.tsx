import { MainLayout } from '../../components/layout/MainLayout';

export function StaffLogin() {
  return (
    <MainLayout>
      <div className="container py-5 d-flex justify-content-center">
        <div className="card w-100 shadow-sm border-0" style={{ maxWidth: '450px' }}>
          <div className="card-header bg-nith-primary text-white py-3">
            <h2 className="fs-5 fw-bold mb-1">Estate Office Staff Login</h2>
            <p className="small text-white-50 mb-0">Secure portal for XEN / AE / JE.</p>
          </div>
          
          <div className="card-body p-4">
            <form>
              <div className="mb-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">Staff Email Address</label>
                  <input type="email" className="form-control" placeholder="staff@nith.ac.in" required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark small">Password</label>
                  <input type="password" className="form-control" placeholder="••••••••" required />
                </div>
              </div>

              <div className="pt-3 border-top">
                <button type="submit" className="btn btn-nith-primary-light text-white fw-bold w-100 py-2" style={{ backgroundColor: 'var(--color-primary-light)' }}>
                  Login to Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
