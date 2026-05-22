import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { DEPARTMENTS, BLOCK_LABELS, BLOCK_TYPES } from '../../constants/models';

export function FacultySignup() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="bg-white w-full shadow-sm border border-gray-100 rounded-md overflow-hidden max-w-[750px]">
          <div className="bg-nith-primary text-white py-4 px-5">
            <h2 className="text-lg font-bold mb-1">Faculty Registration</h2>
            <p className="text-sm text-white/70 mb-0">Register to lodge and track Estate Office complaints.</p>
          </div>
          
          <div className="p-6">
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                
                <div className="col-span-1">
                  <label className="block font-semibold text-gray-800 text-sm mb-1.5">Full Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary" placeholder="Dr. John Doe" required />
                </div>
                
                <div className="col-span-1">
                  <label className="block font-semibold text-gray-800 text-sm mb-1.5">Email Address</label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary" placeholder="john@nith.ac.in" required />
                </div>

                <div className="col-span-1">
                  <label className="block font-semibold text-gray-800 text-sm mb-1.5">Password</label>
                  <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary" placeholder="••••••••" required />
                </div>

                <div className="col-span-1">
                  <label className="block font-semibold text-gray-800 text-sm mb-1.5">Phone Number</label>
                  <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary" placeholder="10-digit number" pattern="[0-9]{10}" required />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block font-semibold text-gray-800 text-sm mb-1.5">Department</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary bg-white" required defaultValue="">
                    <option value="" disabled>Select your Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block font-semibold text-gray-800 text-sm mb-1.5">House Number</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary" placeholder="e.g. 104" required />
                  </div>

                  <div className="col-span-1">
                    <label className="block font-semibold text-gray-800 text-sm mb-1.5">Block</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary bg-white" required defaultValue="">
                      <option value="" disabled>Select Block</option>
                      {BLOCK_LABELS.map(block => (
                        <option key={block.value} value={block.value}>{block.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block font-semibold text-gray-800 text-sm mb-1.5">Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-nith-primary focus:ring-1 focus:ring-nith-primary bg-white" required defaultValue="">
                      <option value="" disabled>Select Type</option>
                      {BLOCK_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-gray-100">
                <button type="submit" className="bg-nith-accent hover:bg-orange-600 transition-colors text-white font-bold w-full py-2.5 rounded">
                  Register as Faculty
                </button>
              </div>
              
              <p className="text-center text-sm text-gray-500 mt-4 mb-0">
                Already registered? <Link to="/login/faculty" className="text-nith-primary-light font-semibold no-underline hover:underline">Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
