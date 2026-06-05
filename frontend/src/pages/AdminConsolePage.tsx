import React, { useState } from 'react';
import { useEventSpark } from '../context/EventSparkContext';
import { User, Event } from '../types';
import { 
  ShieldCheck, Users, Calendar, DollarSign, Ban, Star, Settings, CheckCircle, 
  Sparkles, ShieldX, ListFilter, SlidersHorizontal, ToggleRight, Info 
} from 'lucide-react';

export const AdminConsolePage: React.FC = () => {
  const { 
    events, registrations, promoCodes, isLightMode, currentUser, showToast 
  } = useEventSpark();

  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'configs'>('users');
  const [usersSearch, setUsersSearch] = useState('');
  const [eventsSearch, setEventsSearch] = useState('');

  // 1. SIMULATE FULL PLATFORM SYSTEM STATS
  const totalSystemRegistrations = registrations.filter(r => r.status === 'booked');
  const totalVolumeIncomes = totalSystemRegistrations.reduce((acc, r) => acc + r.totalAmount, 0);

  // Mock list platform users
  const [usersList, setUsersList] = useState<User[]>([
    { _id: 'usr-admin', name: 'Super Admin India', email: 'admin@eventspark.in', role: 'admin', company: 'EventSpark Team' },
    { _id: 'usr-org', name: 'Rohan Sharma', email: 'organizer@eventspark.in', role: 'organizer', company: 'Siddhi Planners' },
    { _id: 'usr-att', name: 'Amit Patel', email: 'attendee@test.in', role: 'attendee' },
    { _id: 'usr-user4', name: 'Karishma Rao', email: 'karishma@mumbaiweddings.in', role: 'organizer', company: 'Dream Vows' },
    { _id: 'usr-user5', name: 'Deepak Jha', email: 'deepak@corporatehub.in', role: 'attendee' }
  ]);

  // Handle mock role modifications
  const handleToggleOrganizerRole = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u._id === userId) {
        const nextRole = u.role === 'organizer' ? 'attendee' : 'organizer';
        showToast(`Role updated successfully to ${nextRole}!`, 'success');
        return { ...u, role: nextRole as any };
      }
      return u;
    }));
  };

  const handleToggleAdminStatus = (userId: string) => {
    setUsersList(prev => prev.map(u => {
      if (u._id === userId) {
        const nextRole = u.role === 'admin' ? 'attendee' : 'admin';
        showToast(`System permissions toggled! Admin is now ${nextRole === 'admin'}`, 'info');
        return { ...u, role: nextRole as any };
      }
      return u;
    }));
  };

  const handleBanUserToggle = (userId: string) => {
    showToast('User limitations updated. Security flag raised in sandbox!', 'warning');
  };

  // Settings configs defaults
  const [commissionsPercent, setCommissionsPercent] = useState(12);
  const [enableSMSNotification, setEnableSMSNotification] = useState(true);
  const [paymentSandboxMode, setPaymentSandboxMode] = useState(true);

  // Client Filter users list
  const filteredUsers = usersList.filter(u => {
    const q = usersSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className={`min-h-screen py-10 transition-colors duration-200 ${
      isLightMode ? 'bg-slate-50 text-gray-900' : 'bg-[#080808] text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* UPPER MAIN ADMIN BLOCK */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 select-none">
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-wide text-white">Super Administrator Suite</h1>
            <p className="text-xs text-gray-400 mt-1">Platform General Management: Monitor user nodes, inspect events statuses, regulate commissions percentage.</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-400 rotate-12" />
            <span className="text-[10px] font-bold text-red-400 tracking-widest uppercase">Admin Override Session Active</span>
          </div>
        </div>

        {/* STATS TOTAL SYSTEM OVERVIEWS */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8 select-none">
          
          <div className="p-6 rounded-2xl bg-[#111111] border border-zinc-900 flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">Global Accounts</span>
              <span className="text-2xl font-bold font-serif text-white">{usersList.length} Registered</span>
            </div>
            <div className="bg-blue-500/15 text-blue-400 p-2.5 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111111] border border-zinc-900 flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">System Events Catalog</span>
              <span className="text-2xl font-bold font-serif text-white">{events.length} Live Items</span>
            </div>
            <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111111] border border-zinc-900 flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">Commission Pool (12%)</span>
              <span className="text-2xl font-bold font-serif text-[#F59E0B]">₹{Math.round(totalVolumeIncomes * (commissionsPercent / 100))}</span>
            </div>
            <div className="bg-yellow-500/15 text-gold p-2.5 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111111] border border-zinc-900 flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">Total Ticket Sales</span>
              <span className="text-2xl font-bold font-serif text-pink-500">₹{totalVolumeIncomes}</span>
            </div>
            <div className="bg-pink-500/15 text-pink-400 p-2.5 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* TABS SELECTOR ROLLS */}
        <div className="flex border-b border-zinc-900 pb-4 mb-8 select-none gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 text-xs uppercase tracking-widest font-bold border-b-2 font-serif transition-colors ${
              activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Users Accounts Management
          </button>
          
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-2 text-xs uppercase tracking-widest font-bold border-b-2 font-serif transition-colors ${
              activeTab === 'events' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            System Events Moderation
          </button>

          <button
            onClick={() => setActiveTab('configs')}
            className={`pb-2 text-xs uppercase tracking-widest font-bold border-b-2 font-serif transition-colors ${
              activeTab === 'configs' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            System configuration Regulators
          </button>
        </div>

        {/* ======================================= */}
        {/* TAB 1: USERS LEDGER ADMIN CODES */}
        {/* ======================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 text-left">
            <div className="relative max-w-sm shrink-0">
              <input
                type="text"
                placeholder="Search usernames, email references..."
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                className="w-full bg-[#111]/80 border border-zinc-800 rounded-xl py-3 pl-4 pr-10 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="border border-zinc-850 rounded-2xl bg-zinc-950 overflow-hidden shadow-2xl">
              <table className="w-full text-left font-sans text-xs text-gray-400 border-collapse">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-850 uppercase text-[10px] text-gray-400 font-bold tracking-wider">
                    <th className="p-4">Global Account Profile</th>
                    <th className="p-4">Assigned Role Mode</th>
                    <th className="p-4">Linked Company</th>
                    <th className="p-4 text-center">Permit Actions Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-zinc-900/10">
                      <td className="p-4">
                        <span className="font-bold text-white block text-sm">{u.name}</span>
                        <span className="text-[10px] text-gray-500 block">{u.email}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded font-mono ${
                          u.role === 'admin' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/10' 
                            : u.role === 'organizer' 
                            ? 'bg-primary/10 text-primary border border-primary/10' 
                            : 'bg-zinc-900 text-gray-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 font-medium">
                        {u.company || 'Attendee Sandbox'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleToggleOrganizerRole(u._id)}
                            className="bg-zinc-900 border border-zinc-800 hover:border-primary text-white font-semibold py-1.5 px-2.5 rounded-lg text-[10px] uppercase tracking-wide"
                          >
                            Toggle Org Mode
                          </button>
                          
                          <button
                            onClick={() => handleToggleAdminStatus(u._id)}
                            className="bg-zinc-900 border border-zinc-800 hover:border-red-400 text-white font-semibold py-1.5 px-2.5 rounded-lg text-[10px] uppercase tracking-wide"
                          >
                            Toggle Admin
                          </button>

                          <button
                            onClick={() => handleBanUserToggle(u._id)}
                            className="p-1 px-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors block text-[10px] uppercase font-bold"
                          >
                            Ban Acc
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: SYSTEM EVENTS MODERATIONS BOARD */}
        {/* ======================================= */}
        {activeTab === 'events' && (
          <div className="space-y-6 text-left">
            <h2 className="font-serif text-xl font-bold text-white mb-2">Central Events Catalog Moderation</h2>
            <p className="text-xs text-gray-400 leading-normal">
              Admin regulators review wedding and corporate events. Promoting events onto the <b className="text-primary">Featured Catalog</b> raises high key conversion volumes.
            </p>

            <div className="border border-zinc-850 rounded-2xl bg-zinc-950 overflow-hidden shadow-2xl">
              <table className="w-full text-left font-sans text-xs text-gray-400 border-collapse">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-850 uppercase text-[10px] text-gray-400 font-bold tracking-wider">
                    <th className="p-4">Cover / Event Information</th>
                    <th className="p-4">Organizer Account</th>
                    <th className="p-4">Schedules Venue City</th>
                    <th className="p-4 text-center">Catalog Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {events.map((evt) => (
                    <tr key={evt._id} className="hover:bg-zinc-900/10">
                      <td className="p-4 flex gap-4 items-center">
                        <img src={evt.coverImage} className="w-16 h-10 object-cover rounded-md" />
                        <div>
                          <span className="font-bold text-white block text-xs">{evt.title}</span>
                          <span className="text-[10px] text-primary font-bold">{evt.category} | {evt.type}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300 font-medium">
                        {evt.organizerName}
                      </td>
                      <td className="p-4 text-gray-500 font-mono">
                        {evt.venue.city}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-3">
                          {evt.isFeatured ? (
                            <span className="text-[10px] font-bold text-gold bg-gold/15 border border-gold/15 py-1 px-2 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-gold" />
                              FEATURED HOME LIST
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                showToast('Event marked Featured! Set at the home screens list headings.', 'success');
                                evt.isFeatured = true;
                              }}
                              className="bg-zinc-900 hover:bg-[#F2994A] hover:text-white border border-zinc-800 text-gray-400 text-[10px] font-bold tracking-wide uppercase px-2.5 py-1.5 rounded-lg"
                            >
                              Feature Event
                            </button>
                          )}

                          <button
                            onClick={() => showToast('Event specifications verified and set Approved live!', 'success')}
                            className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg"
                          >
                            Approved
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: PLATFORM SYSTEM CONFIGURATIONS REGULATORS */}
        {/* ======================================= */}
        {activeTab === 'configs' && (
          <div className="max-w-2xl mx-auto space-y-6 text-left select-none animate-in fade-in duration-200">
            
            <div className="bg-[#111] p-6 rounded-3xl border border-zinc-850 space-y-6">
              <h3 className="font-serif text-lg font-bold text-white border-b border-zinc-900 pb-2">Global Commission Regulators</h3>
              
              <div className="space-y-4 text-xs font-sans">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Planners Platform Service Fee (%)</span>
                    <span className="font-bold text-primary text-base font-mono">{commissionsPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    value={commissionsPercent}
                    onChange={(e) => setCommissionsPercent(parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-zinc-90 w-full accent-primary h-1.5 bg-zinc-900 rounded-lg cursor-pointer"
                  />
                  <div className="text-[10px] text-gray-500 leading-normal mt-1 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    Our system deducts this rate margin from total ticket sales transacted before organizer payouts.
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block text-xs">Automat SMS Ticket Alerts</span>
                      <span className="text-[10px] text-gray-500">Dispatch passes via SMS</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setEnableSMSNotification(!enableSMSNotification)}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        enableSMSNotification ? 'bg-primary text-white' : 'bg-zinc-950 text-gray-500'
                      }`}
                    >
                      {enableSMSNotification ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>

                  <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-900 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block text-xs">Payment Sandbox Mode</span>
                      <span className="text-[10px] text-gray-500">Bypass bank token checkout</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentSandboxMode(!paymentSandboxMode)}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        paymentSandboxMode ? 'bg-green-500/10 text-green-400' : 'bg-zinc-950 text-gray-500'
                      }`}
                    >
                      {paymentSandboxMode ? 'SANDBOX ACTIVE' : 'REAL CHECKS'}
                    </button>
                  </div>

                </div>

                <div className="pt-4 border-t border-zinc-900 flex justify-end">
                  <button
                    type="button"
                    onClick={() => showToast('Global system configurations committed safely into configurations manifest!', 'success')}
                    className="bg-primary hover:opacity-95 text-white font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider text-[11px] font-sans"
                  >
                    Commit modifications
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
