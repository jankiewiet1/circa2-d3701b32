
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { fetchCompanyPreferences, updateCompanyPreferences } from "@/services/companyPreferencesService";

const formSchema = z.object({
  preferred_currency: z.string().min(1, "Currency is required"),
  fiscal_year_start_month: z.string().min(1, "Fiscal year start month is required"),
  reporting_frequency: z.string().min(1, "Reporting frequency is required"),
  emission_unit: z.string().min(1, "Emission unit is required"),
  default_view: z.string().min(1, "Default view is required"),
});

const currencies = [
  { value: "EUR", label: "Euro (€)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "GBP", label: "British Pound (£)" },
];

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const reportingFrequencies = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const emissionUnits = [
  { value: "kg CO₂", label: "Kilograms CO₂" },
  { value: "tons CO₂", label: "Tons CO₂" },
];

const defaultViews = [
  { value: "absolute", label: "Absolute" },
  { value: "per_employee", label: "Per Employee" },
];

export default function CompanyPreferences() {
  const { company } = useCompany();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferred_currency: "EUR",
      fiscal_year_start_month: "1",
      reporting_frequency: "monthly",
      emission_unit: "kg CO₂",
      default_view: "absolute",
    },
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (!company?.id) return;
      
      const { data } = await fetchCompanyPreferences(company.id);
      if (data) {
        form.reset(data);
      }
      setIsLoading(false);
    };

    loadPreferences();
  }, [company?.id, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!company?.id) return;
    
    setIsSaving(true);
    await updateCompanyPreferences(company.id, values);
    setIsSaving(false);
  };

  if (!company) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Company Preferences</h1>
          <p className="text-muted-foreground">
            Configure your reporting and display preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Preferences</CardTitle>
            <CardDescription>
              Configure how your carbon accounting data should be calculated and displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="preferred_currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
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
                    name="fiscal_year_start_month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fiscal Year Start Month</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month.value} value={month.value}>
                                {month.label}
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
                    name="reporting_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reporting Frequency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {reportingFrequencies.map((frequency) => (
                              <SelectItem key={frequency.value} value={frequency.value}>
                                {frequency.label}
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
                    name="emission_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emission Unit</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {emissionUnits.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
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
                    name="default_view"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default View</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select view" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {defaultViews.map((view) => (
                              <SelectItem key={view.value} value={view.value}>
                                {view.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-circa-green hover:bg-circa-green-dark"
                    disabled={isLoading || isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Preferences"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
