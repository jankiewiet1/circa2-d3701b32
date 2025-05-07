import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Pie } from 'react-chartjs-2';
import emissionFactors from '@/data/emissionFactors.json';
import { Chart, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
Chart.register(ArcElement, ChartTooltip, Legend);

const SOCIAL_COST_PER_KG = 0.7;

const steps = [
  'Electricity',
  'Heating',
  'Business Transport',
  'Flights',
  'Summary',
];

type InputState = Record<string, { amount: string, unit: string, factor: number }>;

function getDefaultInputs(): InputState {
  const inputs: InputState = {};
  emissionFactors.forEach(cat => {
    cat.options.forEach(opt => {
      inputs[opt.label] = { amount: '', unit: opt.unit, factor: opt.factor };
    });
  });
  return inputs;
}

export default function CO2Calculator() {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<InputState>(getDefaultInputs());
  const [email, setEmail] = useState('');
  const [fte, setFte] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Calculate per-category and total emissions
  const categoryResults = emissionFactors.map(cat => {
    let total = 0;
    cat.options.forEach(opt => {
      const val = parseFloat(inputs[opt.label]?.amount) || 0;
      total += val * (opt.factor || 0);
    });
    return { category: cat.category, total };
  });
  const totalCO2 = categoryResults.reduce((sum, c) => sum + c.total, 0);
  const totalCost = totalCO2 * SOCIAL_COST_PER_KG;

  // Check if any value is entered
  const anyValueEntered = Object.values(inputs).some(i => i.amount && parseFloat(i.amount) > 0);

  // Pie chart data
  const pieData = {
    labels: categoryResults.map(c => c.category),
    datasets: [
      {
        data: categoryResults.map(c => c.total),
        backgroundColor: [
          '#4ade80', '#fbbf24', '#60a5fa', '#f472b6', '#a78bfa', '#f87171', '#34d399', '#facc15', '#38bdf8', '#f472b6',
        ],
      },
    ],
  };

  // Step navigation
  const goNext = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep(s => Math.max(s - 1, 0));

  // Handle input change
  const handleInput = (label: string, value: string) => {
    setInputs(prev => ({ ...prev, [label]: { ...prev[label], amount: value } }));
  };

  // Handle email submit (simulate API/send)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    await fetch('https://vfdbyvnjhimmnbyhxyun.functions.supabase.co/send-summary-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        summary: { inputs, totalCO2, totalCost, fte }
      }),
    });
  };

  // Step content
  const renderStep = () => {
    if (step < emissionFactors.length) {
      const cat = emissionFactors[step];
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">{cat.category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cat.options.map(opt => (
              <div key={opt.label} className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2">
                    <label className="block font-medium mb-1">{opt.label}</label>
                    <Input
                      type="number"
                      min={0}
                      value={inputs[opt.label]?.amount}
                      onChange={e => handleInput(opt.label, e.target.value)}
                      className="max-w-[120px] inline-block mr-2"
                      placeholder="0"
                    />
                    <span className="ml-2 text-gray-500">{opt.unit}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-sm">Factor: <b>{opt.factor}</b> kg CO₂e/{opt.unit}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-blue-500 cursor-help">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Source: {opt.source}
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm">CO₂ emissions: <b>{((parseFloat(inputs[opt.label]?.amount) || 0) * (opt.factor || 0)).toFixed(2)}</b> kg</span>
                  <span className="text-sm">Social cost: <b>€ {(((parseFloat(inputs[opt.label]?.amount) || 0) * (opt.factor || 0)) * SOCIAL_COST_PER_KG).toFixed(2)}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // Summary step
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Summary</h2>
        {!anyValueEntered ? (
          <div className="text-gray-500 text-center my-8">Please enter a value to calculate your CO₂ footprint.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="w-full max-w-[400px] mx-auto">
              <Pie data={pieData} />
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">Emissions Overview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Total emissions:</span>
                    <span className="font-medium">{totalCO2.toFixed(2)} kg CO₂e</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total social cost:</span>
                    <span className="font-medium">€ {totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Emissions per FTE:</span>
                    <span className="font-medium">{(totalCO2 / (fte || 1)).toFixed(2)} kg CO₂e</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-medium mb-1">Number of employees (FTE)</label>
                <Input 
                  type="number" 
                  min={1} 
                  value={fte} 
                  onChange={e => setFte(Number(e.target.value))} 
                  className="max-w-[120px]" 
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-2">
                  <label className="block font-medium mb-1">Email for summary</label>
                  <Input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="max-w-md" 
                    placeholder="your@email.com" 
                  />
                </div>
                <Button type="submit" className="mt-4 w-full md:w-auto">Send summary by email</Button>
              </form>
              {submitted && (
                <div className="text-green-600 font-medium mt-2">
                  Thank you! You will receive a summary by email soon.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="w-full max-w-3xl mx-auto my-8 p-0">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {steps.map((label, i) => (
            <div key={label} className={`h-2 w-8 rounded-full ${i <= step ? 'bg-circa-green' : 'bg-gray-200'}`}></div>
          ))}
        </div>
        <span className="text-sm text-gray-500">Step {step + 1} of {steps.length}</span>
      </div>
      {renderStep()}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={goBack} disabled={step === 0}>Back</Button>
        <Button onClick={goNext} disabled={step === steps.length - 1}>Next</Button>
      </div>
    </section>
  );
} 