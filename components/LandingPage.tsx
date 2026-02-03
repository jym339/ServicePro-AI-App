
import React from 'react';
import { 
  Phone, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3, 
  Zap,
  Star,
  ChevronRight,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 64; // Header height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-blue-500/20 shadow-lg cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>ServicePro AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a 
                href="#features" 
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                How it Works
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => scrollToSection(e, 'pricing')}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onStart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
              >
                Go to App
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Zap className="w-3 h-3 fill-blue-600" />
            VIRTUAL VOICE DISPATCHER V2.0 IS LIVE
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Never Miss a <span className="text-blue-600">Service Call</span> Again.
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            The 24/7 AI Receptionist built specifically for HVAC, Plumbing, and Home Service companies. Automated dispatching, area verification, and SMS scheduling.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={(e) => scrollToSection(e as any, 'how-it-works')}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-5 h-5 fill-slate-700" />
              Watch Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-20 pt-10 border-t border-slate-100 animate-in fade-in duration-1000 delay-500">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by 500+ Home Service Businesses</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale contrast-125">
              <span className="text-xl font-black italic">HVAC-Pros</span>
              <span className="text-xl font-black italic">PLUMB-LINK</span>
              <span className="text-xl font-black italic">ROOTER-MAX</span>
              <span className="text-xl font-black italic">FLOW-STATE</span>
              <span className="text-xl font-black italic">CITY-AIR</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-200 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything your business needs to scale.</h2>
            <p className="text-lg text-slate-600">Automate your intake and focus on the technical work that matters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Phone className="w-6 h-6 text-blue-600" />}
              title="24/7 AI Voice Intake"
              description="Human-like voice interaction that gathers details, classifies problems, and handles emergencies instantly."
            />
            <FeatureCard 
              icon={<MapPin className="w-6 h-6 text-emerald-600" />}
              title="Maps Grounding"
              description="Automatic service area verification using real-time Google Maps data to ensure technicians only go where you work."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title="Instant Dispatch"
              description="Identifies high-priority emergencies (like flooding or gas leaks) and alerts your team via SMS immediately."
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6 text-purple-600" />}
              title="SMS Confirmations"
              description="Automatically send appointment details, confirmation numbers, and tech tracking info via SMS to customers."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
              title="CRM Integration"
              description="All leads are automatically logged into your CRM with full transcripts and technical service summaries."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-slate-700" />}
              title="Professional Persona"
              description="The AI maintains your company's tone and values, providing a consistent, white-glove experience for every caller."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Simple. Powerful. Efficient.</h2>
          
          <div className="space-y-12">
            <Step 
              number="01" 
              title="Connect your Number" 
              description="Redirect your missed calls or main office line to ServicePro AI. Setup takes less than 5 minutes." 
            />
            <Step 
              number="02" 
              title="Define your Service Area" 
              description="Tell the AI which zip codes or cities you cover. It uses Google Maps to verify every caller's address." 
            />
            <Step 
              number="03" 
              title="AI Handles the Rest" 
              description="The AI answers calls, gathers info, qualifies leads, schedules appointments, and sends SMS confirmations." 
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-900 text-white overflow-hidden relative scroll-mt-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 blur-[100px] translate-y-1/2 -translate-x-1/2 rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Transparent Pricing</h2>
            <p className="text-slate-400">Scale with confidence. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              tier="Starter" 
              price="$99" 
              description="Perfect for solo contractors."
              onAction={onStart}
              features={['Up to 50 calls/mo', 'Email Notifications', 'Standard Voice AI', 'Dashboard Access']}
            />
            <PricingCard 
              tier="Professional" 
              price="$249" 
              description="Most popular for growing teams."
              highlighted={true}
              onAction={onStart}
              features={['Unlimited Calls', 'SMS Dispatching', 'CRM Integration', 'Maps Grounding', 'Priority AI Models']}
            />
            <PricingCard 
              tier="Enterprise" 
              price="Custom" 
              description="For franchises and multi-location."
              onAction={onStart}
              features={['Multiple Numbers', 'Custom AI Persona', 'API Access', 'Dedicated Support', 'Whitelabel Options']}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">"This changed how we handle after-hours calls."</h2>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-lg text-slate-600 mb-8 italic">
                "We used to pay an answering service $800 a month and they constantly got the details wrong. ServicePro AI is 1/4th the cost and twice as accurate. Our dispatchers love it."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div>
                  <p className="font-bold text-slate-900">Dave Miller</p>
                  <p className="text-sm text-slate-500">Owner, Miller HVAC & Plumbing</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-100 rounded-3xl p-1 aspect-video relative group overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-transparent transition-colors z-10" />
              <img 
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop" 
                alt="HVAC Tech" 
                className="w-full h-full object-cover rounded-[20px]"
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur rounded-2xl z-20 shadow-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">Live Demo Result</p>
                  <p className="text-sm font-bold text-slate-900">Emergency Leak Dispatched</p>
                </div>
                <div className="bg-emerald-500 text-white p-2 rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-blue-600 text-white text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Ready to never miss a lead again?</h2>
          <p className="text-xl text-blue-100 mb-10">Join hundreds of service businesses using AI to dominate their local market.</p>
          <button 
            onClick={onStart}
            className="bg-white text-blue-600 hover:bg-slate-50 px-10 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
          >
            Start Your 14-Day Trial
            <ArrowRight className="w-6 h-6" />
          </button>
          <p className="mt-6 text-blue-200 text-sm">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded-lg">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>ServicePro AI</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500 font-medium">
            <a 
              href="#features" 
              onClick={(e) => scrollToSection(e, 'features')}
              className="hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="hover:text-blue-600 transition-colors"
            >
              Pricing
            </a>
            <a href="mailto:sales@servicepro.ai" className="hover:text-blue-600 transition-colors">Contact Sales</a>
          </div>
          <p className="text-sm text-slate-400">© 2024 ServicePro AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
    <div className="mb-6 p-3 bg-slate-50 w-fit rounded-2xl border border-slate-100">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
  </div>
);

const Step = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="flex gap-8 group">
    <div className="text-4xl font-black text-slate-200 group-hover:text-blue-600/20 transition-colors tabular-nums">
      {number}
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-3">
        {title}
        <div className="h-px bg-slate-100 flex-1 hidden md:block" />
      </h3>
      <p className="text-slate-600 max-w-xl">{description}</p>
    </div>
  </div>
);

const PricingCard = ({ tier, price, description, features, onAction, highlighted = false }: { 
  tier: string, price: string, description: string, features: string[], onAction: () => void, highlighted?: boolean 
}) => (
  <div className={`p-8 rounded-3xl border transition-all ${highlighted ? 'bg-blue-600 border-blue-500 scale-105 shadow-2xl shadow-blue-500/20' : 'bg-slate-800 border-slate-700'}`}>
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-2">{tier}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-black">{price}</span>
        {price !== 'Custom' && <span className="text-slate-400">/mo</span>}
      </div>
      <p className={highlighted ? 'text-blue-100' : 'text-slate-400'}>{description}</p>
    </div>
    <div className="space-y-4 mb-8">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${highlighted ? 'text-white' : 'text-blue-500'}`} />
          <span className={highlighted ? 'text-blue-50' : 'text-slate-300'}>{f}</span>
        </div>
      ))}
    </div>
    <button 
      onClick={onAction}
      className={`w-full py-4 rounded-2xl font-bold transition-all ${highlighted ? 'bg-white text-blue-600 hover:bg-slate-50' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
    >
      Get Started
    </button>
  </div>
);

export default LandingPage;
