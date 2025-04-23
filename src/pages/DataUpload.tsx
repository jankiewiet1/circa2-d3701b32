import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/upload/FileUploadZone";
import { ScopeDetectionPreview } from "@/components/upload/ScopeDetectionPreview";
import { AlertCircle, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import Papa from 'papaparse';
import { useCompany } from "@/contexts/CompanyContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function DataUpload() {
  const { company } = useCompany();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    rows: string[][];
    detectedScope?: '1' | '2' | '3';
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const detectScope = (headers: string[]) => {
    const headerSet = new Set(headers.map(h => h.toLowerCase()));
    
    if (headerSet.has('fuel_type') || headerSet.has('source')) {
      return '1';
    }
    if (headerSet.has('energy_type')) {
      return '2';
    }
    if (headerSet.has('supplier_name') || headerSet.has('commodity_type')) {
      return '3';
    }
    return undefined;
  };

  const handleFileSelect = async (file: File) => {
    setFile(file);
    setIsProcessing(true);
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data.filter(row => Object.keys(row).length > 0).map(row => {
          return headers.map(header => (row as any)[header] || '');
        });
        
        const detectedScope = detectScope(headers);
        
        setPreviewData({
          headers,
          rows,
          detectedScope,
        });
        setIsProcessing(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast.error('Failed to parse the CSV file');
        setIsProcessing(false);
      }
    });
  };

  const mapHeadersToColumns = (headers: string[], scope: '1' | '2' | '3') => {
    const columnMappings: Record<string, Record<string, string>> = {
      '1': {
        'fuel_type': 'fuel_type',
        'source': 'source',
        'amount': 'amount',
        'unit': 'unit',
        'emissions_co2e': 'emissions_co2e',
        'date': 'date',
        'emission_factor': 'emission_factor_source',
        'emission_unit': 'ratio_indicators',
      },
      '2': {
        'energy_type': 'energy_type',
        'amount': 'amount',
        'unit': 'unit', 
        'emissions_co2e': 'emissions_co2e',
        'date': 'date',
        'supplier': 'supplier',
        'location': 'location',
        'emission_factor': 'emission_factor_source',
        'emission_unit': 'ratio_indicators',
      },
      '3': {
        'supplier_name': 'supplier_name',
        'supplier_type': 'supplier_type',
        'commodity_type': 'commodity_type',
        'annual_spend': 'annual_spend',
        'emissions_co2e': 'emissions_co2e',
        'date': 'date',
        'supplier_address': 'supplier_address',
        'procurement_contact': 'procurement_contact',
        'emission_factor': 'emission_factor',
        'emission_unit': 'ratio_indicators',
      }
    };
    
    return headers.reduce((acc, header) => {
      const lowerHeader = header.toLowerCase();
      const mapping = columnMappings[scope];
      
      if (mapping && mapping[lowerHeader]) {
        acc[header] = mapping[lowerHeader];
      } else {
        acc[header] = lowerHeader.replace(/\s+/g, '_');
      }
      
      return acc;
    }, {} as Record<string, string>);
  };

  const handleUpload = async () => {
    if (!file || !previewData?.detectedScope || !company?.id || !user?.id) {
      toast.error('Missing required information for upload');
      return;
    }

    setIsProcessing(true);
    try {
      const { data: session, error: sessionError } = await supabase
        .from('upload_sessions')
        .insert({
          company_id: company.id,
          uploaded_by: user.id,
          filename: file.name,
          detected_scope: previewData.detectedScope,
          row_count: previewData.rows.length,
          status: 'processing'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const headerMapping = mapHeadersToColumns(previewData.headers, previewData.detectedScope);

      const rows = previewData.rows.map((row) => {
        const rowData: Record<string, any> = {
          company_id: company.id,
          uploaded_by: user.id,
        };
        
        previewData.headers.forEach((header, index) => {
          const columnName = headerMapping[header];
          if (columnName) {
            if (columnName === 'date' && row[index]) {
              try {
                const date = new Date(row[index]);
                if (!isNaN(date.getTime())) {
                  rowData[columnName] = date.toISOString().split('T')[0];
                  rowData['year'] = date.getFullYear();
                } else {
                  rowData[columnName] = row[index];
                }
              } catch (e) {
                rowData[columnName] = row[index];
              }
            } 
            else if (['amount', 'emissions_co2e', 'annual_spend', 'emission_factor'].includes(columnName) && row[index]) {
              const num = parseFloat(row[index]);
              rowData[columnName] = isNaN(num) ? null : num;
            } 
            else if (row[index] !== undefined && row[index] !== '') {
              rowData[columnName] = row[index];
            }
          }
        });

        return rowData;
      });

      const validRows = rows.filter(row => {
        if (previewData.detectedScope === '1') {
          return row.fuel_type || row.source;
        } else if (previewData.detectedScope === '2') {
          return row.energy_type;
        } else {
          return row.supplier_name || row.commodity_type;
        }
      });

      if (validRows.length === 0) {
        throw new Error('No valid data rows found in the file');
      }

      const tableNames = {
        '1': 'scope1_emissions',
        '2': 'scope2_emissions',
        '3': 'scope3_emissions'
      } as const;
      
      const tableName = tableNames[previewData.detectedScope];
      
      let successCount = 0;
      let failCount = 0;
      
      await Promise.allSettled(
        validRows.map(async (rowData) => {
          try {
            const { error } = await supabase
              .from(tableName)
              .insert([rowData]);
            
            if (error) {
              console.error('Row insert error:', error, rowData);
              failCount++;
              return false;
            } else {
              successCount++;
              return true;
            }
          } catch (err) {
            console.error('Row processing error:', err);
            failCount++;
            return false;
          }
        })
      );

      await supabase
        .from('upload_sessions')
        .update({ 
          status: failCount === 0 ? 'completed' : 'partial',
          completed_at: new Date().toISOString(),
          row_count: successCount
        })
        .eq('id', session.id);

      if (failCount === 0) {
        toast.success(`Data uploaded successfully - ${successCount} records added`);
      } else {
        toast.warning(`Upload completed with issues - ${successCount} records added, ${failCount} records failed`);
      }
      
      setFile(null);
      setPreviewData(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTemplateDownload = (scope: '1' | '2' | '3') => {
    const templates = {
      '1': '/src/data/scope1Template.csv',
      '2': '/src/data/scope2Template.csv',
      '3': '/src/data/scope3Template.csv'
    };

    const link = document.createElement('a');
    link.href = templates[scope];
    link.download = `scope${scope}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Scope ${scope} template downloaded successfully`);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Data Upload</h1>
        
        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-circa-green-light flex items-center justify-center">
                <Upload className="h-5 w-5 text-circa-green-dark" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Upload Emissions Data</h2>
                <p className="text-sm text-gray-500">Upload your emissions data using our template</p>
              </div>
            </div>
            
            <FileUploadZone onFileSelect={handleFileSelect} />
            
            {!file && (
              <div className="mt-4">
                <div className="flex items-start gap-2 text-sm bg-circa-green-light/20 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-circa-green-dark shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      Make sure your data follows our template format. Download the appropriate template:
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTemplateDownload('1')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Scope 1 Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTemplateDownload('2')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Scope 2 Template
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTemplateDownload('3')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Scope 3 Template
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {previewData && (
              <div className="mt-6 space-y-4">
                <ScopeDetectionPreview {...previewData} />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleUpload}
                    disabled={isProcessing}
                    className="bg-circa-green hover:bg-circa-green-dark"
                  >
                    {isProcessing ? 'Uploading...' : 'Upload Data'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
