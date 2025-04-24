
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "light" | "dark";
  withText?: boolean;
}

export const Logo = ({ variant = "dark", withText = true }: LogoProps) => {
  const textColor = variant === "light" ? "text-white" : "text-gray-900";
  
  return (
    <Link to="/" className="flex items-center">
      <div className="relative w-10 h-10 mr-2">
        <img 
          src="/lovable-uploads/27e49794-eff8-4cc2-9877-370e0bcc541a.png" 
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
