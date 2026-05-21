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
    <div className="d-flex flex-column min-vh-100 bg-light">
      <TopBar />
      <Header />
      <Navbar />
      
      <div className="flex-grow-1 d-flex flex-column">
        {children}
      </div>

      <Footer />
    </div>
  );
}
