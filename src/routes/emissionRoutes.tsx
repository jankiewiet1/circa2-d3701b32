
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Scope1 from "@/pages/emissions/Scope1";
import Scope2 from "@/pages/emissions/Scope2";
import Scope3 from "@/pages/emissions/Scope3";
import { toast } from "sonner";

// Show notification if data loading errors occur
const handleRouteError = (err: Error) => {
  toast.error(`Data loading error: ${err.message}`);
  console.error('Route error:', err);
};

export const emissionRoutes = (
  <>
    <Route
      path="/emissions/scope1"
      element={
        <ProtectedRoute>
          <Scope1 />
        </ProtectedRoute>
      }
      errorElement={handleRouteError}
    />
    <Route
      path="/emissions/scope2"
      element={
        <ProtectedRoute>
          <Scope2 />
        </ProtectedRoute>
      }
      errorElement={handleRouteError}
    />
    <Route
      path="/emissions/scope3"
      element={
        <ProtectedRoute>
          <Scope3 />
        </ProtectedRoute>
      }
      errorElement={handleRouteError}
    />
  </>
);
