
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanySetup() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Automatically redirect to the first step of the setup flow
    navigate("/company/setup/info");
  }, [navigate]);
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-12 w-60 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-md" />
      </div>
    </MainLayout>
  );
}
