
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Treemap, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useEmissionsCalculations } from '@/hooks/useEmissionsCalculations';
import { useCompany } from '@/contexts/CompanyContext';
import { ChartContainer } from '@/components/ui/chart';

interface TreemapData {
  name: string;
  size: number;
  color: string;
  percentOfTotal: number;
}

export const EmissionsByCategory = () => {
  const { company } = useCompany();
  const { calculatedEmissions, isLoading } = useEmissionsCalculations(company?.id || '');
  const [treemapData, setTreemapData] = useState<TreemapData[]>([]);
  const [totalEmissions, setTotalEmissions] = useState(0);

  // Color scale for the treemap
  const getColor = (value: number, max: number) => {
    // From lighter to darker green
    const colors = ['#D6F3E7', '#AAE3CA', '#6ED0AA', '#3AB688', '#0E5D40'];
    const index = Math.min(Math.floor((value / max) * (colors.length - 1)), colors.length - 1);
    return colors[index];
  };

  // Process emissions data for the treemap
  useEffect(() => {
    if (calculatedEmissions.length > 0) {
      // Group by source
      const sourceEmissions: Record<string, number> = {};
      calculatedEmissions.forEach(emission => {
        if (emission.source) {
          sourceEmissions[emission.source] = (sourceEmissions[emission.source] || 0) + (emission.emissions_co2e || 0);
        }
      });
      
      // Calculate total for percentages
      const total = Object.values(sourceEmissions).reduce((sum, val) => sum + val, 0);
      setTotalEmissions(total);
      
      // Find max for color scale
      const maxEmission = Math.max(...Object.values(sourceEmissions));
      
      // Format data for treemap
      const data: TreemapData[] = Object.entries(sourceEmissions).map(([source, value]) => ({
        name: source,
        size: value,
        color: getColor(value, maxEmission),
        percentOfTotal: (value / total) * 100
      }));
      
      setTreemapData(data);
    }
  }, [calculatedEmissions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border shadow-lg rounded-md">
          <p className="font-bold">{data.name}</p>
          <p className="text-gray-700">{data.size.toFixed(2)} tonnes CO₂e</p>
          <p className="text-gray-700">{data.percentOfTotal.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Emissions by Category</CardTitle>
        <CardDescription>
          Breakdown by emission source (sized by tonnes CO₂e)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading emissions data...</p>
            </div>
          ) : treemapData.length > 0 ? (
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  stroke="#fff"
                  fill="#0E5D40"
                  content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
                    return (
                      <g>
                        {root.children?.map((node: any, i: number) => {
                          const nodeWidth = node.x1 - node.x0;
                          const nodeHeight = node.y1 - node.y0;
                          
                          // Only show text if there's enough space
                          const showText = nodeWidth > 50 && nodeHeight > 30;
                          
                          return (
                            <g key={`node-${i}`}>
                              <rect
                                x={node.x0}
                                y={node.y0}
                                width={nodeWidth}
                                height={nodeHeight}
                                fill={node.payload.color}
                                stroke="#fff"
                              />
                              {showText && (
                                <>
                                  <text
                                    x={node.x0 + nodeWidth / 2}
                                    y={node.y0 + nodeHeight / 2}
                                    textAnchor="middle"
                                    fill="#fff"
                                    fontSize={12}
                                    fontWeight="bold"
                                  >
                                    {node.name}
                                  </text>
                                  <text
                                    x={node.x0 + nodeWidth / 2}
                                    y={node.y0 + nodeHeight / 2 + 14}
                                    textAnchor="middle"
                                    fill="#fff"
                                    fontSize={10}
                                  >
                                    {node.value.toFixed(1)} tCO₂e
                                  </text>
                                </>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    );
                  }}
                >
                  <RechartsTooltip content={<CustomTooltip />} />
                </Treemap>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>No emissions data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
