
const HowItWorksSection = () => {
    const steps = [
      {
        icon: <Headphones className="w-10 h-10 text-white" />,
        title: "Listen & Analyze",
        description: "AI Bible continuously listens to your conversations, prayers, or discussions using advanced speech recognition technology with real-time processing.",
        gradient: "from-blue-500 to-purple-500"
      },
      {
        icon: <Brain className="w-10 h-10 text-white" />,
        title: "Understand Context",
        description: "Our AI understands context, emotions, spiritual themes, and underlying meanings to identify the most relevant biblical passages for your situation.",
        gradient: "from-purple-500 to-pink-500"
      },
      {
        icon: <Book className="w-10 h-10 text-white" />,
        title: "Discover Scripture",
        description: "Receive perfectly matched Bible verses with context, commentary, cross-references, and related passages to deepen your spiritual understanding.",
        gradient: "from-pink-500 to-red-500"
      }
    ];
  
    return (
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How AI Bible Transforms Your Conversations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three intelligent steps to discover relevant scripture in real-time during your spiritual conversations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {step.icon}
                </div>
                <div className="text-3xl font-bold text-gray-400 mb-2">{index + 1}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };
  