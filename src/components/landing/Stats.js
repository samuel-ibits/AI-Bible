
const StatsSection = () => {
    const stats = [
      { number: "10M+", label: "Verses Searched", icon: <Search className="w-8 h-8" /> },
      { number: "50K+", label: "Active Users", icon: <Users className="w-8 h-8" /> },
      { number: "99.2%", label: "Accuracy Rate", icon: <Award className="w-8 h-8" /> },
      { number: "24/7", label: "Available", icon: <Clock className="w-8 h-8" /> }
    ];
  
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-blue-600 mb-4 flex justify-center group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  