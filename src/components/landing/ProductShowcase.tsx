
import { Card, CardContent } from "@/components/ui/card";

export const ProductShowcase = () => {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden border-gray-200 shadow-lg">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-circa-green-light to-blue-50 font-medium">
              Dashboard Overview
            </div>
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <div className="w-full px-4">
                <div className="w-full h-6 mb-2 rounded bg-circa-green/30"></div>
                <div className="flex gap-4">
                  <div className="w-1/3 h-16 rounded bg-circa-green/20"></div>
                  <div className="w-1/3 h-16 rounded bg-circa-green/20"></div>
                  <div className="w-1/3 h-16 rounded bg-circa-green/20"></div>
                </div>
                <div className="w-full h-12 mt-4 rounded bg-circa-green/15"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-gray-200 shadow-lg">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-circa-green-light to-blue-50 font-medium">
              Emission Analytics
            </div>
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <div className="w-full px-4">
                <div className="h-32 w-full rounded bg-white p-2">
                  <div className="flex h-full">
                    <div className="w-1/4 h-full flex flex-col justify-end space-y-1">
                      <div className="w-full bg-blue-400 h-1/3"></div>
                      <div className="w-full bg-blue-500 h-1/2"></div>
                      <div className="w-full bg-blue-600 h-2/3"></div>
                    </div>
                    <div className="w-1/4 h-full flex flex-col justify-end space-y-1">
                      <div className="w-full bg-green-400 h-1/4"></div>
                      <div className="w-full bg-green-500 h-2/5"></div>
                      <div className="w-full bg-green-600 h-3/5"></div>
                    </div>
                    <div className="w-1/4 h-full flex flex-col justify-end space-y-1">
                      <div className="w-full bg-orange-400 h-1/3"></div>
                      <div className="w-full bg-orange-500 h-1/2"></div>
                      <div className="w-full bg-orange-600 h-3/4"></div>
                    </div>
                    <div className="w-1/4 h-full flex flex-col justify-end space-y-1">
                      <div className="w-full bg-purple-400 h-1/5"></div>
                      <div className="w-full bg-purple-500 h-2/5"></div>
                      <div className="w-full bg-purple-600 h-3/5"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <div className="h-4 w-16 bg-circa-green/20 rounded"></div>
                  <div className="h-4 w-16 bg-circa-green/20 rounded"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-gray-200 shadow-lg">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-circa-green-light to-blue-50 font-medium">
              Report Generation
            </div>
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <div className="w-full px-4">
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-24 rounded bg-circa-green/20"></div>
                  <div className="h-5 w-10 rounded bg-circa-green/30"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-full rounded bg-white flex items-center px-2">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                    <div className="h-3 w-32 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-6 w-full rounded bg-white flex items-center px-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                    <div className="h-3 w-24 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-6 w-full rounded bg-white flex items-center px-2">
                    <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                    <div className="h-3 w-36 bg-gray-300 rounded"></div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <div className="h-8 w-24 rounded bg-circa-green/40"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
