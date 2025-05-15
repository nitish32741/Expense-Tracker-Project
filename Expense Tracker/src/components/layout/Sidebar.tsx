
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Sidebar as ShadcnSidebar, SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { Home, FileText, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  
  if (!currentUser) return null;
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <ShadcnSidebar>
      <SidebarHeader className="flex flex-col items-center p-4">
        <Avatar className="w-16 h-16 mb-2">
          {currentUser.profileImage ? (
            <AvatarImage src={currentUser.profileImage} alt={currentUser.name} />
          ) : (
            <AvatarFallback className="bg-expense-accent text-white text-lg">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="text-white font-medium truncate max-w-full">
          {currentUser.name}
        </div>
      </SidebarHeader>
      <SidebarContent className="flex flex-col py-8 flex-grow">
        <nav className="space-y-1 px-2">
          <NavItem 
            to="/dashboard" 
            icon={<Home size={20} />} 
            label="Dashboard" 
            isActive={location.pathname === '/dashboard'} 
          />
          <NavItem 
            to="/expenses" 
            icon={<FileText size={20} />} 
            label="Expenses" 
            isActive={location.pathname === '/expenses'} 
          />
          <NavItem 
            to="/profile" 
            icon={<User size={20} />} 
            label="Profile" 
            isActive={location.pathname === '/profile'} 
          />
        </nav>
        <div className="mt-auto px-2">
          <button 
            onClick={logout} 
            className="flex items-center w-full px-4 py-3 text-sm text-white hover:bg-expense-accent rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </SidebarContent>
    </ShadcnSidebar>
  );
}

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
};

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
        isActive
          ? "bg-expense-accent text-white"
          : "text-white hover:bg-expense-accent/30"
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};
