
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Scope1 from "@/pages/emissions/Scope1";
import Scope2 from "@/pages/emissions/Scope2";
import Scope3 from "@/pages/emissions/Scope3";
import { toast } from "sonner";
import { useRouteError } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Error boundary component for route errors
const RouteErrorBoundary = () => {
  const error = useRouteError() as Error;
  
  // Show notification if data loading errors occur
  React.useEffect(() => {
    toast.error(`Data loading error: ${error?.message || 'Unknown error'}`);
    console.error('Route error:', error);
  }, [error]);
  
  return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertDescription>
          Error loading data: {error?.message || 'Unknown error'}. Please try again later.
        </AlertDescription>
      </Alert>
    </div>
  );
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
      errorElement={<RouteErrorBoundary />}
    />
    <Route
      path="/emissions/scope2"
      element={
        <ProtectedRoute>
          <Scope2 />
        </ProtectedRoute>
      }
      errorElement={<RouteErrorBoundary />}
    />
    <Route
      path="/emissions/scope3"
      element={
        <ProtectedRoute>
          <Scope3 />
        </ProtectedRoute>
      }
      errorElement={<RouteErrorBoundary />}
    />
  </>
);
