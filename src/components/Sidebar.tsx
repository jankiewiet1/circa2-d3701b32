
import { Link } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  ChevronRight,
  LogOut
} from "lucide-react";

export const Sidebar = () => {
  const { company, userRole } = useCompany();
  const { signOut } = useAuth();
  
  return (
    <aside className="bg-circa-green-dark text-white min-h-screen w-[260px] flex flex-col">
      {/* Logo */}
      <div className="p-6 flex items-center">
        <Link to="/dashboard" className="text-2xl font-bold flex items-center">
          <div className="h-8 w-8 rounded-full bg-white mr-3 flex items-center justify-center">
            <span className="text-circa-green-dark font-bold">C</span>
          </div>
          Circa
        </Link>
      </div>
      
      {/* Navigation Sections */}
      <nav className="flex-1">
        <div className="px-4 py-2 text-sm font-medium text-white/60">
          Overview
        </div>
        
        <NavLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavLink to="/reports" icon={<FileText size={18} />} label="Reports" />
        
        <div className="px-4 py-2 text-sm font-medium text-white/60 mt-4">
          Emissions
        </div>
        
        <NavLink to="/emissions/scope1" icon={<Flame size={18} />} label="Scope 1" />
        <NavLink to="/emissions/scope2" icon={<Wind size={18} />} label="Scope 2" />
        <NavLink to="/emissions/scope3" icon={<Truck size={18} />} label="Scope 3" />
        
        <div className="px-4 py-2 text-sm font-medium text-white/60 mt-4">
          Management
        </div>
        
        <NavLink
          to={company ? "/company/manage" : "/company/setup"}
          icon={<Building2 size={18} />}
          label={company ? "Your Company" : "Company Setup"}
          rightElement={
            !company ? (
              <span className="bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full">
                Setup
              </span>
            ) : undefined
          }
        />
        
        <div className="px-4 py-2 text-sm font-medium text-white/60 mt-4">
          Account
        </div>
        
        <NavLink to="/profile" icon={<UserRound size={18} />} label="Profile" />
        <NavLink to="/settings" icon={<Settings size={18} />} label="Settings" />
      </nav>
      
      {/* Help & Logout */}
      <div className="mt-auto px-2 pb-4">
        <NavLink to="/help" icon={<HelpCircle size={18} />} label="Help & Support" />
        
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white mt-2" 
          onClick={() => signOut()}
        >
          <LogOut size={18} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  rightElement?: React.ReactNode;
}

const NavLink = ({ to, icon, label, rightElement }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white",
      )}
    >
      <div className="flex items-center">
        <span className="mr-3 text-white/70">{icon}</span>
        {label}
      </div>
      {rightElement || <ChevronRight size={14} className="text-white/40" />}
    </Link>
  );
};
