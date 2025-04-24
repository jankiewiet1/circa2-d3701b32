import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/branding/Logo";
import { 
  LayoutDashboard, 
  BarChart2, 
  FileText, 
  Settings, 
  UserRound, 
  Building2, 
  Flame, 
  Wind, 
  Truck, 
  HelpCircle,
  LogOut,
  Upload
} from "lucide-react";

export const Sidebar = () => {
  const { company } = useCompany();
  const { signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <aside 
      className={cn(
        "bg-circa-green-dark text-white transition-all duration-300 ease-in-out flex flex-col",
        isExpanded ? "w-[200px]" : "w-[55px]",
        "h-screen group/sidebar hover:w-[200px]"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="p-3 flex items-center justify-center">
        <Link to="/dashboard">
          <Logo variant="light" withText={isExpanded} className="transition-all duration-300" />
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-1.5 py-3 space-y-0.5 overflow-y-auto">
        <NavLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" isExpanded={isExpanded} />
        <NavLink to="/reports" icon={<FileText size={18} />} label="Reports" isExpanded={isExpanded} />
        <NavLink to="/data-upload" icon={<Upload size={18} />} label="Data Upload" isExpanded={isExpanded} />
        
        <div className="pt-4 pb-1">
          <div className={cn(
            "px-3 text-xs font-medium text-white/60 transition-all duration-300",
            isExpanded ? "opacity-100" : "opacity-0 hidden"
          )}>
            Emissions
          </div>
        </div>
        
        <NavLink to="/emissions/scope1" icon={<Flame size={18} />} label="Scope 1" isExpanded={isExpanded} />
        <NavLink to="/emissions/scope2" icon={<Wind size={18} />} label="Scope 2" isExpanded={isExpanded} />
        <NavLink to="/emissions/scope3" icon={<Truck size={18} />} label="Scope 3" isExpanded={isExpanded} />
        
        <div className="pt-4 pb-1">
          <div className={cn(
            "px-3 text-xs font-medium text-white/60 transition-all duration-300",
            isExpanded ? "opacity-100" : "opacity-0 hidden"
          )}>
            Settings
          </div>
        </div>
        
        <NavLink
          to={company ? "/company/manage" : "/company/setup"}
          icon={<Building2 size={18} />}
          label="Your Company"
          isExpanded={isExpanded}
        />
        <NavLink to="/profile" icon={<UserRound size={18} />} label="Profile" isExpanded={isExpanded} />
        <NavLink to="/settings" icon={<Settings size={18} />} label="Settings" isExpanded={isExpanded} />
      </nav>
      
      {/* Footer */}
      <div className="p-1.5 border-t border-white/10">
        <NavLink to="/help" icon={<HelpCircle size={18} />} label="Help" isExpanded={isExpanded} />
        <button 
          className={cn(
            "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md",
            "transition-all duration-300 text-white/80 hover:bg-white/10 hover:text-white"
          )}
          onClick={() => signOut()}
        >
          <LogOut size={18} />
          <span className={cn(
            "ml-3 transition-all duration-300 whitespace-nowrap",
            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 absolute -translate-x-4 pointer-events-none"
          )}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
}

const NavLink = ({ to, icon, label, isExpanded }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-4 py-2.5 text-sm font-medium rounded-md",
        "transition-all duration-300 text-white/80 hover:bg-white/10 hover:text-white"
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={cn(
        "ml-3 transition-all duration-300 whitespace-nowrap",
        isExpanded ? "opacity-100 translate-x-0" : "opacity-0 absolute -translate-x-4 pointer-events-none"
      )}>
        {label}
      </span>
    </Link>
  );
};
