
import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "light" | "dark";
  withText?: boolean;
}

export const Logo = ({ variant = "dark", withText = true }: LogoProps) => {
  const textColor = variant === "light" ? "text-white" : "text-gray-900";
  
  return (
    <Link to="/" className="flex items-center">
      <div className="relative">
        <div className="h-9 w-9 rounded-full bg-circa-green flex items-center justify-center overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-circa-green to-circa-green-dark rounded-full" />
          <span className="relative text-white font-bold text-xl">C</span>
          <Leaf className="absolute bottom-0 right-0 h-4 w-4 text-white/80 transform translate-x-0.5 translate-y-0.5" />
        </div>
      </div>
      {withText && (
        <span className={`text-xl font-bold ml-2 ${textColor}`}>Circa</span>
      )}
    </Link>
  );
};
