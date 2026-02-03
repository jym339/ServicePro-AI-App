
import React, { useState } from 'react';
import { Lead, UrgencyLevel } from '../types';
import { 
  Users, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  MoreVertical, 
  MapPin, 
  PhoneCall, 
  Upload, 
  Plus, 
  TrendingUp,
  Clock,
  Filter
} from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
  onImportLeads?: (leads: Lead[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ leads, onImportLeads }) => {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Pending Dispatch', value: leads.filter(l => l.status === 'Pending').length, icon: AlertTriangle, color: 'bg-amber-500' },
    { label: 'Scheduled', value: leads.filter(l => l.status === 'Scheduled').length, icon: Calendar, color: 'bg-emerald-500' },
    { label: 'Completed', value: leads.filter(l => l.status === 'Completed').length, icon: CheckCircle2, color: 'bg-slate-500' },
  ];

  const handleImport = () => {
    try {
      // Basic mock importer for a JSON array
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed)) {
        const formattedLeads = parsed.map(l => ({
          ...l,
          id: l.id || Math.random().toString(36).substr(2, 9),
          timestamp: l.timestamp || Date.now(),
          status: l.status || 'Pending',
          urgency: l.urgency || UrgencyLevel.STANDARD
        }));
        onImportLeads?.(formattedLeads);
        setShowImport(false);
        setImportText('');
      }
    } catch (e) {
      alert('Invalid format. Please provide a JSON array of leads.');
    }
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case UrgencyLevel.EMERGENCY:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wider">Emergency</span>;
      case UrgencyLevel.URGENT:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 uppercase tracking-wider">Urgent</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">Standard</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Dispatched': return <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-semibold">Dispatched</span>;
      case 'Scheduled': return <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-semibold">Scheduled</span>;
      default: return <span className="text-slate-500 bg-slate-50 px-2 py-1 rounded text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Operational Overview</h2>
          <p className="text-slate-500 text-sm">Real-time performance and lead management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowImport(!showImport)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-4 h-4" />
            Manual Lead
          </button>
        </div>
      </div>

      {/* Bulk Import Modal/Drawer (Simplified) */}
      {showImport && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-blue-900 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Import leads from JSON / CRM Export
            </h4>
            <button onClick={() => setShowImport(false)} className="text-blue-400 hover:text-blue-600">✕</button>
          </div>
          <textarea 
            className="w-full h-32 p-4 rounded-xl border border-blue-200 text-sm font-mono mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder='[ { "fullName": "John Doe", "serviceType": "HVAC", "phoneNumber": "555-0123", "address": "123 Main St" } ]'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowImport(false)} className="px-4 py-2 text-sm font-semibold text-blue-600">Cancel</button>
            <button 
              onClick={handleImport}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
            >
              Confirm Import
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:border-blue-200 transition-all">
            <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-opacity-20 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Recent Service Inquiries
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg">
                <Filter className="w-4 h-4" />
              </button>
              <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">View All</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Service Details</th>
                  <th className="px-6 py-4">Urgency</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{lead.fullName}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                        <PhoneCall className="w-3 h-3" /> {lead.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{lead.serviceType}</div>
                      <div className="text-sm text-slate-500 line-clamp-1 max-w-[200px]">{lead.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getUrgencyBadge(lead.urgency)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leads.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No leads captured yet. Your AI Receptionist is ready for calls.
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/20">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Efficiency Score
            </h4>
            <div className="text-4xl font-black mb-2">94%</div>
            <p className="text-blue-100 text-sm">Lead response time is 12m faster than last week.</p>
            <div className="mt-4 h-2 bg-blue-400/30 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[94%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-4">Top Regions</h4>
            <div className="space-y-4">
              {[
                { name: 'Springfield', count: 12, pct: 45 },
                { name: 'Riverdale', count: 8, pct: 30 },
                { name: 'Anytown', count: 6, pct: 25 },
              ].map((region, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 font-medium">{region.name}</span>
                    <span className="text-slate-400">{region.count} leads</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-blue-500`} style={{ width: `${region.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
