import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';

export function NotFound() {
  return (
    <MainLayout>
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4 bg-white border border-[#E5E5E5] border-t-2 border-t-[#111111] rounded-lg p-6 shadow-sm text-center">
          <Compass className="w-10 h-10 text-[#111111] mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-[#666666] mb-1">Error 404</p>
          <h3 className="text-lg font-bold text-[#111111] mb-2">Page Not Found</h3>
          <p className="text-sm text-[#666666] mb-6">
            The page you're looking for doesn't exist or may have been moved. Get back!!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#222222] hover:bg-[#000000] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
