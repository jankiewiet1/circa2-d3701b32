import Image from 'next/image';

export default function CircaInAction() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">See Circa in Action</h2>
        <p className="text-gray-600 text-center mb-16">
          Powerful features designed for carbon management excellence
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Dashboard Overview */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Dashboard Overview</h3>
              <p className="text-gray-600 text-sm mb-4">Complete visibility of your carbon footprint</p>
            </div>
            <div className="relative h-[300px] bg-white">
              <Image
                src="/images/dashboard-overview.png"
                alt="Dashboard Overview"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Emissions Analytics */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Emissions Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">Detailed breakdown of your emissions data</p>
            </div>
            <div className="relative h-[300px] bg-white">
              <Image
                src="/images/emissions-dashboard.png"
                alt="Emissions Analytics"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Report Generation</h3>
              <p className="text-gray-600 text-sm mb-4">Automated reporting for all frameworks</p>
            </div>
            <div className="relative h-[300px] bg-white">
              <Image
                src="/images/reports-view.png"
                alt="Report Generation"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button className="bg-circa-green text-white px-6 py-3 rounded-lg font-medium hover:bg-circa-green/90 transition-colors">
            See Your Impact Live
          </button>
        </div>
      </div>
    </section>
  );
} 