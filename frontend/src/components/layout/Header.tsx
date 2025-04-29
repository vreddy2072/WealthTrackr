import React from 'react';
import { Bell, User, Search, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Dashboard' }) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your finances with ease</p>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 w-full bg-background/50 focus:bg-background"
          />
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Help">
            <HelpCircle size={18} className="text-muted-foreground" />
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full relative" aria-label="Notifications">
            <Bell size={18} className="text-muted-foreground" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">3</Badge>
          </Button>

          <Button variant="outline" size="sm" className="rounded-full ml-1 flex items-center gap-2" aria-label="User menu">
            <User size={16} />
            <span className="text-sm font-medium hidden sm:inline">Account</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
