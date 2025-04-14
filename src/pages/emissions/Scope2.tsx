
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wind, Upload, Plus, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useCompany } from "@/contexts/CompanyContext";

// Mock data for the chart
const emissionData = [
  { month: 'Jan', value: 65.2 },
  { month: 'Feb', value: 62.4 },
  { month: 'Mar', value: 60.1 },
  { month: 'Apr', value: 58.7 },
  { month: 'May', value: 63.5 },
  { month: 'Jun', value: 72.8 },
  { month: 'Jul', value: 75.9 },
  { month: 'Aug', value: 76.3 },
  { month: 'Sep', value: 68.2 },
  { month: 'Oct', value: 65.5 },
  { month: 'Nov', value: 66.8 },
  { month: 'Dec', value: 68.9 },
];

export default function Scope2() {
  const { userRole } = useCompany();
  const canEdit = userRole === "admin" || userRole === "editor";
  
  return (
    <MainLayout>
      <div className="max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Wind className="mr-2 h-7 w-7 text-blue-500" />
              Scope 2 Emissions
            </h1>
            <p className="text-gray-500 mt-1">
              Indirect emissions from the generation of purchased electricity, steam, heating and cooling
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
              <CardTitle className="text-sm font-medium text-gray-500">Total Scope 2 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">780</span>
                <span className="text-gray-500 mb-1">tCO2e</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Location-Based</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">780</span>
                <span className="text-gray-500 mb-1">tCO2e</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Market-Based</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">520</span>
                <span className="text-gray-500 mb-1">tCO2e</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Monthly Emissions</CardTitle>
            <CardDescription>Scope 2 emissions over the past 12 months</CardDescription>
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
                  <Bar dataKey="value" name="Scope 2 Emissions" fill="#3b82f6" />
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
                <CardDescription>Breakdown of scope 2 emission sources</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="flex items-center">
                <Info className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="electricity">
              <TabsList>
                <TabsTrigger value="electricity">Electricity</TabsTrigger>
                <TabsTrigger value="steam">Steam</TabsTrigger>
                <TabsTrigger value="heating">Heating</TabsTrigger>
                <TabsTrigger value="cooling">Cooling</TabsTrigger>
              </TabsList>
              
              <TabsContent value="electricity" className="mt-6">
                <div className="space-y-4">
                  <p>
                    <strong>Electricity consumption</strong> typically accounts for the majority of Scope 2 emissions for most organizations. These emissions come from:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Office buildings and facilities</li>
                    <li>Manufacturing operations</li>
                    <li>Data centers</li>
                    <li>Electric vehicle charging</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-4">
                    To calculate your electricity emissions, collect data on kilowatt-hours (kWh) consumed and apply the appropriate emission factors for your grid location or your specific energy contracts.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="steam" className="mt-6">
                <div className="space-y-4">
                  <p>
                    <strong>Purchased steam</strong> emissions result from using steam that is generated off-site by another entity and then purchased for use in your operations. This is common in:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Industrial facilities with significant heating needs</li>
                    <li>District heating systems</li>
                    <li>Larger campus environments</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-4">
                    Emissions from purchased steam are calculated based on the amount of steam consumed and the emission factor provided by your supplier.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="heating" className="mt-6">
                <p className="text-gray-500">Heating emissions data will be available in the full version.</p>
              </TabsContent>
              
              <TabsContent value="cooling" className="mt-6">
                <p className="text-gray-500">Cooling emissions data will be available in the full version.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
