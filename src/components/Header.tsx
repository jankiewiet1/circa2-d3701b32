
import { Link } from "react-router-dom";
import { Bell, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const { user } = useAuth();
  
  const getInitials = () => {
    if (!user?.profile) return "U";
    return `${user.profile.first_name[0]}${user.profile.last_name[0]}`;
  };
  
  return (
    <header className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-9 bg-gray-50 border-gray-200 focus-visible:bg-white"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/help">
            <HelpCircle size={20} />
            <span className="sr-only">Help</span>
          </Link>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Bell size={20} />
          <span className="sr-only">Notifications</span>
        </Button>
        
        <Link to="/profile">
          <Avatar>
            <AvatarFallback className="bg-circa-green text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};
