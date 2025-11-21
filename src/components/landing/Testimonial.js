
const TestimonialsSection = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    
    const testimonials = [
      {
        name: "Pastor David Johnson",
        role: "Senior Pastor, Grace Community Church",
        content: "AI Bible has revolutionized how I prepare sermons and conduct Bible studies. The real-time verse suggestions during conversations are incredibly accurate and spiritually relevant. It's like having a biblical scholar AI assistant.",
        rating: 5,
        image: "/api/placeholder/80/80"
      },
      {
        name: "Sarah Mitchell",
        role: "Bible Study Leader & Seminary Student",
        content: "This tool has made our group discussions so much richer. It finds relevant verses I would never have thought of, and the contextual matching is phenomenal. Our study sessions have become more engaging and insightful.",
        rating: 5,
        image: "/api/placeholder/80/80"
      },
      {
        name: "Dr. Michael Chen",
        role: "Theology Professor, Westminster Seminary",
        content: "The AI's understanding of biblical context and theological themes is remarkable. It's become an invaluable research tool for my academic work and has enhanced my teaching in ways I never expected.",
        rating: 5,
        image: "/api/placeholder/80/80"
      }
    ];
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Faith Communities Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See how AI Bible is transforming spiritual conversations and Bible study experiences
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 relative">
              <Quote className="w-12 h-12 text-blue-200 absolute top-6 left-6" />
              
              <div className="flex items-center justify-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-2xl text-gray-700 text-center mb-8 italic leading-relaxed">
                "{testimonials[currentTestimonial].content}"
              </blockquote>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  