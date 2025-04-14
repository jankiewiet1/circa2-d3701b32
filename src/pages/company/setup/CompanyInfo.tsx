
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/contexts/CompanyContext";
import { SetupLayout } from "@/components/setup/SetupLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Building2, ArrowRight } from "lucide-react";

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

const countries = [
  { value: "nl", label: "Netherlands" },
  { value: "de", label: "Germany" },
  { value: "be", label: "Belgium" },
  { value: "fr", label: "France" },
  { value: "gb", label: "United Kingdom" },
  { value: "us", label: "United States" },
  { value: "other", label: "Other" },
];

const formSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  country: z.string().min(1, "Country is required"),
  kvkNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  iban: z.string().optional(),
  bankName: z.string().optional(),
  billingEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  billingAddress: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  contactName: z.string().optional(),
  contactTitle: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export default function CompanyInfo() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { company, updateCompany, createCompany } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: company?.name || "",
      industry: company?.industry || "",
      country: company?.country || "",
      kvkNumber: company?.kvk_number || "",
      vatNumber: company?.vat_number || "",
      iban: company?.iban || "",
      bankName: company?.bank_name || "",
      billingEmail: company?.billing_email || "",
      phoneNumber: company?.phone_number || "",
      billingAddress: company?.billing_address || "",
      postalCode: company?.postal_code || "",
      city: company?.city || "",
      contactName: company?.contact_name || "",
      contactTitle: company?.contact_title || "",
      contactEmail: company?.contact_email || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      if (company) {
        // Update existing company
        await updateCompany({
          name: data.name,
          industry: data.industry,
          country: data.country,
          kvk_number: data.kvkNumber,
          vat_number: data.vatNumber,
          iban: data.iban,
          bank_name: data.bankName,
          billing_email: data.billingEmail,
          phone_number: data.phoneNumber,
          billing_address: data.billingAddress,
          postal_code: data.postalCode,
          city: data.city,
          contact_name: data.contactName,
          contact_title: data.contactTitle,
          contact_email: data.contactEmail,
        });
        
        toast({
          title: "Company Updated",
          description: "Company information has been saved successfully",
        });
      } else {
        // Create new company
        const result = await createCompany(data.name, data.industry);
        
        if (result.company) {
          // Update with additional details
          await updateCompany({
            country: data.country,
            kvk_number: data.kvkNumber,
            vat_number: data.vatNumber,
            iban: data.iban,
            bank_name: data.bankName,
            billing_email: data.billingEmail,
            phone_number: data.phoneNumber,
            billing_address: data.billingAddress,
            postal_code: data.postalCode,
            city: data.city,
            contact_name: data.contactName,
            contact_title: data.contactTitle,
            contact_email: data.contactEmail,
          });
        }
      }
      
      // Navigate to the next step
      navigate("/company/setup/team");
    } catch (error) {
      console.error("Error saving company info:", error);
      toast({
        title: "Error",
        description: "Failed to save company information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SetupLayout 
      currentStep={1} 
      totalSteps={3} 
      title="Company Information" 
      description="Set up your company details for carbon accounting"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry.value} value={industry.value}>
                              {industry.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="kvkNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>KVK Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Chamber of Commerce number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vatNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VAT Number</FormLabel>
                      <FormControl>
                        <Input placeholder="VAT number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input placeholder="IBAN number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Bank name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="billingEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Email</FormLabel>
                      <FormControl>
                        <Input placeholder="billing@yourcompany.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+31 20 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="billingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="1234 AB" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Amsterdam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Primary Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title / Position</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sustainability Manager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@yourcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <CardFooter className="flex justify-end pt-6">
            <Button type="submit" className="bg-circa-green hover:bg-circa-green-dark" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Next Step"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </SetupLayout>
  );
}
