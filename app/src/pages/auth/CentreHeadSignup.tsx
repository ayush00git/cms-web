import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { BUILDINGS } from '../../constants/models';

export function CentreHeadSignup() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="bg-white w-full shadow-sm border border-gray-100 rounded-md overflow-hidden max-w-[550px]">
          <div className="bg-nith-primary text-white py-4 px-5">
            <h2 className="text-lg font-bold mb-1">Centre Head Registration</h2>
            <p className="text-sm text-white/70 mb-0">Register to manage complaints for your Building/Centre.</p>
          </div>
          
          <div className="p-6">
            <form>
              <div className="mb-6">
                
                <div className="mb-4">
                  <label className="block font-semibold text-gray-800 text-sm mb-1.5">Email Address</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary" placeholder="head@nith.ac.in" required />
                </div>

                <div className="mb-4">
                  <label className="block font-semibold text-gray-800 text-sm mb-1.5">Password</label>
                  <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary" placeholder="••••••••" required />
                </div>

                <div className="mb-4">
                  <label className="block font-semibold text-gray-800 text-sm mb-1.5">Phone Number</label>
                  <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary" placeholder="10-digit number" pattern="[0-9]{10}" required />
                </div>

                <div className="mb-4">
                  <label className="block font-semibold text-gray-800 text-sm mb-1.5">Assigned Building / Centre</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary bg-white" required defaultValue="">
                    <option value="" disabled>Select your Building</option>
                    {BUILDINGS.map(building => (
                      <option key={building.value} value={building.value}>{building.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="pt-4 border-t border-gray-100">
                <button type="submit" className="bg-nith-accent hover:bg-orange-600 transition-colors text-white font-bold w-full py-2.5 rounded">
                  Register as Centre Head
                </button>
              </div>
              
              <p className="text-center text-sm text-gray-500 mt-4 mb-0">
                Already registered? <Link to="/login/centre-head" className="text-nith-primary-light font-semibold no-underline hover:underline">Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
