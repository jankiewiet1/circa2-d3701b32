
import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, Filter, Search } from "lucide-react";

const reports = [
  {
    id: 1,
    name: "Annual GHG Inventory",
    description: "Complete greenhouse gas inventory for the entire organization",
    date: "2023-12-15",
    type: "Annual",
    format: "PDF",
  },
  {
    id: 2,
    name: "Scope 1 & 2 Quarterly Report",
    description: "Quarterly breakdown of direct and indirect emissions",
    date: "2023-10-05",
    type: "Quarterly",
    format: "Excel",
  },
  {
    id: 3,
    name: "Carbon Disclosure Project Submission",
    description: "Official submission for CDP reporting",
    date: "2023-08-22",
    type: "Annual",
    format: "PDF",
  },
  {
    id: 4,
    name: "Supply Chain Emissions Analysis",
    description: "Detailed analysis of scope 3 emissions from suppliers",
    date: "2023-07-10",
    type: "Custom",
    format: "PDF",
  },
  {
    id: 5,
    name: "Science-Based Targets Progress",
    description: "Progress tracking against established science-based targets",
    date: "2023-06-01",
    type: "Bi-annual",
    format: "Excel",
  },
];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Filter reports based on search term and type filter
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === "" || 
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || report.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <MainLayout>
      <div className="max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="mr-2 h-7 w-7" />
            Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Create and access carbon emissions reports
          </p>
        </div>
        
        <Tabs defaultValue="all">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">All Reports</TabsTrigger>
              <TabsTrigger value="templates">Report Templates</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            </TabsList>
            
            <Button className="bg-circa-green hover:bg-circa-green-dark">
              <FileText className="mr-2 h-4 w-4" />
              Generate New Report
            </Button>
          </div>
          
          <TabsContent value="all">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>All Reports</CardTitle>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="Search reports..."
                        className="pl-9 w-full sm:w-[250px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          {filterType === "all" ? "All Types" : filterType}
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Annual">Annual</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="Bi-annual">Bi-annual</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reports found matching your criteria</p>
                    </div>
                  )}
                  
                  {filteredReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(report.date).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          {report.type}
                          <span className="mx-2">•</span>
                          {report.format}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
                <CardDescription>
                  Use these templates to generate standardized reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Report templates will be available in the full version.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>
                  Set up automated report generation and distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Scheduled reports will be available in the full version.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
