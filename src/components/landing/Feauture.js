
const FeaturesSection = () => {
    const features = [
      {
        icon: <Mic className="w-8 h-8" />,
        title: "Real-Time Speech Recognition",
        description: "Advanced AI listens to your conversations and understands context with 99.2% accuracy using cutting-edge speech processing technology.",
        color: "blue"
      },
      {
        icon: <Brain className="w-8 h-8" />,
        title: "Intelligent Verse Matching",
        description: "Our AI analyzes conversation themes, emotions, and spiritual context to find the most relevant biblical passages instantly.",
        color: "purple"
      },
      {
        icon: <Search className="w-8 h-8" />,
        title: "Contextual Search Engine",
        description: "Goes beyond keyword matching to understand meaning, spiritual context, and emotional undertones in your conversations.",
        color: "green"
      },
      {
        icon: <Globe className="w-8 h-8" />,
        title: "Multi-Language Support",
        description: "Access verses from 50+ Bible translations in over 30 languages with real-time translation capabilities.",
        color: "pink"
      }
    ];
  
    const colorClasses = {
      blue: "text-blue-600 bg-blue-50 border-blue-200",
      purple: "text-purple-600 bg-purple-50 border-purple-200",
      green: "text-green-600 bg-green-50 border-green-200",
      pink: "text-pink-600 bg-pink-50 border-pink-200"
    };
  
    return (
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Deeper Scripture Study
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI Bible combines cutting-edge technology with timeless wisdom to enhance your spiritual journey 
              through intelligent conversation analysis and real-time verse discovery.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow group">
                <div className={`${colorClasses[feature.color as keyof typeof colorClasses]} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border-2`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  