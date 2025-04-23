import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CreditCard,
  BarChart4,
  PiggyBank,
  Target,
  Receipt,
  Menu,
  X,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/accounts', label: 'Accounts', icon: <CreditCard size={20} /> },
    { path: '/transactions', label: 'Transactions', icon: <Receipt size={20} /> },
    { path: '/reports', label: 'Reports', icon: <BarChart4 size={20} /> },
    { path: '/budget', label: 'Budget', icon: <PiggyBank size={20} /> },
    { path: '/goals', label: 'Goals', icon: <Target size={20} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button - only visible on small screens */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          className="bg-background shadow-md"
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Sidebar - hidden on mobile unless toggled */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-card shadow-lg border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 ease-in-out",
          collapsed ? "w-[70px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-neutral-800 bg-primary/5">
          {!collapsed ? (
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground p-1 rounded">
                <DollarSign size={20} />
              </div>
              <span className="text-xl font-bold">WealthTrackr</span>
            </Link>
          ) : (
            <Link to="/" className="flex justify-center w-full">
              <div className="bg-primary text-primary-foreground p-1 rounded">
                <DollarSign size={20} />
              </div>
            </Link>
          )}

          <div className="flex items-center">
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <X size={20} />
            </Button>

            {/* Collapse button - hidden on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight
                size={20}
                className={cn(
                  "transition-transform",
                  collapsed ? "" : "rotate-180"
                )}
              />
            </Button>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground"
                  )}
                >
                  <span className={cn(
                    "flex items-center justify-center",
                    isActive(item.path) ? "text-primary-foreground" : "text-muted-foreground",
                    collapsed ? "w-full" : "mr-3"
                  )}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-muted/20">
          {!collapsed && (
            <div className="text-xs text-muted-foreground">
              WealthTrackr v1.0.0
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
