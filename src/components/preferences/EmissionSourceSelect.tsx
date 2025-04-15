
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

export const EMISSION_SOURCES = [
  "DEFRA",
  "EPA",
  "ADEME",
  "IPCC",
  "GHG Protocol Default",
  "Custom"
] as const;

export type EmissionSource = typeof EMISSION_SOURCES[number];

export const EmissionSourceSelect = () => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="preferred_emission_source"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Preferred Emission Source</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || "DEFRA"}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select emission source" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {EMISSION_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
