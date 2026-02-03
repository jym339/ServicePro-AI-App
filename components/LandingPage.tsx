
import React, { useEffect, useState } from 'react';
import { 
  Phone, 
  CheckCircle, 
  ArrowRight, 
  Zap,
  Star,
  Play,
  Shield,
  BarChart3,
  Clock,
  MapPin,
  ChevronRight,
  Menu,
  X,
  Smartphone,
  Cpu,
  Truck
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  const handleDemoClick = () => {
    alert("Launching Interactive AI Demo. Redirecting to Dispatcher Console...");
    onStart();
  };

  const handleSalesClick = () => {
    const email = prompt("Enter your email and our sales team will reach out within 15 minutes:");
    if (email) {
      alert(`Success! A custom quote for ${email} is being prepared.`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ServicePro AI</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {['Features', 'How it Works', 'Pricing'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(/\s/g, '-'))}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onStart}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
            >
              Dispatcher Login
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button className="md:hidden text-slate-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300 shadow-xl">
            {['Features', 'How it Works', 'Pricing'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase().replace(/\s/g, '-'))}
                className="text-left text-lg font-bold text-slate-900 py-2 border-b border-slate-50 last:border-0"
              >
                {item}
              </button>
            ))}
            <button 
              onClick={onStart}
              className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl font-bold text-center shadow-lg shadow-blue-500/20"
            >
              Access Platform
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10 opacity-60" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10 opacity-40" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-8">
              <Zap className="w-3.5 h-3.5 fill-blue-600" />
              THE FUTURE OF HOME SERVICE DISPATCH
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
              Never miss another <span className="text-blue-600">revenue</span> call.
            </h1>
            <p className="text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              24/7 AI Receptionist for plumbing, HVAC, and electrical. We book the calls, verify the addresses, and dispatch your team while you sleep.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDemoClick}
                className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group"
              >
                <Play className="w-5 h-5 fill-slate-700 group-hover:scale-110 transition-transform" />
                Live Demo
              </button>
            </div>
          </div>

          <div className="flex-1 relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="relative z-10 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white p-2 shadow-2xl shadow-slate-200/50 group">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" 
                alt="Modern Office" 
                className="w-full h-auto rounded-2xl grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute -bottom-10 -left-10 bg-white/90 backdrop-blur shadow-xl border border-slate-100 p-6 rounded-2xl animate-bounce-slow max-w-[240px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-slate-900">Appointment Booked</span>
                </div>
                <p className="text-xs text-slate-500"> Sarah J. • Emergency HVAC • Springfield</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Your business, on autopilot.</h2>
            <p className="text-lg text-slate-500">Stop wasting time on qualification calls. Our AI handles the logistics so you can focus on the technical work.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Phone className="w-6 h-6 text-blue-600" />}
              title="Voice Reception"
              description="Real-time voice interaction that sounds human, captures technical details, and stays on script."
            />
            <FeatureCard 
              icon={<MapPin className="w-6 h-6 text-indigo-600" />}
              title="Zone Verification"
              description="Automatic Google Maps checks to ensure every caller is within your active service region."
            />
            <FeatureCard 
              icon={<Clock className="w-6 h-6 text-emerald-600" />}
              title="24/7 Availability"
              description="Capture leads at 3 AM while your competitors are asleep. Instant booking, zero wait time."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 bg-slate-50/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Three steps to scale.</h2>
            <p className="text-slate-500">Get up and running in less than an hour.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-slate-200 -z-10" />
            <StepItem 
              num="01" 
              icon={<Smartphone className="w-6 h-6" />} 
              title="Connect Your Line" 
              desc="Forward your existing business number to our secure AI bridge." 
            />
            <StepItem 
              num="02" 
              icon={<Cpu className="w-6 h-6" />} 
              title="AI Training" 
              desc="Upload your service menu, pricing, and service area boundaries." 
            />
            <StepItem 
              num="03" 
              icon={<Truck className="w-6 h-6" />} 
              title="Go Live" 
              desc="AI starts booking appointments directly into your dispatch calendar." 
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Pricing for growth.</h2>
            <p className="text-slate-500">Simple plans with no hidden booking fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title="Starter" 
              price="$99" 
              features={['Up to 50 calls/mo', 'Basic Dispatch', 'SMS Alerts', 'Standard Voice']} 
              onSelect={onStart}
            />
            <PricingCard 
              title="Professional" 
              price="$249" 
              featured 
              features={['Unlimited calls', 'Google Maps Grounding', 'Full Calendar Sync', 'Premium AI Voice']} 
              onSelect={onStart}
            />
            <PricingCard 
              title="Enterprise" 
              price="Custom" 
              features={['Multi-region support', 'Custom AI Persona', 'White-labeling', 'API Access']} 
              onSelect={handleSalesClick}
              ctaText="Talk to Sales"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[40px] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">Ready to dominate your local market?</h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">Join hundreds of service businesses using AI to never miss a lead again. Setup takes less than 5 minutes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto px-10 py-5 bg-white text-blue-600 hover:bg-slate-50 rounded-2xl font-black text-xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                Get Started Now
              </button>
              <button 
                onClick={handleSalesClick}
                className="flex items-center gap-2 text-white font-bold hover:underline"
              >
                Contact Sales Team <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">ServicePro AI</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Redefining home service dispatching with world-class AI technology.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <FooterColumn title="Product" links={['Features', 'How it Works', 'Pricing']} onLinkClick={(l) => scrollToSection(l.toLowerCase().replace(/\s/g, '-'))} />
              <FooterColumn title="Company" links={['About', 'Careers', 'Contact']} onLinkClick={handleSalesClick} />
            </div>
          </div>
          <div className="pt-8 border-t border-slate-50 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <p>© 2024 ServicePro AI Inc.</p>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-40 animate-in slide-in-from-bottom-12 duration-1000">
        <button 
          onClick={onStart}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-2xl flex items-center justify-center gap-2"
        >
          Request Free Audit
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="group p-10 rounded-[32px] bg-white border border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
    <div className="mb-8 p-4 bg-slate-50 w-fit rounded-2xl border border-slate-100 transition-colors group-hover:bg-blue-50 group-hover:border-blue-100">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
  </div>
);

