
import React, { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmissionsOverviewDashboard } from '@/components/emissions/EmissionsOverviewDashboard';
import { EmissionsByCategory } from '@/components/emissions/EmissionsByCategory';
import { Scope1Detail } from '@/components/emissions/Scope1Detail';

const Scope1 = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Scope 1 Emissions</h1>
          <p className="text-muted-foreground mt-1">
            Direct emissions from owned or controlled sources
          </p>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="detail">Detail</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <EmissionsOverviewDashboard />
          </TabsContent>
          
          <TabsContent value="by-category">
            <EmissionsByCategory />
          </TabsContent>
          
          <TabsContent value="detail">
            <Scope1Detail />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Scope1;
