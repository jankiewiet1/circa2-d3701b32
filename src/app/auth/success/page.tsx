import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Welcome to Circa! 🌱</CardTitle>
          <CardDescription>
            Thank you for joining us in making carbon accounting simple and effective.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Next Steps:</h3>
            
            <div className="space-y-2">
              <h4 className="font-medium">1. Confirm Your Email</h4>
              <p className="text-sm text-muted-foreground">
                We've sent you a confirmation email. Please click the link to verify your account.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">2. Book a Demo</h4>
              <p className="text-sm text-muted-foreground">
                Let us show you how Circa can help your organization track and reduce its carbon footprint.
              </p>
              <Button asChild className="mt-2">
                <a
                  href="https://calendly.com/your-calendly-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Schedule Your Demo
                </a>
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">3. Explore the Dashboard</h4>
              <p className="text-sm text-muted-foreground">
                Once your email is confirmed, you can start exploring your carbon accounting dashboard.
              </p>
              <Button variant="outline" asChild className="mt-2">
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Need help? Contact us at <a href="mailto:support@circa.com" className="text-primary hover:underline">support@circa.com</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 