const StepItem = ({ num, icon, title, desc }: { num: string, icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-24 h-24 rounded-[32px] bg-white border border-slate-100 shadow-xl flex items-center justify-center mb-8 relative group hover:border-blue-200 transition-all">
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">{num}</div>
      <div className="text-blue-600 transition-transform group-hover:scale-110">{icon}</div>
    </div>
    <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const PricingCard = ({ title, price, features, featured, onSelect, ctaText = "Choose Plan" }: any) => (
  <div className={`p-10 rounded-[40px] border transition-all duration-500 ${featured ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105' : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-xl'}`}>
    {featured && <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-blue-400">Most Popular</div>}
    <h4 className={`text-xl font-bold mb-2 ${featured ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
    <div className="flex items-baseline gap-1 mb-8">
      <span className="text-4xl font-black">{price}</span>
      {price !== 'Custom' && <span className={`text-sm ${featured ? 'text-slate-400' : 'text-slate-500'}`}>/mo</span>}
    </div>
    <ul className="space-y-4 mb-10">
      {features.map((f: string) => (
        <li key={f} className="flex items-center gap-3 text-sm font-medium">
          <CheckCircle className={`w-4 h-4 ${featured ? 'text-blue-400' : 'text-blue-600'}`} />
          {f}
        </li>
      ))}
    </ul>
    <button 
      onClick={onSelect}
      className={`w-full py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${featured ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'}`}
    >
      {ctaText}
    </button>
  </div>
);

const FooterColumn = ({ title, links, onLinkClick }: any) => (
  <div>
    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">{title}</h4>
    <ul className="space-y-4">
      {links.map((link: string) => (
        <li key={link}>
          <button 
            onClick={() => onLinkClick(link)}
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium text-left"
          >
            {link}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default LandingPage;
