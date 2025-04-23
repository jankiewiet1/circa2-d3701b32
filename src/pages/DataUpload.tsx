
import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type EmissionEntry = {
  date: string;
  year: number;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  scope: number;
  notes?: string;
};

const requiredFields = [
  "date",
  "category",
  "description",
  "quantity",
  "unit",
  "scope",
];

export default function DataUpload() {
  const { company } = useCompany();

  const [mode, setMode] = useState<"csv" | "manual">("csv");

  // CSV Upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRows, setCsvRows] = useState<EmissionEntry[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  // Manual Entry state
  const [manualEntry, setManualEntry] = useState<Partial<EmissionEntry>>({});
  const [manualEntryErrors, setManualEntryErrors] = useState<string[]>([]);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const parseCsv = useCallback((file: File) => {
    setValidationErrors([]);
    setCsvRows([]);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as Record<string, any>[];
        const parsedRows: EmissionEntry[] = [];
        const errors: string[] = [];

        rawData.forEach((row, idx) => {
          const missingFields = requiredFields.filter(
            (f) =>
              !(f in row) ||
              row[f] === null ||
              row[f] === undefined ||
              row[f].toString().trim() === ""
          );

          if (missingFields.length > 0) {
            errors.push(
              `Row ${idx + 2}: Missing required field(s): ${missingFields.join(
                ", "
              )}`
            );
            return;
          }

          // Validate individual fields
          const dateValue = new Date(row.date);
          if (isNaN(dateValue.getTime())) {
            errors.push(`Row ${idx + 2}: Invalid date format`);
            return;
          }

          const quantityNum = parseFloat(row.quantity);
          if (isNaN(quantityNum)) {
            errors.push(`Row ${idx + 2}: Quantity must be a number`);
            return;
          }

          const scopeNum = parseInt(row.scope, 10);
          if (![1, 2, 3].includes(scopeNum)) {
            errors.push(`Row ${idx + 2}: Scope must be 1, 2, or 3`);
            return;
          }

          parsedRows.push({
            date: dateValue.toISOString().split("T")[0],
            year: dateValue.getFullYear(),
            category: row.category.toString().trim(),
            description: row.description.toString().trim(),
            quantity: quantityNum,
            unit: row.unit.toString().trim(),
            scope: scopeNum,
            notes: row.notes ? row.notes.toString().trim() : undefined,
          });
        });

        setValidationErrors(errors);
        setCsvRows(parsedRows);
      },
      error: (error) => {
        setValidationErrors([`Error parsing CSV file: ${error.message}`]);
      },
    });
  }, []);

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCsvFile(file);
    if (file) {
      parseCsv(file);
    } else {
      setCsvRows([]);
      setValidationErrors([]);
    }
  };

  const uploadCsvData = async () => {
    if (!company) {
      toast.error("No company context available");
      return;
    }
    if (validationErrors.length > 0) {
      toast.error("Fix validation errors before uploading");
      return;
    }
    if (csvRows.length === 0) {
      toast.error("No valid rows to upload");
      return;
    }

    setIsUploadingCsv(true);
    try {
      const rowsToUpsert = csvRows.map((row) => ({
        ...row,
        company_id: company.id,
        emission_factor: 0,
      }));

      const { error } = await supabase
        .from("emission_entries")
        .upsert(rowsToUpsert, {
          onConflict: "company_id,date,category,unit,scope",
        });

      if (error) {
        toast.error(`Upload failed: ${error.message}`);
      } else {
        toast.success(`Uploaded ${rowsToUpsert.length} records successfully`);
        setCsvFile(null);
        setCsvRows([]);
      }
    } catch (error) {
      toast.error(
        `Unexpected error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const handleManualInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setManualEntry((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "scope"
          ? value === ""
            ? undefined
            : Number(value)
          : value,
    }));
  };

  const validateManualEntry = (): boolean => {
    const errors: string[] = [];
    requiredFields.forEach((field) => {
      if (
        manualEntry[field as keyof EmissionEntry] === undefined ||
        manualEntry[field as keyof EmissionEntry] === ""
      ) {
        errors.push(`Field ${field} is required`);
      }
    });

    if (manualEntry.date) {
      const d = new Date(manualEntry.date);
      if (isNaN(d.getTime())) {
        errors.push("Invalid date format");
      }
    } else {
      errors.push("Date is required");
    }

    if (
      manualEntry.quantity !== undefined &&
      (isNaN(Number(manualEntry.quantity)) || Number(manualEntry.quantity) < 0)
    ) {
      errors.push("Quantity must be a positive number");
    }

    if (
      manualEntry.scope !== undefined &&
      ![1, 2, 3].includes(manualEntry.scope)
    ) {
      errors.push("Scope must be 1, 2, or 3");
    }

    setManualEntryErrors(errors);
    return errors.length === 0;
  };

  const submitManualEntry = async () => {
    if (!company) {
      toast.error("No company context available");
      return;
    }
    if (!validateManualEntry()) {
      toast.error("Fix validation errors before submitting");
      return;
    }

    setIsSubmittingManual(true);
    try {
      const dateObj = new Date(manualEntry.date as string);
      const entryToUpsert = [
        {
          company_id: company.id,
          date: dateObj.toISOString().split("T")[0],
          year: dateObj.getFullYear(),
          category: (manualEntry.category || "").toString().trim(),
          description: (manualEntry.description || "").toString().trim(),
          quantity: Number(manualEntry.quantity),
          unit: (manualEntry.unit || "").toString().trim(),
          scope: Number(manualEntry.scope),
          notes: manualEntry.notes
            ? (manualEntry.notes || "").toString().trim()
            : null,
          emission_factor: 0,
        },
      ];

      const { error } = await supabase
        .from("emission_entries")
        .upsert(entryToUpsert, {
          onConflict: "company_id,date,category,unit,scope",
        });

      if (error) {
        toast.error(`Submit failed: ${error.message}`);
      } else {
        toast.success("Entry submitted successfully");
        setManualEntry({});
        setManualEntryErrors([]);
      }
    } catch (error) {
      toast.error(
        `Unexpected error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Emission Data Upload</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setMode("csv")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            mode === "csv"
              ? "bg-circa-green text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          aria-pressed={mode === "csv"}
          type="button"
        >
          Upload CSV
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            mode === "manual"
              ? "bg-circa-green text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          aria-pressed={mode === "manual"}
          type="button"
        >
          Add Manual Entry
        </button>
      </div>

      {mode === "csv" && (
        <section>
          <label
            htmlFor="csvFileInput"
            className="block mb-2 font-semibold text-gray-700"
          >
            Select CSV file:
          </label>
          <input
            type="file"
            id="csvFileInput"
            accept=".csv"
            onChange={handleCsvFileChange}
            className="mb-4 block w-full text-sm text-gray-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-circa-green file:text-white
              hover:file:bg-circa-green-dark
            "
          />

          {validationErrors.length > 0 && (
            <div className="mb-4 rounded border border-red-400 bg-red-50 p-3 text-sm text-red-700">
              <p>Validation Errors:</p>
              <ul className="ml-5 list-disc">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {csvRows.length > 0 && (
            <div className="mb-4 overflow-x-auto max-h-96 border rounded border-gray-300">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Scope
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {csvRows.slice(0, 20).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                        {row.date}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                        {row.category}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                        {row.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700 text-right">
                        {row.quantity}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                        {row.unit}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700 text-right">
                        {row.scope}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                        {row.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {csvRows.length > 20 && (
                <div className="p-2 text-sm text-gray-500">
                  Showing first 20 rows of {csvRows.length} total.
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <Button
              onClick={uploadCsvData}
              disabled={
                isUploadingCsv ||
                csvRows.length === 0 ||
                validationErrors.length > 0
              }
              className="bg-circa-green hover:bg-circa-green-dark"
            >
              {isUploadingCsv ? "Uploading..." : "Upload CSV Data"}
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <a
              href="/templates/emissions_template.csv"
              download
              className="text-circa-green underline hover:text-circa-green-dark"
            >
              Download emissions CSV template
            </a>
          </div>
        </section>
      )}

      {mode === "manual" && (
        <section className="space-y-4 max-w-lg">
          <div>
            <label
              htmlFor="date"
              className="block font-semibold text-gray-700 mb-1"
            >
              Date *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={manualEntry.date || ""}
              onChange={handleManualInputChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block font-semibold text-gray-700 mb-1"
            >
              Category *
            </label>
            <input
              id="category"
              name="category"
              type="text"
              value={manualEntry.category || ""}
              onChange={handleManualInputChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
              placeholder="e.g. Electricity"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block font-semibold text-gray-700 mb-1"
            >
              Description *
            </label>
            <input
              id="description"
              name="description"
              type="text"
              value={manualEntry.description || ""}
              onChange={handleManualInputChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
              placeholder="Brief description"
            />
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block font-semibold text-gray-700 mb-1"
            >
              Quantity *
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              step="any"
              min="0"
              value={manualEntry.quantity ?? ""}
              onChange={handleManualInputChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label
              htmlFor="unit"
              className="block font-semibold text-gray-700 mb-1"
            >
              Unit *
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              value={manualEntry.unit || ""}
              onChange={handleManualInputChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
              placeholder="e.g. kWh"
            />
          </div>

          <div>
            <label
              htmlFor="scope"
              className="block font-semibold text-gray-700 mb-1"
            >
              Scope (1, 2, or 3) *
            </label>
            <input
              id="scope"
              name="scope"
              type="number"
              min={1}
              max={3}
              value={manualEntry.scope ?? ""}
              onChange={handleManualInputChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              required
              placeholder="1, 2, or 3"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block font-semibold text-gray-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={manualEntry.notes || ""}
              onChange={handleManualInputChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Optional notes"
            />
          </div>

          {manualEntryErrors.length > 0 && (
            <div className="text-sm text-red-700">
              <ul className="list-disc ml-5">
                {manualEntryErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={submitManualEntry}
              disabled={isSubmittingManual}
              className="bg-circa-green hover:bg-circa-green-dark"
            >
              {isSubmittingManual ? "Submitting..." : "Submit Entry"}
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <a
              href="/templates/emissions_template.csv"
              download
              className="text-circa-green underline hover:text-circa-green-dark"
            >
              Download emissions CSV template
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

