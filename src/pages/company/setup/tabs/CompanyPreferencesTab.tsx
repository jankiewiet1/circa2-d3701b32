
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, Check, Loader2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  preferred_currency: z.string().min(1, "Currency is required"),
  fiscal_year_start_month: z.string().min(1, "Fiscal year start month is required"),
  reporting_frequency: z.string().min(1, "Reporting frequency is required"),
  language: z.string().min(1, "Language is required"),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

export default function CompanyPreferencesTab() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { company, updateCompany } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferred_currency: company?.preferred_currency || "EUR",
      fiscal_year_start_month: company?.fiscal_year_start_month || "1",
      reporting_frequency: company?.reporting_frequency || "monthly",
      language: company?.language || "en",
      timezone: company?.timezone || "Europe/Amsterdam",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!company) {
      toast({
        title: "Error",
        description: "You need to create a company first",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await updateCompany({
        ...data,
        setup_completed: true,
      });
      
      if (error) throw error;
      
      toast({
        title: "Setup Complete",
        description: "Your company preferences have been saved successfully",
      });
      
      // Navigate to dashboard after completing the setup
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem saving your company preferences",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Company Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Set your reporting and display preferences
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h4 className="text-md font-medium mb-2">Reporting Preferences</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                name="reporting_frequency"
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
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-2">Display Preferences</h4>
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
          </div>
          
          <div className="flex justify-between border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.querySelector('[value="team"]')?.dispatchEvent(
                new MouseEvent('click', { bubbles: true })
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Step
            </Button>
            
            <div className="space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.handleSubmit(onSubmit)();
                }}
                disabled={isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Progress
              </Button>
              
              <Button
                type="submit"
                className="bg-circa-green hover:bg-circa-green-dark"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Complete Setup
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
