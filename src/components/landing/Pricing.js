
const PricingSection = () => {
    const plans = [
      {
        name: "Free",
        price: "$0",
        period: "/month",
        description: "Perfect for individual use and getting started",
        features: [
          "100 searches per month",
          "Basic verse matching",
          "5 Bible translations",
          "Email support",
          "Mobile app access"
        ],
        cta: "Get Started Free",
        popular: false,
        ctaStyle: "border-2 border-gray-300 text-gray-700 hover:border-gray-400"
      },
      {
        name: "Pro",
        price: "$9",
        period: "/month",
        description: "Best for pastors, teachers, and serious Bible students",
        features: [
          "Unlimited searches",
          "Advanced AI matching",
          "50+ Bible translations",
          "Voice synthesis",
          "Priority support",
          "Conversation history",
          "Custom verse collections",
          "API access"
        ],
        cta: "Start Pro Trial",
        popular: true,
        ctaStyle: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
      },
      {
        name: "Enterprise",
        price: "$29",
        period: "/month",
        description: "For churches, seminaries, and large organizations",
        features: [
          "Everything in Pro",
          "Team collaboration",
          "Custom integrations",
          "Analytics dashboard",
          "Dedicated support",
          "White-label options",
          "Bulk user management",
          "Custom AI training"
        ],
        cta: "Contact Sales",
        popular: false,
        ctaStyle: "border-2 border-gray-300 text-gray-700 hover:border-gray-400"
      }
    ];
  
    return (
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Spiritual Journey Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start your enhanced Bible study experience with AI Bible today. All plans include our core AI-powered verse discovery features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`rounded-2xl p-8 ${
                plan.popular 
                  ? 'border-2 border-blue-500 relative shadow-xl' 
                  : 'border border-gray-200 shadow-lg'
              } bg-white hover:shadow-xl transition-shadow`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 rounded-full font-semibold transition-all ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All plans include a 14-day free trial. No credit card required to start.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-2" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  