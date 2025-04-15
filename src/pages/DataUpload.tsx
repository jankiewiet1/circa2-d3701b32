
import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/upload/FileUploadZone";
import { ScopeDetectionPreview } from "@/components/upload/ScopeDetectionPreview";
import { AlertCircle, Download } from "lucide-react";
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
    if (headerSet.has('energy_type') || headerSet.has('kwh')) {
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
      complete: (results) => {
        const headers = results.data[0] as string[];
        const rows = results.data.slice(1) as string[][];
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

  const handleUpload = async () => {
    if (!file || !previewData?.detectedScope || !company?.id || !user?.id) {
      toast.error('Missing required information for upload');
      return;
    }

    setIsProcessing(true);
    try {
      // Create upload session
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

      // Process the file data according to the detected scope
      // This is a simplified version - you might want to add more validation and mapping
      const rows = previewData.rows.map(row => {
        const rowData: any = {
          company_id: company.id,
          uploaded_by: user.id,
        };
        
        previewData.headers.forEach((header, index) => {
          rowData[header.toLowerCase().replace(/\s+/g, '_')] = row[index];
        });

        return rowData;
      });

      const tableName = `scope${previewData.detectedScope}_emissions`;
      const { error: uploadError } = await supabase
        .from(tableName)
        .insert(rows);

      if (uploadError) throw uploadError;

      // Update session status
      await supabase
        .from('upload_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', session.id);

      toast.success('Data uploaded successfully');
      setFile(null);
      setPreviewData(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload data');
    } finally {
      setIsProcessing(false);
    }
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
              <div className="mt-4 flex items-start gap-2 text-sm bg-circa-green-light/20 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 text-circa-green-dark shrink-0 mt-0.5" />
                <p className="text-gray-600">
                  Make sure your data follows our template format.
                  <Button variant="link" className="text-circa-green-dark p-0 h-auto ml-1">
                    <Download className="h-4 w-4 mr-1" />
                    Download template
                  </Button>
                </p>
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
                    Upload Data
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
