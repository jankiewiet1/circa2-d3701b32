import React, { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmissionsOverviewDashboard } from '@/components/emissions/EmissionsOverviewDashboard';
import { EmissionsByCategory } from '@/components/emissions/EmissionsByCategory';
import { Scope1Detail } from '@/components/emissions/Scope1Detail';
import { useScopeEntries } from '@/hooks/useScopeEntries';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Scope1 = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { entries, loading, error, refetch } = useScopeEntries(1);

  const renderContent = () => {
    if (loading) {
      return (
         <div className="space-y-6 mt-4">
           <Skeleton className="h-40 w-full rounded-lg" />
           <Skeleton className="h-80 w-full rounded-lg" />
         </div>
      );
    }
    if (error) {
       return (
         <Alert variant="destructive" className="my-6">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Error Loading Scope 1 Data</AlertTitle>
           <AlertDescription>
             {error || "An unexpected error occurred."}
             <Button variant="secondary" size="sm" onClick={refetch} className="ml-4">
               Try Again
             </Button>
           </AlertDescription>
         </Alert>
       );
    }

    return (
      <>
        <TabsContent value="overview">
          <EmissionsOverviewDashboard entries={entries} loading={loading} error={error} refetch={refetch} />
        </TabsContent>
        
        <TabsContent value="by-category">
          <EmissionsByCategory entries={entries} loading={loading} error={error} refetch={refetch} />
        </TabsContent>
        
        <TabsContent value="detail">
          <Scope1Detail />
        </TabsContent>
      </>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Scope 1 Emissions</h1>
          <p className="text-muted-foreground mt-1">
            Direct emissions from owned or controlled sources
          </p>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="detail">Detail</TabsTrigger>
          </TabsList>
          
          {renderContent()}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Scope1;
