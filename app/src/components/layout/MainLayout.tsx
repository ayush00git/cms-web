import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Header } from './Header';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopBar />
      <Header />
      <Navbar />
      
      <div className="flex-grow flex flex-col">
        {children}
      </div>

      <Footer />
    </div>
  );
}
