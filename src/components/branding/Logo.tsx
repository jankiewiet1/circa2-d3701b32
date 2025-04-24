
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "light" | "dark";
  withText?: boolean;
  className?: string;
}

export const Logo = ({ variant = "dark", withText = true, className = "" }: LogoProps) => {
  const textColor = variant === "light" ? "text-white" : "text-gray-900";
  
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="relative w-20 h-20 mr-1">
        <img 
          src="/lovable-uploads/da4f1469-f7ca-45c7-b5f1-6d8b73c27e30.png" 
          alt="Circa Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      {withText && (
        <span className={`text-xl font-bold ${textColor}`}>Circa</span>
      )}
    </Link>
  );
};
