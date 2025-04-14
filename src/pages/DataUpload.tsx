
import { Card } from "@/components/ui/card";
import { MainLayout } from "@/components/MainLayout";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

export default function DataUpload() {
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
            
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Drag and drop your file here, or click to browse</p>
                <p className="text-xs text-gray-500">Supported formats: .xlsx, .xls, .csv</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-start gap-2 text-sm bg-circa-green-light/20 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 text-circa-green-dark shrink-0 mt-0.5" />
              <p className="text-gray-600">
                Make sure your data follows our template format. 
                <a href="#" className="text-circa-green-dark hover:underline ml-1">
                  Download template
                </a>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
