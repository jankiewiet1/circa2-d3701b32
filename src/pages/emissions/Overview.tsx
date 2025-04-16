
import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { EmissionsOverviewDashboard } from '@/components/emissions/EmissionsOverviewDashboard';

const Overview = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Emissions Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your organization's carbon footprint
          </p>
        </div>
        
        <EmissionsOverviewDashboard />
      </div>
    </MainLayout>
  );
};

export default Overview;
