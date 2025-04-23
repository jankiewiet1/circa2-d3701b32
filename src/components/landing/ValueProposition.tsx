
export const ValueProposition = () => {
  const stats = [
    {
      value: "80%",
      label: "Time Saved",
      description: "Compared to manual carbon accounting"
    },
    {
      value: "€50K+",
      label: "Annual Savings",
      description: "On compliance and reporting costs"
    },
    {
      value: "100%",
      label: "Audit Ready",
      description: "Complete data trails and documentation"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-4xl md:text-5xl font-bold text-circa-green-dark mb-2">
            {stat.value}
          </div>
          <div className="text-xl font-semibold mb-1">{stat.label}</div>
          <div className="text-gray-600">{stat.description}</div>
        </div>
      ))}
    </div>
  );
};
