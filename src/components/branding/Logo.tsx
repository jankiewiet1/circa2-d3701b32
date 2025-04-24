
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
      <div className="relative w-[60px] h-[60px] mr-1">
        <img 
          src="/lovable-uploads/477052de-880a-4de2-9ce9-ce4bbb451c9d.png" 
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
