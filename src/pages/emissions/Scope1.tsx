
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Upload, Plus, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useCompany } from "@/contexts/CompanyContext";

// Mock data for the chart
const emissionData = [
  { month: 'Jan', value: 24.5 },
  { month: 'Feb', value: 22.1 },
  { month: 'Mar', value: 25.8 },
  { month: 'Apr', value: 28.3 },
  { month: 'May', value: 30.2 },
  { month: 'Jun', value: 32.5 },
  { month: 'Jul', value: 35.6 },
  { month: 'Aug', value: 34.1 },
  { month: 'Sep', value: 29.7 },
  { month: 'Oct', value: 27.5 },
  { month: 'Nov', value: 25.3 },
  { month: 'Dec', value: 26.8 },
];

export default function Scope1() {
  const { userRole } = useCompany();
  const canEdit = userRole === "admin" || userRole === "editor";
  
  return (
    <MainLayout>
      <div className="max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Flame className="mr-2 h-7 w-7 text-orange-500" />
              Scope 1 Emissions
            </h1>
            <p className="text-gray-500 mt-1">
              Direct emissions from owned or controlled sources
            </p>
          </div>
          
          {canEdit && (
            <div className="flex space-x-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
              <Button className="bg-circa-green hover:bg-circa-green-dark">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Scope 1 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">450</span>
                <span className="text-gray-500 mb-1">tCO2e</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Stationary Combustion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">325</span>
                <span className="text-gray-500 mb-1">tCO2e</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Mobile Combustion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">125</span>
                <span className="text-gray-500 mb-1">tCO2e</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Monthly Emissions</CardTitle>
            <CardDescription>Scope 1 emissions over the past 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emissionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis unit=" tCO2e" />
                  <Tooltip formatter={(value) => [`${value} tCO2e`, "Emissions"]} />
                  <Legend />
                  <Bar dataKey="value" name="Scope 1 Emissions" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Emission Sources</CardTitle>
                <CardDescription>Breakdown of scope 1 emission sources</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="flex items-center">
                <Info className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stationary">
              <TabsList>
                <TabsTrigger value="stationary">Stationary Combustion</TabsTrigger>
                <TabsTrigger value="mobile">Mobile Combustion</TabsTrigger>
                <TabsTrigger value="fugitive">Fugitive Emissions</TabsTrigger>
                <TabsTrigger value="process">Process Emissions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stationary" className="mt-6">
                <div className="space-y-4">
                  <p>
                    <strong>Stationary combustion</strong> refers to the burning of fuels in stationary equipment such as boilers, furnaces, and turbines to generate electricity, steam, heat, or power. Common fuels include:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Natural gas for heating</li>
                    <li>Coal for industrial processes</li>
                    <li>Fuel oil for backup generators</li>
                    <li>Propane for heating systems</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-4">
                    To add emissions from stationary combustion, collect data on fuel usage and use the appropriate emission factors. The emission factors vary by fuel type and region.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="mobile" className="mt-6">
                <div className="space-y-4">
                  <p>
                    <strong>Mobile combustion</strong> emissions come from transportation sources like vehicles and equipment owned or controlled by your organization. This includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Company cars and fleet vehicles</li>
                    <li>Aircraft owned by the company</li>
                    <li>Ships and boats owned by the company</li>
                    <li>Forklifts and other mobile equipment</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-4">
                    To calculate emissions, you'll need data on fuel consumption or distance traveled for each vehicle or equipment type.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="fugitive" className="mt-6">
                <p className="text-gray-500">Fugitive emissions data will be available in the full version.</p>
              </TabsContent>
              
              <TabsContent value="process" className="mt-6">
                <p className="text-gray-500">Process emissions data will be available in the full version.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
