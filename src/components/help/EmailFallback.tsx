
import { useState } from "react";
import { Mail, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const EmailFallback = () => {
  const [copied, setCopied] = useState(false);
  const email = "info@epccommodities.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Still need help?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          If you can't find what you're looking for or need personal assistance, you
          can always email us directly at:
        </p>
        <div className="p-3 bg-gray-50 rounded-md flex items-center justify-between">
          <span className="font-medium">{email}</span>
          <Button 
            variant="outline" 
            size="sm" 
            className={copied ? "text-green-600" : ""}
            onClick={handleCopyEmail}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" /> Copy Email
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Our support team typically responds within 24 hours during business days.
        </p>
      </CardContent>
    </Card>
  );
};
