
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useCompany } from "@/contexts/CompanyContext";
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
import { Card, CardContent } from "@/components/ui/card";
import { fetchCompanyPreferences, updateCompanyPreferences } from "@/services/companyPreferencesService";

const currencies = [
  { value: "EUR", label: "Euro (€)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CNY", label: "Chinese Yuan (¥)" },
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

const languages = [
  { value: "en", label: "English" },
  { value: "nl", label: "Dutch" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
];

const timezones = [
  { value: "Europe/Amsterdam", label: "Amsterdam (UTC+1/+2)" },
  { value: "Europe/London", label: "London (UTC+0/+1)" },
  { value: "America/New_York", label: "New York (UTC-5/-4)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10/+11)" },
];

const formSchema = z.object({
  preferredCurrency: z.string().min(1, "Currency is required"),
  fiscalYearStartMonth: z.string().min(1, "Fiscal year start month is required"),
  reportingFrequency: z.string().min(1, "Reporting frequency is required"),
  language: z.string().min(1, "Language is required"),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CompanyPreferencesTab = () => {
  const { company, fetchCompanyData } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);
  const companyId = company?.id;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredCurrency: "EUR",
      fiscalYearStartMonth: "1",
      reportingFrequency: "monthly",
      language: "en",
      timezone: "Europe/Amsterdam",
    },
  });

  const loadCompanyPreferences = async () => {
    if (companyId) {
      const { data, error } = await fetchCompanyPreferences(companyId);
      if (data) {
        setPreferences(data);
        form.reset({
          preferredCurrency: data.preferred_currency || "EUR",
          fiscalYearStartMonth: data.fiscal_year_start_month || "1",
          reportingFrequency: data.reporting_frequency || "monthly",
          language: data.language || "en",
          timezone: data.timezone || "Europe/Amsterdam",
        });
      } else if (error) {
        console.error("Error loading company preferences:", error);
        toast.error("Failed to load company preferences");
      }
    }
  };

  useEffect(() => {
    loadCompanyPreferences();
  }, [companyId]);

  const onSubmit = async (data: FormValues) => {
    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await updateCompanyPreferences(companyId, {
        preferred_currency: data.preferredCurrency,
        fiscal_year_start_month: data.fiscalYearStartMonth,
        reporting_frequency: data.reportingFrequency,
        language: data.language,
        timezone: data.timezone,
      });
      
      if (error) {
        throw error;
      }
      
      // Refresh company data to get updated preferences
      await fetchCompanyData();
      
      toast.success("Company preferences updated successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save company preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="preferredCurrency"
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
                name="fiscalYearStartMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fiscal Year Start</FormLabel>
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
            </div>
            
            <FormField
              control={form.control}
              name="reportingFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reporting Frequency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reporting frequency" />
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
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.value} value={language.value}>
                            {language.label}
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
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Zone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            {timezone.label}
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

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-circa-green hover:bg-circa-green-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyPreferencesTab;
