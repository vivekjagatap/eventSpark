import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEventSpark } from '../context/EventSparkContext';
import { Event, TicketType, PromoCode, Registration } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Building, Calendar, DollarSign, Users, Award, ShieldCheck, Ticket, PlusCircle, 
  Trash2, Bell, Tag, ListFilter, ClipboardCheck, ArrowUpRight, Check, X, Megaphone, Loader2 
} from 'lucide-react';

export const OrganizerConsolePage: React.FC = () => {
  const { 
    events, registrations, promoCodes, addEvent, deleteEvent, createPromo, toggleCheckIn, isLightMode, currentUser, showToast 
  } = useEventSpark();

  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'create' | 'attendance' | 'promos'>('overview');
  
  // Create Event Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    category: 'Corporate',
    type: 'offline' as 'online' | 'offline' | 'hybrid',
    startDate: '2026-06-15',
    endDate: '2026-06-16',
    startTime: '09:00',
    endTime: '17:00',
    venue: {
      name: 'JW Marriott',
      address: 'Senapati Bapat Road, Pune',
      city: 'Pune',
      mapLink: ''
    },
    refundPolicy: 'No refunds within 24 hours of starting.',
    schedule: [
      { time: '09:00', title: 'Registrations Open', description: 'Priority desks validation' }
    ],
    speakers: [
      { name: 'Dr. Aarav Patel', title: 'Tech Pioneer', bio: 'AI researcher and author', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' }
    ],
    faqs: [
      { question: 'Is parking available?', answer: 'Yes, secure valet parking is provided.' }
    ]
  });

  const [ticketTiers, setTicketTiers] = useState<TicketType[]>([
    { type: 'Regular Ticket', price: 999, quantity: 200, sold: 0, description: 'General hall access' },
    { type: 'VIP Admission', price: 2499, quantity: 50, sold: 0, description: 'Priority front lounge & dinner' }
  ]);

  // Create Promo Code State
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 20,
    isActive: true,
    applicableEvents: [] as string[]
  });

  // Gates Check-in filter
  const [checkInSearch, setCheckInSearch] = useState('');

  // 1. CALCULATE CORE ANALYTICAL SUMS
  const myEvents = events; // Seeded sandbox filters to all active sets
  const totalMyEvents = myEvents.length;
  const totalCheckedIn = registrations.filter(r => r.isCheckedIn && r.status === 'booked').length;
  const totalVolumeIncome = registrations
    .filter(r => r.status === 'booked')
    .reduce((acc, r) => acc + r.totalAmount, 0);

  // Accumulate total sold counts
  const totalSeatsSold = registrations
    .filter(r => r.status === 'booked')
    .reduce((acc, r) => acc + r.tickets.reduce((sum, t) => sum + t.quantity, 0), 0);

  // Generate charts records
  const chartData = [
    { name: 'May 1', registrations: 4 },
    { name: 'May 5', registrations: 12 },
    { name: 'May 10', registrations: 21 },
    { name: 'May 15', registrations: 34 },
    { name: 'May 20', registrations: 48 },
    { name: 'May 24', registrations: registrations.filter(r => r.status === 'booked').length }
  ];

  const handleStepNext = () => {
    if (wizardStep === 1 && !newEvent.title.trim()) {
      showToast('Please provide a compelling Event Title!', 'warning');
      return;
    }
    setWizardStep(prev => prev + 1);
  };

  const handleStepPrev = () => {
    setWizardStep(prev => Math.max(1, prev - 1));
  };

  // Dispatch Event creation to backend
  const handlePublishEvent = async () => {
    const finalPayload = {
      ...newEvent,
      tickets: ticketTiers
    };

    const success = await addEvent(finalPayload);
    if (success) {
      // Done. Reset
      setNewEvent({
        title: '',
        description: '',
        coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        category: 'Corporate',
        type: 'offline',
        startDate: '2026-06-15',
        endDate: '2026-06-16',
        startTime: '09:00',
        endTime: '17:00',
        venue: { name: 'JW Marriott', address: 'Senapati Bapat Road, Pune', city: 'Pune', mapLink: '' },
        refundPolicy: 'No refunds within 24 hours of starting.',
        schedule: [{ time: '09:00', title: 'Registrations Open', description: 'Priority desks validation' }],
        speakers: [{ name: 'Dr. Aarav Patel', title: 'Tech Pioneer', bio: 'AI researcher', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' }],
        faqs: [{ question: 'Is parking available?', answer: 'Yes, secure valet parking is provided.' }]
      });
      setTicketTiers([
        { type: 'Regular Ticket', price: 999, quantity: 200, sold: 0, description: 'General hall access' }
      ]);
      setWizardStep(1);
      setActiveTab('events');
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.code.trim()) return;
    const ok = await createPromo(promoForm);
    if (ok) {
      setPromoForm({ code: '', discountType: 'percentage', discountValue: 20, isActive: true, applicableEvents: [] });
    }
  };

  const handleSeatCapacityChange = (idx: number, field: keyof TicketType, val: any) => {
    const updated = [...ticketTiers];
    updated[idx] = { ...updated[idx], [field]: val };
    setTicketTiers(updated);
  };

  const addTicketTierRow = () => {
    setTicketTiers([...ticketTiers, { type: 'VIP Pass', price: 1500, quantity: 100, sold: 0, description: 'Access perks' }]);
  };

  const removeTicketTierRow = (idx: number) => {
    setTicketTiers(prev => prev.filter((_, i) => i !== idx));
  };

  // Searching check-in ticket users array
  const filteredAttendees = registrations.filter(reg => {
    if (reg.status !== 'booked') return false;
    const q = checkInSearch.toLowerCase();
    return (
      reg.eventTitle.toLowerCase().includes(q) ||
      reg.attendees.some(att => att.name.toLowerCase().includes(q) || att.email.toLowerCase().includes(q)) ||
      reg._id.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`min-h-screen py-10 transition-colors duration-200 ${
      isLightMode ? 'bg-slate-50 text-gray-900' : 'bg-[#080808] text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* UPPER CONSOLE CAPTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 select-none">
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-wide text-white">Event Planner Console</h1>
            <p className="text-xs text-gray-400 mt-1">
              Sandbox Control Room: Manage tickets, generate coupons, inspect gates check-in synchronously.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 px-4 py-2 rounded-2xl">
            <Users className="w-4 h-4 text-primary animate-pulse" />
            <div className="text-left">
              <span className="text-[10px] text-gray-500 block">Logged Persona</span>
              <span className="text-xs font-bold text-white uppercase font-serif tracking-widest">{currentUser?.name || 'Rohan Sharma'}</span>
            </div>
          </div>
        </div>

        {/* TABS SIDEBAR / NAVIGATION ROW */}
        <div className="flex flex-wrap gap-2.5 mb-8 border-b border-zinc-900 pb-4 select-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              activeTab === 'overview' 
                ? 'bg-primary border-primary text-white' 
                : 'bg-zinc-900 border-zinc-850 text-gray-400 hover:text-white'
            }`}
          >
            Overview Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              activeTab === 'events' 
                ? 'bg-primary border-primary text-white' 
                : 'bg-zinc-900 border-zinc-850 text-gray-400 hover:text-white'
            }`}
          >
            My Active Events
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              activeTab === 'create' 
                ? 'bg-primary border-primary text-white' 
                : 'bg-zinc-900 border-zinc-850 text-gray-400 hover:text-white'
            }`}
          >
            Draft Step Wizard
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              activeTab === 'attendance' 
                ? 'bg-primary border-primary text-white' 
                : 'bg-zinc-900 border-zinc-850 text-gray-400 hover:text-white'
            }`}
          >
            Gates Attendance check-In ({filteredAttendees.length})
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              activeTab === 'promos' 
                ? 'bg-primary border-primary text-white' 
                : 'bg-zinc-900 border-zinc-850 text-gray-400 hover:text-white'
            }`}
          >
            Promo Vouchers
          </button>
        </div>

        {/* ======================================= */}
        {/* TAB 1: OVERVIEW ANALYTICS */}
        {/* ======================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 select-none">
            {/* Stat indicators card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-950/60 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">Coordinated Slots</span>
                  <span className="text-3xl font-serif font-bold text-white">{totalMyEvents}</span>
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-xl">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-950/60 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">Seats reserved</span>
                  <span className="text-3xl font-serif font-bold text-accent">{totalSeatsSold}</span>
                </div>
                <div className="bg-accent/10 text-accent p-3 rounded-xl">
                  <Ticket className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-950/60 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">Gross Collections</span>
                  <span className="text-3xl font-serif font-bold text-pink-400">₹{totalVolumeIncome}</span>
                </div>
                <div className="bg-pink-500/10 text-pink-400 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-950/60 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-[10px] uppercase font-bold block mb-1">Attendee Checked In</span>
                  <span className="text-3xl font-serif font-bold text-[#F59E0B]">{totalCheckedIn} / {totalSeatsSold}</span>
                </div>
                <div className="bg-yellow-500/10 text-gold p-3 rounded-xl">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Recharts Analytics graphs line */}
            <div className={`p-6 rounded-3xl border ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-850'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Daily Admission Velocities</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Simulators chronological check-in curves</p>
                </div>
                <span className="text-xs text-primary font-bold">Updated Live</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#222', fontSize: 11 }} />
                    <Line type="monotone" dataKey="registrations" stroke="#EC4899" strokeWidth={3} dot={{ fill: '#EC4899', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PLANNERS NOTIFICATION CHATTERS FEED */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 text-left">
                <h4 className="font-serif text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary animate-bounce" />
                  Upcoming Gates Reminders
                </h4>
                
                <div className="space-y-3 font-sans text-xs text-gray-400 leading-relaxed">
                  <p className="border-b border-zinc-900 pb-2.5">
                    ⏳ <b className="text-white">JW Marriott Wedding Sets Setup:</b> Commences in 22 days. Direct local audio sub-vendors to check rig trusses sizes.
                  </p>
                  <p className="border-b border-zinc-900 pb-2.5">
                    📢 <b className="text-white">AI Innovation Expo:</b> Reaches 85% tickets capacity! Proactively spawn 50 extra VIP lounges slots.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 text-left">
                <h4 className="font-serif text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-accent" />
                  Advertising Promotion Campaign
                </h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Escalate sales by broadcasting digital catalogs onto Facebook and WhatsApp channels. Download generated flyer designs.
                </p>
                <button
                  type="button"
                  onClick={() => showToast('Generated catalog flyers downloaded safely in sandbox!', 'success')}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-sans text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg"
                >
                  Retrieve flyers package
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: MY EVENTS GRID LIST */}
        {/* ======================================= */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-white select-none text-left">Your Created Productions List</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {myEvents.map((evt) => {
                const tickets = evt.tickets || [];
                const totalCap = tickets.reduce((acc, t) => acc + t.quantity, 0);
                const soldCap = tickets.reduce((acc, t) => acc + t.sold, 0);
                const vacancy = totalCap - soldCap;

                return (
                  <div key={evt._id} className="border border-zinc-850 rounded-2xl bg-zinc-950 overflow-hidden flex flex-col justify-between text-left group">
                    <div className="h-40 relative select-none">
                      <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/45" />

                      <div className="absolute top-3 left-3 bg-primary text-white text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold">
                        {evt.category}
                      </div>

                      <button
                        onClick={() => {
                          if (window.confirm('Delete event permanently and refund ticket bookings?')) {
                            deleteEvent(evt._id);
                          }
                        }}
                        className="absolute top-3 right-3 p-2 bg-red-500/20 text-red-400 hover:bg-red-500 rounded-full hover:text-white transition-all"
                        title="Cancel/Void Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="absolute bottom-3 left-3 text-xs font-bold text-white uppercase font-sans">
                        {evt.type} Mode
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                          {evt.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-mono mb-3">{evt.startDate} ({evt.startTime} IST)</p>
                        
                        {/* Progress Capacity bar */}
                        <div className="space-y-1 select-none">
                          <div className="flex justify-between text-[10px] text-gray-400 font-sans">
                            <span>Tickets Sold Volume:</span>
                            <span className="font-bold text-white">{soldCap} / {totalCap} ({Math.round(soldCap/totalCap * 100)}%)</span>
                          </div>
                          <div className="w-full bg-zinc-90 w-full bg-zinc-900 rounded-full h-1">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${Math.round(soldCap/totalCap * 100)}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 select-none border-t border-zinc-900 pt-4">
                        <button
                          onClick={() => {
                            setCheckInSearch(evt.title);
                            setActiveTab('attendance');
                          }}
                          className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-primary text-white text-[10px] font-bold py-2 rounded-lg text-center font-sans uppercase tracking-wider"
                        >
                          Check-In Gates
                        </button>
                        
                        <Link
                          to={`/events/${evt._id}`}
                          className="flex-1 bg-zinc-850 hover:bg-zinc-800 text-white text-[10px] font-bold py-2 rounded-lg text-center font-sans uppercase tracking-wider flex items-center justify-center gap-1 border border-zinc-80"
                        >
                          Details Page
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: CREATE EVENT STEP WIZARD FORM */}
        {/* ======================================= */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto space-y-8 text-left select-text">
            
            {/* PROGRESS SPARK STEPS INDICATOR */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 mb-4 select-none flex justify-between text-xs text-gray-400">
              <span className={wizardStep >= 1 ? 'text-primary font-bold font-serif' : ''}>1. Core Info</span>
              <span className={wizardStep >= 2 ? 'text-accent font-bold font-serif' : ''}>2. Ticket Classes</span>
              <span className={wizardStep >= 3 ? 'text-gold font-bold font-serif' : ''}>3. Hosts & Agenda</span>
              <span className={wizardStep >= 4 ? 'text-green-400 font-bold font-serif' : ''}>4. Review & Publish</span>
            </div>

            {/* STEP 1: KEY TEXT DETAILS */}
            {wizardStep === 1 && (
              <div className="p-6 sm:p-8 rounded-3xl border border-zinc-850 bg-zinc-950 space-y-5 font-sans text-xs">
                <h3 className="font-serif text-xl font-bold text-white pb-3 border-b border-zinc-900">Step 1: Core Identification</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">COMPELLING EVENT TITLE</label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Sufi Night: Pune Heritage Concert Suite"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary/50 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">LONG DESCRIPTION BIO</label>
                    <textarea
                      rows={5}
                      placeholder="Convey complete highlights, agenda, inclusions, dinner models..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary/50 text-white leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">CATEGORY</label>
                      <select
                        value={newEvent.category}
                        onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg p-2 focus:outline-none"
                      >
                        {['Wedding', 'Corporate', 'Birthday', 'Concert', 'Conference', 'Exhibition', 'Sports', 'Workshop'].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">FORMAT STYLE</label>
                      <select
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-lg p-2 focus:outline-none"
                      >
                        <option value="offline">Offline / At venue</option>
                        <option value="online">Online / Virtual</option>
                        <option value="hybrid">Hybrid mix</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">COVER IMAGE URL</label>
                      <input
                        type="text"
                        value={newEvent.coverImage}
                        onChange={(e) => setNewEvent({ ...newEvent, coverImage: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">START DATE</label>
                      <input
                        type="date"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">END DATE</label>
                      <input
                        type="date"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">START HOUR (IST)</label>
                      <input
                        type="time"
                        value={newEvent.startTime}
                        onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">END HOUR (IST)</label>
                      <input
                        type="time"
                        value={newEvent.endTime}
                        onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {newEvent.type !== 'online' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">VENUE/BUILDING NAME</label>
                        <input
                          type="text"
                          value={newEvent.venue.name}
                          onChange={(e) => setNewEvent({ ...newEvent, venue: { ...newEvent.venue, name: e.target.value } })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">CITY</label>
                        <input
                          type="text"
                          value={newEvent.venue.city}
                          onChange={(e) => setNewEvent({ ...newEvent, venue: { ...newEvent.venue, city: e.target.value } })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">FULL VENUE ADDRESS DESCRIPTION</label>
                        <input
                          type="text"
                          value={newEvent.venue.address}
                          onChange={(e) => setNewEvent({ ...newEvent, venue: { ...newEvent.venue, address: e.target.value } })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-900 flex justify-end">
                  <button
                    type="button"
                    onClick={handleStepNext}
                    className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider font-sans text-[11px]"
                  >
                    Ticket Setup →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: MULTI SEAT CLASSES SETUP */}
            {wizardStep === 2 && (
              <div className="p-6 sm:p-8 rounded-3xl border border-zinc-850 bg-zinc-950 space-y-6 font-sans text-xs">
                <h3 className="font-serif text-xl font-bold text-white pb-3 border-b border-zinc-900">Step 2: Ticket Classes & Capacities</h3>
                
                <p className="text-[10px] text-gray-400 leading-normal">
                  Define multiple booking tiers. Setting price ₹0 automatically flags tickets as <b className="text-primary font-bold">FREE Passes</b> for entry.
                </p>

                <div className="space-y-4">
                  {ticketTiers.map((tier, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end bg-zinc-900/40 p-4 border border-zinc-900 rounded-xl">
                      <div className="flex-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase mb-1">Pass Class Name</label>
                        <input
                          type="text"
                          value={tier.type}
                          onChange={(e) => handleSeatCapacityChange(idx, 'type', e.target.value)}
                          placeholder="e.g. VIP Frontdesk"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white font-mono"
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => handleSeatCapacityChange(idx, 'price', parseInt(e.target.value) || 0)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white font-mono text-center"
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase mb-1">Max Quota Qty</label>
                        <input
                          type="number"
                          value={tier.quantity}
                          onChange={(e) => handleSeatCapacityChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white font-mono text-center"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase mb-1">Short Perks description</label>
                        <input
                          type="text"
                          value={tier.description || ''}
                          onChange={(e) => handleSeatCapacityChange(idx, 'description', e.target.value)}
                          placeholder="General seating, or front stage VIP"
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white"
                        />
                      </div>

                      {ticketTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketTierRow(idx)}
                          className="p-2 mb-0.5 bg-red-950/40 hover:bg-red-500 text-red-400 hover:text-white rounded"
                        >
                          X
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addTicketTierRow}
                    className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add seat tier
                  </button>
                </div>

                <div className="pt-6 border-t border-zinc-900 flex justify-between select-none">
                  <button
                    type="button"
                    onClick={handleStepPrev}
                    className="bg-zinc-900 border border-zinc-800 text-white py-2 px-5 rounded-lg text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStepNext}
                    className="bg-primary hover:opacity-95 text-white font-bold py-2 px-5 rounded-lg uppercase tracking-wider text-[11px]"
                  >
                    Hosts Setup →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SPEAKERS AND TIMELINE FAQ SCHEDULE */}
            {wizardStep === 3 && (
              <div className="p-6 sm:p-8 rounded-3xl border border-zinc-850 bg-zinc-950 space-y-6 font-sans text-xs text-left">
                <h3 className="font-serif text-xl font-bold text-white pb-3 border-b border-zinc-900">Step 3: Host Profiles & Agenda</h3>
                
                <div>
                  <h4 className="font-serif font-bold text-sm text-pink-400 mb-3 uppercase tracking-wider">Host & Speakers (Grid)</h4>
                  <div className="bg-zinc-900/40 p-4 border border-zinc-905 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] text-gray-500 font-bold mb-1">Speaker Name</label>
                        <input
                          type="text"
                          value={newEvent.speakers[0].name}
                          onChange={(e) => {
                            const updated = [...newEvent.speakers];
                            updated[0].name = e.target.value;
                            setNewEvent({ ...newEvent, speakers: updated });
                          }}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-gray-500 font-bold mb-1">Company/Title Label</label>
                        <input
                          type="text"
                          value={newEvent.speakers[0].title}
                          onChange={(e) => {
                            const updated = [...newEvent.speakers];
                            updated[0].title = e.target.value;
                            setNewEvent({ ...newEvent, speakers: updated });
                          }}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-bold mb-1">Short Professional Bio</label>
                      <input
                        type="text"
                        value={newEvent.speakers[0].bio}
                        onChange={(e) => {
                          const updated = [...newEvent.speakers];
                          updated[0].bio = e.target.value;
                          setNewEvent({ ...newEvent, speakers: updated });
                        }}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-sm text-accent mb-3 uppercase tracking-wider">Initial Agenda Schedule</h4>
                  <div className="bg-zinc-900/40 p-4 border border-zinc-905 rounded-xl grid grid-cols-3 gap-3">
                    <div className="w-24">
                      <label className="block text-[9px] text-gray-500 font-bold mb-1">Time (IST)</label>
                      <input
                        type="text"
                        value={newEvent.schedule[0].time}
                        onChange={(e) => {
                          const updated = [...newEvent.schedule];
                          updated[0].time = e.target.value;
                          setNewEvent({ ...newEvent, schedule: updated });
                        }}
                        placeholder="e.g. 09:30 AM"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white font-mono text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] text-gray-500 font-bold mb-1">Timeline Title</label>
                      <input
                        type="text"
                        value={newEvent.schedule[0].title}
                        onChange={(e) => {
                          const updated = [...newEvent.schedule];
                          updated[0].title = e.target.value;
                          setNewEvent({ ...newEvent, schedule: updated });
                        }}
                        placeholder="Keynote speech"
                        className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900 flex justify-between select-none">
                  <button
                    type="button"
                    onClick={handleStepPrev}
                    className="bg-zinc-900 border border-zinc-805 text-white py-2 px-5 rounded-lg text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStepNext}
                    className="bg-primary hover:opacity-95 text-white font-bold py-2 px-5 rounded-lg uppercase tracking-wider text-[11px]"
                  >
                    Final Review & Publish →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PREVIEW PUBLISH */}
            {wizardStep === 4 && (
              <div className="p-6 sm:p-8 rounded-3xl border border-zinc-850 bg-zinc-950 space-y-6 font-sans text-xs text-left">
                <h3 className="font-serif text-xl font-bold text-white pb-3 border-b border-zinc-900">Step 4: Final Verification</h3>
                
                <div className="border border-zinc-900 p-4 rounded-xl bg-zinc-900/10 space-y-3">
                  <div className="text-xs text-gray-500">You are about to launch:</div>
                  <h4 className="font-serif font-bold text-xl text-primary">{newEvent.title}</h4>
                  <p className="text-[11px] text-gray-400 font-mono">Date: {newEvent.startDate} ({newEvent.startTime} IST)</p>
                  <p className="text-xs text-gray-300 leading-relaxed italic">"{newEvent.description}"</p>
                  
                  <div className="pt-3 border-t border-zinc-850 text-[10px] text-gray-400">
                    <b className="text-white uppercase font-sans font-bold">Configured Tiers:</b>
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                      {ticketTiers.map((t, i) => (
                        <li key={i}>{t.type}: ₹{t.price} ({t.quantity} seats limit)</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-900 flex justify-between select-none">
                  <button
                    type="button"
                    onClick={handleStepPrev}
                    className="bg-zinc-900 border border-zinc-800 text-white py-2 px-5 rounded-lg text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePublishEvent}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold py-2.5 px-6 rounded-lg uppercase tracking-widest text-[11px] shadow-xl shadow-primary/25"
                  >
                    Deploy Event Live
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: GATES CHECK-IN SCANNERS PANEL */}
        {/* ======================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 select-none text-left">
            <h2 className="font-serif text-2xl font-bold text-white mb-2">Gate Check-In Admission scanner</h2>
            <p className="text-xs text-gray-400">Search by event name, buyer name or ticket code reference. Toggle attendees check-in status synchronously.</p>

            <div className="relative max-w-md shrink-0">
              <input
                type="text"
                placeholder="Search ticket code or attendees names..."
                value={checkInSearch}
                onChange={(e) => setCheckInSearch(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-3 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-primary/50"
              />
              {checkInSearch && (
                <button
                  onClick={() => setCheckInSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 hover:text-white uppercase font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="border border-zinc-850 rounded-2xl bg-zinc-950 overflow-hidden">
              <table className="w-full text-left font-sans text-xs text-gray-400 leading-normal border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-gray-400 tracking-wider font-bold text-[10px] uppercase border-b border-zinc-850">
                    <th className="p-4">Attendee / Ticket Code</th>
                    <th className="p-4">Target Production</th>
                    <th className="p-4">Booked Perks</th>
                    <th className="p-4">Paid Total</th>
                    <th className="p-4 text-center">Gates Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 italic">No registrations match search term.</td>
                    </tr>
                  ) : (
                    filteredAttendees.map((reg) => (
                      <tr key={reg._id} className="hover:bg-zinc-900/25 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-white block text-xs">{reg.attendees[0]?.name || 'Amit Patel'}</span>
                          <span className="text-[10px] text-gray-500 block">{reg.attendees[0]?.email || 'attendee@test.in'}</span>
                          <span className="text-[9px] font-mono text-primary block mt-1 font-bold">CODE: {reg._id}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-white block font-medium line-clamp-1">{reg.eventTitle}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-gray-300 font-bold">{reg.tickets[0]?.quantity}x {reg.tickets[0]?.ticketType}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-[#F2994A]">₹{reg.totalAmount}</span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleCheckIn(reg._id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              reg.isCheckedIn 
                                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-gray-300'
                            }`}
                          >
                            {reg.isCheckedIn ? 'Checked In ✓' : 'Mark Entry'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 5: PROMO CODES MANAGER */}
        {/* ======================================= */}
        {activeTab === 'promos' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left select-none">
            
            {/* LEFT COL: CREATION FORM */}
            <div className={`p-6 rounded-2xl border ${
              isLightMode ? 'bg-white border-slate-205 shadow-sm' : 'bg-zinc-950 border-zinc-850'
            }`}>
              <h3 className="font-serif text-lg font-bold text-white mb-4 pb-2 border-b border-zinc-900">
                Setup promo coupon
              </h3>

              <form onSubmit={handleCreatePromo} className="space-y-4 font-sans text-xs text-left">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">COUPON STRING CODE</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPARK50"
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-zinc-90 w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-white uppercase focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Discount Style</label>
                    <select
                      value={promoForm.discountType}
                      onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Value rate</label>
                    <input
                      type="number"
                      required
                      value={promoForm.discountValue}
                      onChange={(e) => setPromoForm({ ...promoForm, discountValue: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded p-2 text-white text-center font-mono"
                    />
                  </div>
                </div>

                <div className="text-[9px] text-gray-500 leading-normal select-none pt-1">
                  💡 After creating, buyers can key in this coupon on checkout pages to discount ticket totals.
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
                >
                  Create promo coupon
                </button>
              </form>
            </div>

            {/* RIGHT 2-COLS: ACTIVE COUPONS LEDGER LIST */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-serif text-xl font-bold text-white mb-4">Active Platform Vouchers</h3>

              <div className="border border-zinc-850 rounded-xl bg-zinc-950 overflow-hidden">
                <table className="w-full text-left font-sans text-xs text-gray-500 leading-normal">
                  <thead>
                    <tr className="bg-zinc-900 font-bold text-[10px] uppercase text-gray-400 border-b border-zinc-850">
                      <th className="p-4">Coupon Code</th>
                      <th className="p-4">Discount Type</th>
                      <th className="p-4">Value rate</th>
                      <th className="p-4">Active status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-gray-400">
                    {promoCodes.map((pm) => (
                      <tr key={pm._id} className="hover:bg-zinc-900/10">
                        <td className="p-4 font-mono font-bold text-white flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-primary" />
                          <span>{pm.code}</span>
                        </td>
                        <td className="p-4 font-medium capitalize">{pm.discountType}</td>
                        <td className="p-4 font-mono text-white font-semibold">
                          {pm.discountType === 'percentage' ? `${pm.discountValue}%` : `₹${pm.discountValue}`}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-500/15 text-green-400">
                            Live Valid
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
