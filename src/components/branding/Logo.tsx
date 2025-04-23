
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
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
          <circle cx="18" cy="18" r="18" className="fill-circa-green" />
          <path
            d="M14 12C14 12 18 12 22 12C26 12 28 14 28 18C28 22 26 24 22 24H14"
            className="stroke-white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M18 15L15 18L18 21"
            className="stroke-white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {withText && (
        <span className={`text-xl font-bold ml-2 ${textColor}`}>Circa</span>
      )}
    </Link>
  );
};
