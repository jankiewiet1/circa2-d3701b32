
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2 } from "lucide-react";

const industries = [
  { value: "agriculture", label: "Agriculture" },
  { value: "construction", label: "Construction" },
  { value: "education", label: "Education" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "finance", label: "Finance & Banking" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "technology", label: "Technology" },
  { value: "transportation", label: "Transportation & Logistics" },
  { value: "other", label: "Other" },
];

export default function CompanySetup() {
  const navigate = useNavigate();
  const { createCompany } = useCompany();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error, company } = await createCompany(name, industry);
      
      if (!error && company) {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Your Company</h1>
          <p className="text-gray-500 mt-2">Set up your organization to start tracking emissions</p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>
                Enter your company information to get started with carbon accounting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your company name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {industries.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Company Size</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-circa-green bg-circa-green/5 hover:bg-circa-green/10"
                  >
                    Small<br />(&lt;50 employees)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                  >
                    Medium<br />(50-250 employees)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                  >
                    Large<br />(&gt;250 employees)
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-circa-green hover:bg-circa-green-dark flex items-center"
                disabled={loading || !name || !industry}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Building2 className="mr-2 h-4 w-4" />
                )}
                Create Company
              </Button>
              <p className="text-sm text-gray-500 text-center">
                By creating a company, you will become its administrator and can invite team members
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
