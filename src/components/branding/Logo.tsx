
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
          src="/lovable-uploads/4caccdc9-a095-42ce-94b7-13cdaa61a251.png" 
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
