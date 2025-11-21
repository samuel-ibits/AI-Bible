
const HeroSection = () => {
    const [currentDemo, setCurrentDemo] = useState(0);
    
    const demoConversations = [
      {
        input: "I'm feeling overwhelmed with all the challenges in my life right now...",
        verses: [
          { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him...", match: 95 },
          { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me.", match: 92 }
        ]
      },
      {
        input: "I need wisdom to make an important decision about my career...",
        verses: [
          { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding...", match: 97 },
          { ref: "James 1:5", text: "If any of you lacks wisdom, you should ask God...", match: 94 }
        ]
      }
    ];
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentDemo((prev) => (prev + 1) % demoConversations.length);
      }, 8000);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        </div>
  
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Real-Time AI Bible Discovery
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your AI-Powered
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Bible Companion
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Experience scripture like never before. Our advanced AI listens to your conversations 
                and instantly discovers relevant Bible verses, creating deeper spiritual connections in real-time.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/app" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center group">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Try AI Bible Free
                </Link>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 transition-all flex items-center justify-center group">
                  <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Free 14-day trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Cancel anytime
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">Live Conversation Analysis</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500">Recording</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[80px] flex items-center">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-gray-700 italic animate-pulse">
                      "{demoConversations[currentDemo].input}"
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {demoConversations[currentDemo].verses.map((verse, index) => (
                    <div key={index} className={`${
                      index === 0 ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-green-50 border-l-4 border-green-500'
                    } p-4 rounded transition-all duration-500`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold ${index === 0 ? 'text-blue-600' : 'text-green-600'}`}>
                          {verse.ref}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-gray-500">{verse.match}% match</div>
                          <div className="w-12 bg-gray-200 rounded-full h-1">
                            <div 
                              className={`${index === 0 ? 'bg-blue-500' : 'bg-green-500'} h-1 rounded-full transition-all duration-1000`}
                              style={{ width: `${verse.match}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {verse.text}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>Updated 2s ago</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {demoConversations.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentDemo ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  