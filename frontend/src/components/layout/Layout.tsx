import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const location = useLocation();

  // Determine page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/accounts') return 'Accounts';
    if (path === '/transactions') return 'Transactions';
    if (path === '/reports') return 'Reports';
    if (path === '/budget') return 'Budget';
    if (path === '/goals') return 'Goals';
    return 'WealthTrackr';
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        "md:ml-[240px]", // Default sidebar width
        "p-4 md:p-8",
        className
      )}>
        <div className="max-w-7xl mx-auto">
          <Header title={getPageTitle()} />
          <div className="bg-background rounded-lg">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
