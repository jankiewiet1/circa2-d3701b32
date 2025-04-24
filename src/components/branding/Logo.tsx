
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "light" | "dark";
  withText?: boolean;
}

export const Logo = ({ variant = "dark", withText = true }: LogoProps) => {
  const textColor = variant === "light" ? "text-white" : "text-gray-900";
  
  return (
    <Link to="/" className="flex items-center">
      <div className="relative w-14 h-14 mr-1.5">
        <img 
          src="/lovable-uploads/1bb6c9d9-c4c7-40b1-97c2-c1497199888a.png" 
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
