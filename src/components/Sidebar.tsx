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
  LogOut,
  Upload
} from "lucide-react";
import { Leaf } from "lucide-react";

export const Sidebar = () => {
  const { company } = useCompany();
  const { signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <aside 
      className={cn(
        "bg-circa-green-dark text-white transition-all duration-300 ease-in-out",
        isExpanded ? "w-[221px]" : "w-[60px]",
        "h-full flex flex-col group/sidebar hover:w-[221px]"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="p-4 flex items-center">
        <Link to="/dashboard" className="text-xl font-bold flex items-center">
          <div className="h-8 w-8 rounded-full bg-white mr-2 flex items-center justify-center relative overflow-hidden group">
            <Leaf className="h-5 w-5 text-circa-green-dark transition-transform group-hover:scale-110" />
          </div>
          <span className={cn(
            "text-lg transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"
          )}>
            Circa
          </span>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        <NavLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavLink to="/reports" icon={<FileText size={18} />} label="Reports" />
        <NavLink to="/data-upload" icon={<Upload size={18} />} label="Data Upload" />
        
        <div className="pt-2 pb-1">
          <div className="px-3 text-xs font-medium text-white/60">Emissions</div>
        </div>
        
        <NavLink to="/emissions/scope1" icon={<Flame size={18} />} label="Scope 1" />
        <NavLink to="/emissions/scope2" icon={<Wind size={18} />} label="Scope 2" />
        <NavLink to="/emissions/scope3" icon={<Truck size={18} />} label="Scope 3" />
        
        <div className="pt-2 pb-1">
          <div className="px-3 text-xs font-medium text-white/60">Settings</div>
        </div>
        
        <NavLink
          to={company ? "/company/manage" : "/company/setup"}
          icon={<Building2 size={18} />}
          label="Your Company"
        />
        <NavLink to="/profile" icon={<UserRound size={18} />} label="Profile" />
        <NavLink to="/settings" icon={<Settings size={18} />} label="Settings" />
      </nav>
      
      {/* Footer */}
      <div className="p-2">
        <NavLink to="/help" icon={<HelpCircle size={18} />} label="Help" />
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
