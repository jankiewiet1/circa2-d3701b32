
import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Upload,
  Check,
  X as XIcon,
  AlertTriangle,
} from "lucide-react";

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
  const [csvRows, setCsvRows] = useState<
    (EmissionEntry & { isNew?: boolean; isUpdate?: boolean })[]
  >([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);

  // Manual Entry state
  const [manualEntry, setManualEntry] = useState<Partial<EmissionEntry>>({});
  const [manualEntryErrors, setManualEntryErrors] = useState<string[]>([]);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const parseCsv = useCallback(
    (file: File) => {
      setValidationErrors([]);
      setCsvRows([]);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rawData = results.data as Record<string, any>[];
          const parsedRows: (EmissionEntry & {
            isNew?: boolean;
            isUpdate?: boolean;
          })[] = [];
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
            if (isNaN(quantityNum) || quantityNum < 0) {
              errors.push(`Row ${idx + 2}: Quantity must be a positive number`);
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
              isNew: undefined,
              isUpdate: undefined,
            });
          });

          // For simplicity, mark all rows as new
          parsedRows.forEach((row) => {
            row.isNew = true;
          });

          setValidationErrors(errors);
          setCsvRows(parsedRows);
        },
        error: (error) => {
          setValidationErrors([`Error parsing CSV file: ${error.message}`]);
        },
      });
    },
    []
  );

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
        company_id: company.id,
        emission_factor: 0,
        date: row.date,
        year: row.year,
        category: row.category,
        description: row.description,
        quantity: row.quantity,
        unit: row.unit,
        scope: row.scope,
        notes: row.notes ?? null,
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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Emission Data Upload</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setMode("csv")}
          className={`px-5 py-2 rounded-md font-semibold text-sm transition-colors ${
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
          className={`px-5 py-2 rounded-md font-semibold text-sm transition-colors ${
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
          <div
            {...{
              onDragOver: (e) => e.preventDefault(),
              onDrop: (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  parseCsv(e.dataTransfer.files[0]);
                  setCsvFile(e.dataTransfer.files[0]);
                }
              },
            }}
            className={`border-2 border-dashed rounded-lg p-12 mb-6 cursor-pointer text-center transition-colors ${
              csvFile
                ? "border-circa-green bg-circa-green-light/40"
                : "border-gray-300 hover:border-circa-green"
            }`}
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvFileChange}
              id="csv-file-upload"
            />
            <label htmlFor="csv-file-upload" className="cursor-pointer">
              <Upload className="mx-auto mb-4 text-gray-500" size={48} />
              <p className="text-gray-700 text-lg font-medium">
                {csvFile
                  ? csvFile.name
                  : "Drag and drop your CSV file here, or click to browse"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported format: .csv
              </p>
            </label>
          </div>

          {validationErrors.length > 0 && (
            <div className="mb-6 rounded border border-red-400 bg-red-50 p-4 text-sm text-red-700 flex items-start space-x-3">
              <AlertTriangle className="shrink-0 mt-1 h-6 w-6" />
              <div>
                <p className="mb-2 font-semibold">Validation Errors:</p>
                <ul className="ml-6 list-disc max-h-40 overflow-y-auto">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {csvRows.length > 0 && (
            <div className="mb-6 max-h-96 overflow-y-auto rounded border border-gray-300 shadow-sm">
              <table className="w-full text-sm table-fixed border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="border-b border-gray-200">
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-left">Unit</th>
                    <th className="p-3 text-right">Scope</th>
                    <th className="p-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {csvRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        idx % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                      }
                    >
                      <td className="p-3">
                        {row.isNew ? (
                          <Check
                            className="text-green-600"
                            aria-label="New"
                          />
                        ) : row.isUpdate ? (
                          <XIcon
                            className="text-yellow-600"
                            aria-label="Update"
                          />
                        ) : (
                          <></>
                        )}
                      </td>
                      <td className="p-3">{row.date}</td>
                      <td className="p-3">{row.category}</td>
                      <td className="p-3">{row.description}</td>
                      <td className="p-3 text-right">{row.quantity}</td>
                      <td className="p-3">{row.unit}</td>
                      <td className="p-3 text-right">{row.scope}</td>
                      <td className="p-3">{row.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-2 text-xs text-gray-500">
                Showing all {csvRows.length} rows
              </div>
            </div>
          )}

          <Button
            onClick={uploadCsvData}
            disabled={
              isUploadingCsv ||
              csvRows.length === 0 ||
              validationErrors.length > 0
            }
            className="w-full py-3 font-semibold bg-circa-green hover:bg-circa-green-dark disabled:opacity-60"
          >
            {isUploadingCsv ? "Uploading..." : "Upload CSV Data"}
          </Button>

          <div className="mt-6 text-sm text-gray-700">
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
        <section>
          <div className="max-w-3xl bg-white rounded-lg shadow-md p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="date"
                  className="block font-semibold text-gray-700 mb-2"
                >
                  Date *
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={manualEntry.date || ""}
                  onChange={handleManualInputChange}
                  className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-circa-green ${
                    manualEntryErrors.some((e) =>
                      e.toLowerCase().includes("date")
                    )
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  aria-invalid={manualEntryErrors.some((e) =>
                    e.toLowerCase().includes("date")
                  )}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block font-semibold text-gray-700 mb-2"
                >
                  Category *
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={manualEntry.category || ""}
                  onChange={handleManualInputChange}
                  placeholder="e.g. Electricity"
                  className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-circa-green ${
                    manualEntryErrors.some((e) =>
                      e.toLowerCase().includes("category")
                    )
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  aria-invalid={manualEntryErrors.some((e) =>
                    e.toLowerCase().includes("category")
                  )}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block font-semibold text-gray-700 mb-2"
              >
                Description *
              </label>
              <input
                id="description"
                name="description"
                type="text"
                value={manualEntry.description || ""}
                onChange={handleManualInputChange}
                placeholder="Brief description"
                className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-circa-green ${
                  manualEntryErrors.some((e) =>
                    e.toLowerCase().includes("description")
                  )
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                aria-invalid={manualEntryErrors.some((e) =>
                  e.toLowerCase().includes("description")
                )}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="quantity"
                  className="block font-semibold text-gray-700 mb-2"
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
                  className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-circa-green ${
                    manualEntryErrors.some((e) =>
                      e.toLowerCase().includes("quantity")
                    )
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  aria-invalid={manualEntryErrors.some((e) =>
                    e.toLowerCase().includes("quantity")
                  )}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="unit"
                  className="block font-semibold text-gray-700 mb-2"
                >
                  Unit *
                </label>
                <input
                  id="unit"
                  name="unit"
                  type="text"
                  value={manualEntry.unit || ""}
                  onChange={handleManualInputChange}
                  placeholder="e.g. kWh"
                  className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-circa-green ${
                    manualEntryErrors.some((e) =>
                      e.toLowerCase().includes("unit")
                    )
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  aria-invalid={manualEntryErrors.some((e) =>
                    e.toLowerCase().includes("unit")
                  )}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="scope"
                  className="block font-semibold text-gray-700 mb-2"
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
                  placeholder="1, 2, or 3"
                  className={`w-full rounded-md border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-circa-green ${
                    manualEntryErrors.some((e) =>
                      e.toLowerCase().includes("scope")
                    )
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  aria-invalid={manualEntryErrors.some((e) =>
                    e.toLowerCase().includes("scope")
                  )}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block font-semibold text-gray-700 mb-2"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={manualEntry.notes || ""}
                onChange={handleManualInputChange}
                rows={3}
                placeholder="Optional notes"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-circa-green"
              />
            </div>

            {manualEntryErrors.length > 0 && (
              <div className="rounded border border-red-400 bg-red-50 p-4 text-sm text-red-700">
                <p className="mb-2 font-semibold">Form Errors:</p>
                <ul className="ml-6 list-disc">
                  {manualEntryErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={submitManualEntry}
              disabled={isSubmittingManual}
              className="w-full py-3 font-semibold bg-circa-green hover:bg-circa-green-dark disabled:opacity-60"
            >
              {isSubmittingManual ? "Submitting..." : "Submit Entry"}
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-700 max-w-3xl">
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

