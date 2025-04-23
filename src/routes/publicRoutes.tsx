
import { Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Help from "@/pages/Help";
import { useEffect } from "react";

// Set document title and favicon
document.title = "Circa - Carbon Management Platform";

// Create a link element for the favicon
const setFavicon = () => {
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  
  link.type = 'image/svg+xml';
  link.rel = 'shortcut icon';
  link.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%230E5D40'/%3E%3Ctext x='50' y='65' font-size='60' text-anchor='middle' fill='white' font-family='Arial, sans-serif'%3EC%3C/text%3E%3Cpath d='M65 70 L80 85' stroke='white' stroke-width='6' stroke-linecap='round'/%3E%3Cpath d='M70 70 Q75 80 85 75' stroke='white' stroke-width='3' fill='none'/%3E%3C/svg%3E";
};

// Component for setting effect
const RouteEffects = () => {
  useEffect(() => {
    setFavicon();
  }, []);
  
  return null;
};

export const publicRoutes = (
  <>
    <Route path="/" element={<><RouteEffects /><Index /></>} />
    <Route path="/auth/login" element={<Login />} />
    <Route path="/auth/register" element={<Register />} />
    <Route path="/help" element={<Help />} />
  </>
);
