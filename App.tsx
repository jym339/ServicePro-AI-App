
import React, { useState, useCallback, useEffect } from 'react';
import { CallState, Lead, UrgencyLevel, TeamMember, Appointment } from './types';
import Dashboard from './components/Dashboard';
import LiveCall from './components/LiveCall';
import LandingPage from './components/LandingPage';
import { 
  Phone, 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  Bell, 
  Home, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Users as UsersIcon,
  Search,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp,
  UserPlus,
  Shield,
  CreditCard,
  MessageSquare,
  // Added missing ArrowRight icon to resolve reference errors
  ArrowRight
} from 'lucide-react';

type AppTab = 'landing' | 'dashboard' | 'live' | 'calendar' | 'analytics' | 'team' | 'settings' | 'support';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('landing');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Mike Ross', role: 'Senior Plumber', status: 'Available', specialty: 'Water Filtration' },
    { id: '2', name: 'Rachel Zane', role: 'HVAC Tech', status: 'On Call', specialty: 'Air Quality' }
  ]);
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', customerName: 'Sarah Jenkins', serviceType: 'HVAC Repair', date: '2024-05-20', time: '14:00' }
  ]);

  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    transcription: [],
    currentLead: {}
  });

  // Mock initial data
  useEffect(() => {
    const mockLeads: Lead[] = [
      {
        id: '1',
        timestamp: Date.now() - 3600000,
        fullName: 'Sarah Jenkins',
        phoneNumber: '555-0102',
        address: '742 Evergreen Terrace, Springfield',
        serviceType: 'HVAC Repair',
        description: 'AC unit making loud grinding noise',
        urgency: UrgencyLevel.URGENT,
        status: 'Scheduled',
        appointmentDate: '2024-05-20',
        appointmentTime: '14:00',
        confirmationNumber: 'SP-12345',
        inServiceArea: true
      },
      {
        id: '2',
        timestamp: Date.now() - 7200000,
        fullName: 'Mark Thompson',
        phoneNumber: '555-0199',
        address: '101 Maple Ave, Riverdale',
        serviceType: 'Plumbing',
        description: 'Leaking water heater in basement',
        urgency: UrgencyLevel.EMERGENCY,
        status: 'Dispatched',
        inServiceArea: true
      }
    ];
    setLeads(mockLeads);
  }, []);

  const handleNewLead = useCallback((leadData: Partial<Lead>) => {
    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      fullName: leadData.fullName || 'Unknown',
      phoneNumber: leadData.phoneNumber || 'N/A',
      address: leadData.address || 'N/A',
      serviceType: leadData.serviceType || 'General Inquiry',
      description: leadData.description || 'No description provided',
      urgency: leadData.urgency || UrgencyLevel.STANDARD,
      status: leadData.urgency === UrgencyLevel.EMERGENCY ? 'Dispatched' : 'Pending',
      ...leadData
    };
    setLeads(prev => [newLead, ...prev]);
  }, []);

  const handleImportLeads = useCallback((importedLeads: Lead[]) => {
    setLeads(prev => [...importedLeads, ...prev]);
  }, []);

  const addTeamMember = () => {
    const name = prompt("Enter Team Member Name:");
    const role = prompt("Enter Role (e.g., Plumber, HVAC Tech):");
    if (name && role) {
      setTeamMembers(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        name,
        role,
        status: 'Available',
        specialty: 'General'
      }]);
    }
  };

  const addAppointment = () => {
    const customerName = prompt("Enter Customer Name:");
    const serviceType = prompt("Enter Service Type:");
    const date = new Date().toISOString().split('T')[0];
    const time = "12:00";
    if (customerName && serviceType) {
      setAppointments(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        customerName,
        serviceType,
        date,
        time
      }]);
    }
  };

  const updateCallState = useCallback((updates: Partial<CallState>) => {
    setCallState(prev => ({ ...prev, ...updates }));
  }, []);

  if (activeTab === 'landing') {
    return <LandingPage onStart={() => setActiveTab('dashboard')} />;
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard leads={leads} onImportLeads={handleImportLeads} />;
      case 'live':
        return <LiveCall callState={callState} onNewLead={handleNewLead} onStateChange={updateCallState} />;
      case 'calendar':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Dispatch Calendar</h3>
                <p className="text-slate-500 text-sm">Manage scheduled service calls</p>
              </div>
              <button 
                onClick={addAppointment}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all"
              >
                <Plus className="w-4 h-4" /> Manual Schedule
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appointments.map(apt => (
                <div key={apt.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase">{apt.time}</span>
                  </div>
                  <h4 className="font-bold text-slate-900">{apt.customerName}</h4>
                  <p className="text-sm text-slate-500 mb-4">{apt.serviceType}</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Scheduled for {apt.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Analytics & Insights</h3>
              <p className="text-slate-500 text-sm">Performance metrics across your operation</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Conversion Rate
                </h4>
                <div className="text-4xl font-black text-slate-900">68%</div>
                <p className="text-emerald-600 text-sm font-bold mt-2">+12% from last month</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> Avg Response Time
                </h4>
                <div className="text-4xl font-black text-slate-900">4.2m</div>
                <p className="text-blue-600 text-sm font-bold mt-2">-2m improvement</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-500" /> AI Handle Rate
                </h4>
                <div className="text-4xl font-black text-slate-900">92%</div>
                <p className="text-indigo-600 text-sm font-bold mt-2">Only 8% required human transfer</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-6">Service Volume (Last 7 Days)</h4>
              <div className="flex items-end gap-4 h-48">
                {[45, 60, 35, 80, 55, 70, 90].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-blue-100 rounded-t-lg transition-all group-hover:bg-blue-600 relative" style={{ height: `${h}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {Math.floor(h * 1.5)} Calls
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Day {i+1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Technician Fleet</h3>
                <p className="text-slate-500 text-sm">Manage your active service crew</p>
              </div>
              <button 
                onClick={addTeamMember}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all"
              >
                <UserPlus className="w-4 h-4" /> Add Technician
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamMembers.map(member => (
                <div key={member.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <UsersIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900">{member.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${member.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {member.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{member.role} • {member.specialty}</p>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Account Settings</h3>
              <p className="text-slate-500 text-sm">Manage your business profile and AI preferences</p>
            </div>
            <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-100 shadow-sm">
              <div className="p-6 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Shield className="w-5 h-5" /></div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Security & Privacy</h5>
                    <p className="text-xs text-slate-400">Passwords, 2FA, and login history</p>
                  </div>
                </div>
                {/* Fixed: Use imported ArrowRight icon */}
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-all" />
              </div>
              <div className="p-6 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><CreditCard className="w-5 h-5" /></div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Subscription & Billing</h5>
                    <p className="text-xs text-slate-400">Current plan: Professional ($249/mo)</p>
                  </div>
                </div>
                {/* Fixed: Use imported ArrowRight icon */}
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-all" />
              </div>
              <div className="p-6 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Bot className="w-5 h-5" /></div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">AI Configuration</h5>
                    <p className="text-xs text-slate-400">Persona voice, dispatch rules, and SMS templates</p>
                  </div>
                </div>
                {/* Fixed: Use imported ArrowRight icon */}
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-all" />
              </div>
            </div>
          </div>
        );
      case 'support':
        return (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in duration-300">
            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-2xl shadow-blue-500/20">
              <HelpCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold">How can we help?</h3>
              <p className="text-blue-100 mt-2">Our support team is available 24/7 for Enterprise customers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
                <MessageSquare className="w-6 h-6 text-blue-500 mb-4" />
                <h5 className="font-bold text-slate-900 mb-1">Live Chat</h5>
                <p className="text-sm text-slate-500 mb-4">Chat with a human expert in minutes.</p>
                <button className="text-sm font-bold text-blue-600 hover:underline">Start Chat</button>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
                <CalendarIcon className="w-6 h-6 text-indigo-500 mb-4" />
                <h5 className="font-bold text-slate-900 mb-1">Training Session</h5>
                <p className="text-sm text-slate-500 mb-4">Book a 30-min walkthrough of the AI.</p>
                <button className="text-sm font-bold text-indigo-600 hover:underline">Schedule Call</button>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard leads={leads} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-slate-900 text-white flex flex-col items-center py-6 shadow-xl transition-all border-r border-slate-800">
        <div className="flex items-center gap-3 px-6 mb-10 group cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="bg-blue-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Phone className="w-6 h-6" />
          </div>
          <h1 className="hidden md:block text-xl font-bold tracking-tight">ServicePro AI</h1>
        </div>

        <nav className="flex-1 flex flex-col gap-1 w-full px-3">
          <NavItem active={activeTab === 'dashboard'} icon={LayoutDashboard} label="Dashboard" onClick={() => setActiveTab('dashboard')} />
          <NavItem 
            active={activeTab === 'live'} 
            icon={Phone} 
            label="Receptionist" 
            onClick={() => setActiveTab('live')} 
            badge={callState.isActive}
          />
          <NavItem active={activeTab === 'calendar'} icon={CalendarIcon} label="Calendar" onClick={() => setActiveTab('calendar')} />
          <NavItem active={activeTab === 'analytics'} icon={BarChart2} label="Analytics" onClick={() => setActiveTab('analytics')} />
          <NavItem active={activeTab === 'team'} icon={UsersIcon} label="Team" onClick={() => setActiveTab('team')} />
        </nav>

        <div className="mt-auto w-full px-3 flex flex-col gap-1 pt-6 border-t border-slate-800">
          <NavItem active={activeTab === 'settings'} icon={SettingsIcon} label="Settings" onClick={() => setActiveTab('settings')} />
          <NavItem active={activeTab === 'support'} icon={HelpCircle} label="Support" onClick={() => setActiveTab('support')} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search leads, techs, or addresses..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                JD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">John Dispatcher</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Admin Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  active: boolean;
  icon: any;
  label: string;
  onClick: () => void;
  badge?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ active, icon: Icon, label, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
  >
    <div className="relative">
      <Icon className={`w-5 h-5 shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
      {badge && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />}
    </div>
    <span className="hidden md:block font-bold text-sm tracking-tight">{label}</span>
    {active && <div className="ml-auto hidden md:block w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"></div>}
  </button>
);

const Bot = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

export default App;
