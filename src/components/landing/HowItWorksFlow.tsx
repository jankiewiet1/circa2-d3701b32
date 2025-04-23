
import { ArrowRight, Upload, BarChart3, FileText } from "lucide-react";

export const HowItWorksFlow = () => {
  const steps = [
    {
      icon: <Upload className="h-8 w-8 text-circa-green" />,
      title: "Upload Data",
      description: "Simple drag & drop for all your emission sources"
    },
    {
      icon: <svg className="h-8 w-8 text-circa-green" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>,
      title: "Auto-Match",
      description: "AI-powered emission factor matching"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-circa-green" />,
      title: "Instant Insights",
      description: "Visualize your carbon footprint immediately"
    },
    {
      icon: <FileText className="h-8 w-8 text-circa-green" />,
      title: "Generate Reports",
      description: "CDP, GRI, and custom formats in one click"
    }
  ];

  return (
    <div className="relative">
      <div className="absolute top-1/2 left-8 right-8 h-1 bg-circa-green-light transform -translate-y-1/2 hidden md:block"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col items-center">
            <div className="bg-white rounded-full p-4 shadow-md mb-4 relative z-10">
              {step.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600 text-center text-sm">{step.description}</p>
            
            {index < steps.length - 1 && (
              <ArrowRight className="absolute top-8 -right-4 h-6 w-6 text-circa-green-dark hidden md:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
