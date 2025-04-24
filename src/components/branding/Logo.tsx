
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "light" | "dark";
  withText?: boolean;
}

export const Logo = ({ variant = "dark", withText = true }: LogoProps) => {
  const textColor = variant === "light" ? "text-white" : "text-gray-900";
  
  return (
    <Link to="/" className="flex items-center">
      <div className="relative w-16 h-16 mr-2">
        <img 
          src="/lovable-uploads/0c7f9300-43d4-4e92-8ade-16cb067e8c1d.png" 
          alt="Circa Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      {withText && (
        <span className={`text-2xl font-bold ${textColor}`}>Circa</span>
      )}
    </Link>
  );
};
