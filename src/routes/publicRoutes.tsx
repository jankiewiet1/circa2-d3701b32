
import { Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Help from "@/pages/Help";

export const publicRoutes = (
  <>
    <Route path="/" element={<Index />} />
    <Route path="/auth/login" element={<Login />} />
    <Route path="/auth/register" element={<Register />} />
    <Route path="/help" element={<Help />} />
  </>
);
