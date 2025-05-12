
import React from 'react';
import { EmissionEntryWithCalculation } from '@/hooks/useScopeEntries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

interface Scope1DetailProps {
  entries?: EmissionEntryWithCalculation[];
  loading?: boolean;
  error?: string | null;
  refetch?: () => void;
}

export const Scope1Detail = ({ entries = [], loading = false, error = null, refetch }: Scope1DetailProps) => {
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scope 1 Emission Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Emissions (tCO₂e)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length > 0 ? (
              entries.map(entry => {
                const calculation = entry.emission_calculations?.[0];
                return (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date ? format(new Date(entry.date), 'MMM dd, yyyy') : '-'}</TableCell>
                    <TableCell>{entry.category}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{entry.quantity}</TableCell>
                    <TableCell>{entry.unit}</TableCell>
                    <TableCell>
                      {calculation?.total_emissions 
                        ? (calculation.total_emissions / 1000).toFixed(3) 
                        : '-'}
                    </TableCell>
                    <TableCell>{entry.match_status || 'unmatched'}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No entries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
