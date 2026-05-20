import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';

export function WardenLogin() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-md bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
          <div className="bg-[#003366] text-white px-6 py-4">
            <h2 className="text-xl font-bold">Warden Login</h2>
            <p className="text-sm text-blue-200 mt-1">Access your hostel complaint dashboard.</p>
          </div>
          
          <form className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00509e]" placeholder="warden@nith.ac.in" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00509e]" placeholder="••••••••" required />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button type="submit" className="w-full bg-[#ff9900] hover:bg-orange-500 text-white font-bold py-3 px-4 rounded transition-colors">
                Login
              </button>
            </div>
            
            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account? <Link to="/signup/warden" className="text-[#00509e] font-semibold hover:underline">Register here</Link>
            </p>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
