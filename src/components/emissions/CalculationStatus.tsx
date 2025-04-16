
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CalculationStatusProps {
  logs: Array<{
    id: string;
    log_type: 'info' | 'warning' | 'error';
    log_message: string;
    created_at: string;
  }>;
  onRecalculate: () => void;
  isLoading: boolean;
}

export const CalculationStatus = ({ logs, onRecalculate, isLoading }: CalculationStatusProps) => {
  const getLogIcon = (type: 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'info':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calculation Status</CardTitle>
            <CardDescription>Latest emission calculation results</CardDescription>
          </div>
          <Button 
            onClick={onRecalculate}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Recalculate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <Alert key={log.id} variant={log.log_type === 'error' ? 'destructive' : 'default'}>
              <div className="flex items-start gap-2">
                {getLogIcon(log.log_type)}
                <AlertDescription>{log.log_message}</AlertDescription>
              </div>
            </Alert>
          ))}
          {logs.length === 0 && (
            <p className="text-sm text-gray-500">No calculation logs available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
