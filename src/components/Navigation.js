// Components
const Navigation = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className= {`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-transparent'
            }`
}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
        <div className="flex justify-between items-center h-16" >
            <Link href="/" className = "flex items-center space-x-2" >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center" >
                    <Book className="w-6 h-6 text-white" />
                        </div>
                        < span className = "text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" >
                            AI Bible
                                </span>
                                </Link>

                                < div className = "hidden md:flex items-center space-x-8" >
                                    <Link href="#features" className = "text-gray-600 hover:text-gray-900 transition-colors" > Features </Link>
                                        < Link href = "#how-it-works" className = "text-gray-600 hover:text-gray-900 transition-colors" > How It Works </Link>
                                            < Link href = "#testimonials" className = "text-gray-600 hover:text-gray-900 transition-colors" > Testimonials </Link>
                                                < Link href = "#pricing" className = "text-gray-600 hover:text-gray-900 transition-colors" > Pricing </Link>
                                                    < Link href = "/app" className = "bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all" >
                                                        Try Now
                                                            </Link>
                                                            </div>

                                                            < button
className = "md:hidden"
onClick = {() => setIsMenuOpen(!isMenuOpen)}
            >
    { isMenuOpen?<X /> : <Menu />}
</button>
    </div>
    </div>

{/* Mobile Menu */ }
{
    isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100" >
            <div className="px-4 py-2 space-y-2" >
                <Link href="#features" className = "block py-2 text-gray-600" onClick = {() => setIsMenuOpen(false)
}> Features </Link>
    < Link href = "#how-it-works" className = "block py-2 text-gray-600" onClick = {() => setIsMenuOpen(false)}> How It Works </Link>
        < Link href = "#testimonials" className = "block py-2 text-gray-600" onClick = {() => setIsMenuOpen(false)}> Testimonials </Link>
            < Link href = "#pricing" className = "block py-2 text-gray-600" onClick = {() => setIsMenuOpen(false)}> Pricing </Link>
                < Link href = "/app" className = "block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-full mt-2 text-center" >
                    Try Now
                        </Link>
                        </div>
                        </div>
        )}
</nav>
    );
  };
