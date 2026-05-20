import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { DEPARTMENTS, BLOCK_LABELS, BLOCK_TYPES } from '../../constants/models';

export function FacultySignup() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-2xl bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
          <div className="bg-[#003366] text-white px-6 py-4">
            <h2 className="text-xl font-bold">Faculty Registration</h2>
            <p className="text-sm text-blue-200 mt-1">Register to lodge and track Estate Office complaints.</p>
          </div>
          
          <form className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00509e]" placeholder="Dr. John Doe" required />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00509e]" placeholder="john@nith.ac.in" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00509e]" placeholder="••••••••" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00509e]" placeholder="10-digit number" pattern="[0-9]{10}" required />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Department</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00509e]" required defaultValue="">
                  <option value="" disabled>Select your Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">House Number</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00509e]" placeholder="e.g. 104" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Block</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00509e]" required defaultValue="">
                  <option value="" disabled>Select Block</option>
                  {BLOCK_LABELS.map(block => (
                    <option key={block.value} value={block.value}>{block.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00509e]" required defaultValue="">
                  <option value="" disabled>Select Type</option>
                  {BLOCK_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100">
              <button type="submit" className="w-full bg-[#ff9900] hover:bg-orange-500 text-white font-bold py-3 px-4 rounded transition-colors">
                Register as Faculty
              </button>
            </div>
            
            <p className="text-center text-sm text-gray-600 mt-4">
              Already registered? <Link to="/login/faculty" className="text-[#00509e] font-semibold hover:underline">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
