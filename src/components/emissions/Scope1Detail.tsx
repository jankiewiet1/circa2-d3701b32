
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadIcon, UploadIcon } from 'lucide-react';
import { CalculationStatus } from './CalculationStatus';

interface Calculation {
  total_emissions: number;
  emission_factor_id: number;
}

interface EmissionEntry {
  id: string;
  category: string;
  date: string;
  description: string;
  quantity: number;
  unit: string;
  scope: number;
  emission_calculations: Calculation[];
}

interface Scope1DetailProps {
  entries: EmissionEntry[];
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
}

export function Scope1Detail({ entries, loading, error, refetch }: Scope1DetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Scope 1 Emissions</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open('/templates/scope1_template.csv', '_blank')}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button size="sm">
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload Data
          </Button>
        </div>
      </div>

      <CalculationStatus />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading emissions data...</div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p>No Scope 1 emission data available. Upload your first data set to get started.</p>
            <Button className="mt-4">Upload Data</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Scope 1 Emissions Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Quantity</th>
                    <th className="pb-3">Unit</th>
                    <th className="pb-3 text-right">Emissions (tCO₂e)</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b">
                      <td className="py-3">{formatDate(entry.date)}</td>
                      <td className="py-3">{entry.category}</td>
                      <td className="py-3">{entry.description}</td>
                      <td className="py-3">{entry.quantity}</td>
                      <td className="py-3">{entry.unit}</td>
                      <td className="py-3 text-right">
                        {entry.emission_calculations && entry.emission_calculations[0]
                          ? entry.emission_calculations[0].total_emissions.toFixed(2)
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
