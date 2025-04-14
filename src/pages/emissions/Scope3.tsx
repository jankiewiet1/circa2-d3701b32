
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Upload, Plus, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useCompany } from "@/contexts/CompanyContext";

// Mock data for the chart
const emissionData = [
  { category: 'Purchased Goods', value: 420 },
  { category: 'Business Travel', value: 180 },
  { category: 'Employee Commuting', value: 145 },
  { category: 'Waste', value: 75 },
  { category: 'Transportation', value: 230 },
  { category: 'Use of Products', value: 150 },
];

export default function Scope3() {
  const { userRole } = useCompany();
  const canEdit = userRole === "admin" || userRole === "editor";
  
  return (
    <MainLayout>
      <div className="max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Truck className="mr-2 h-7 w-7 text-purple-500" />
              Scope 3 Emissions
            </h1>
            <p className="text-gray-500 mt-1">
              Indirect emissions from the value chain not included in scope 2
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
              <CardTitle className="text-sm font-medium text-gray-500">Total Scope 3 Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">1,200</span>
                <span className="text-gray-500 mb-1">tCO2e</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Upstream</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">820</span>
                <span className="text-gray-500 mb-1">tCO2e</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Downstream</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end space-x-1">
                <span className="text-3xl font-bold">380</span>
                <span className="text-gray-500 mb-1">tCO2e</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Emissions by Category</CardTitle>
            <CardDescription>Scope 3 emissions by GHG Protocol categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emissionData} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" unit=" tCO2e" />
                  <YAxis type="category" dataKey="category" width={100} />
                  <Tooltip formatter={(value) => [`${value} tCO2e`, "Emissions"]} />
                  <Legend />
                  <Bar dataKey="value" name="Scope 3 Emissions" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Scope 3 Categories</CardTitle>
                <CardDescription>Breakdown of scope 3 emission categories</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="flex items-center">
                <Info className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upstream">
              <TabsList>
                <TabsTrigger value="upstream">Upstream Categories</TabsTrigger>
                <TabsTrigger value="downstream">Downstream Categories</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upstream" className="mt-6">
                <div className="space-y-4">
                  <p>
                    <strong>Upstream Scope 3 emissions</strong> include all indirect emissions that occur in the value chain of the company, prior to the company's operation:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Category 1:</strong> Purchased goods and services (420 tCO2e)</li>
                    <li><strong>Category 2:</strong> Capital goods</li>
                    <li><strong>Category 3:</strong> Fuel and energy-related activities</li>
                    <li><strong>Category 4:</strong> Upstream transportation and distribution (230 tCO2e)</li>
                    <li><strong>Category 5:</strong> Waste generated in operations (75 tCO2e)</li>
                    <li><strong>Category 6:</strong> Business travel (180 tCO2e)</li>
                    <li><strong>Category 7:</strong> Employee commuting (145 tCO2e)</li>
                    <li><strong>Category 8:</strong> Upstream leased assets</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-4">
                    To calculate upstream emissions, collect data from suppliers, travel systems, waste management records, and employee surveys. Apply appropriate emission factors for each category.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="downstream" className="mt-6">
                <div className="space-y-4">
                  <p>
                    <strong>Downstream Scope 3 emissions</strong> include all indirect emissions that occur in the value chain of the company, after the company's operation:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Category 9:</strong> Downstream transportation and distribution</li>
                    <li><strong>Category 10:</strong> Processing of sold products</li>
                    <li><strong>Category 11:</strong> Use of sold products (150 tCO2e)</li>
                    <li><strong>Category 12:</strong> End-of-life treatment of sold products</li>
                    <li><strong>Category 13:</strong> Downstream leased assets</li>
                    <li><strong>Category 14:</strong> Franchises</li>
                    <li><strong>Category 15:</strong> Investments</li>
                  </ul>
                  <p className="text-sm text-gray-500 mt-4">
                    Calculating downstream emissions often requires collaboration with customers, detailed product data, and lifecycle assessment models. These categories can be challenging but are often significant.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
