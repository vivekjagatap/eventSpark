import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEventSpark } from '../context/EventSparkContext';
import { Event, User } from '../types';
import { Calendar, MapPin, Star, Award, ShieldCheck, Mail, Phone, Users, Sparkles, MessageSquare } from 'lucide-react';

export const OrganizerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrganizerStats, isLightMode, showToast } = useEventSpark();
  
  const [profileData, setProfileData] = useState<{ organizer: User; events: Event[]; stats: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactsText, setContactsText] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getOrganizerStats(id);
      if (data) {
        setProfileData(data);
      }
      setLoading(false);
    };
    loadProfile();
  }, [id]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactsText.trim()) return;
    setIsSubmittingContact(true);
    setTimeout(() => {
      showToast('Inquiry request dispatched safely! The organizer will respond shortly.', 'success');
      setContactsText('');
      setIsSubmittingContact(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808]">
        <h2 className="text-xl font-bold font-serif text-white mb-2">Organizer Bio Profile Not Found</h2>
        <Link to="/events" className="text-primary hover:underline">Browse other events</Link>
      </div>
    );
  }

  const { organizer, events, stats } = profileData;

  return (
    <div className={`min-h-screen py-16 transition-colors duration-200 ${
      isLightMode ? 'bg-slate-50 text-gray-900' : 'bg-[#080808] text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* UPPER MAIN HEADER CARD PROFILE */}
        <div className={`p-8 sm:p-10 rounded-3xl border mb-12 relative overflow-hidden select-text ${
          isLightMode ? 'bg-white border-slate-205 shadow-sm' : 'bg-zinc-950 border-zinc-850'
        }`}>
          {/* Subtle decoration background overlay */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative z-10">
            {/* AVATAR BIO */}
            <img 
              src={organizer.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320"} 
              alt={organizer.name} 
              className="w-32 h-32 rounded-2xl object-cover border-4 border-accent/20 shadow-2xl shrink-0"
            />

            <div className="space-y-4 flex-1">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#F59E0B] bg-gradient-to-tr from-yellow-500/10 to-yellow-500/5 px-2.5 py-1 rounded border border-yellow-500/10">
                  ⭐⭐⭐ Verified Professional Agency ⭐⭐⭐
                </span>
                
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-3 mb-1">
                  {organizer.name}
                </h1>
                
                <p className="text-xs text-gray-400 font-sans tracking-wide uppercase">
                  President, <b className="text-primary">{organizer.company || 'Royal Canvas Planners'}</b>
                </p>
              </div>

              <p className="text-sm text-gray-400 max-w-2xl leading-relaxed font-sans">
                {organizer.bio || 'Premier Wedding and Corporate Planner across Pune and Mumbai. Coordinating bespoke lighting stages, delegate logistics registers, and open-air concert lines.'}
              </p>

              {/* STATS RATIO SUMMARY TICKERS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-md pt-2 select-none">
                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 text-center sm:text-left">
                  <span className="text-gray-500 text-[10px] uppercase block mb-0.5">Organized Slots</span>
                  <span className="font-bold text-lg text-white">{stats.organizedCount} Productions</span>
                </div>

                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 text-center sm:text-left">
                  <span className="text-gray-500 text-[10px] uppercase block mb-0.5">Rating Ratio</span>
                  <span className="font-bold text-lg text-[#F59E0B] flex items-center gap-1 justify-center sm:justify-start">
                    ★ {stats.rating}
                  </span>
                </div>

                <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 text-center sm:text-left col-span-2 sm:col-span-1">
                  <span className="text-gray-500 text-[10px] uppercase block mb-0.5">Attendees Served</span>
                  <span className="font-bold text-lg text-accent">{stats.attendeesServed} checked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER COLUMN: GRID CONFIGS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 2-COLS: ORGANIZER'S EVENTS LIST CATALOG */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-white select-none text-left flex items-center gap-2 mb-6">
              <Calendar className="w-6 h-6 text-primary" />
              Active Productions Catalog
            </h2>

            {events.length === 0 ? (
              <p className="text-gray-500 italic">No events posted by this organizer yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {events.map((evt) => {
                  const tickets = evt.tickets || [];
                  const cheapest = tickets.length > 0 ? Math.min(...tickets.map(t => t.price)) : 0;
                  return (
                    <div 
                      key={evt._id}
                      className={`rounded-2xl border overflow-hidden flex flex-col justify-between group hover:-translate-y-1 hover:shadow-2xl transition-all ${
                        isLightMode ? 'bg-white border-slate-200 text-gray-900' : 'bg-zinc-950 border-zinc-850'
                      }`}
                    >
                      <div className="h-40 relative shrink-0 select-none">
                        <img 
                          src={evt.coverImage} 
                          alt={evt.title} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                        />
                        <span className="absolute bottom-3 right-3 bg-primary text-white text-[10px] font-bold py-0.5 px-2 rounded">
                          {evt.category}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between text-left">
                        <div>
                          <span className="text-[10px] text-gray-500 font-mono block mb-1">{evt.startDate} | {evt.venue.city}</span>
                          <h3 className="font-serif text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                            {evt.title}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-sans mb-4">
                            {evt.description}
                          </p>
                        </div>

                        <div className="border-t border-zinc-900 pt-4 mt-2 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-gray-500 block">Class starting</span>
                            <span className="font-bold text-sm text-pink-500">
                              {cheapest === 0 ? 'FREE' : `₹${cheapest}`}
                            </span>
                          </div>

                          <Link
                            to={`/events/${evt._id}`}
                            className="bg-zinc-900 hover:bg-primary border border-zinc-805 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COL: DIRECT INQUIRY CONTACT FORM */}
          <aside className="space-y-6">
            
            <div className={`p-6 rounded-2xl border select-none ${
              isLightMode ? 'bg-white border-slate-205' : 'bg-zinc-950 border-zinc-850'
            }`}>
              <h3 className="font-serif text-lg font-bold text-white mb-4 border-b border-zinc-900 pb-2">
                Secure Custom RFP Inquiry
              </h3>
              
              <p className="text-[11px] text-gray-400 leading-normal mb-6 font-sans text-left">
                Directly propose layouts, custom budgets, dates or corporate RFP requirements to {organizer.name}. Secure bespoke discounts.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-4 font-sans text-xs text-left">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter name"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary/50 text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Your Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. contact@domain.in"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-primary/50 text-white font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Inquiry / Requirements</label>
                  <textarea
                    required
                    rows={4}
                    value={contactsText}
                    onChange={(e) => setContactsText(e.target.value)}
                    placeholder="Provide desired date, Pune/Mumbai venue, attendee volume bounds..."
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary/50 text-white font-sans leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white py-3 rounded-xl font-sans tracking-wide text-xs font-bold uppercase shadow-xl transition-all"
                >
                  {isSubmittingContact ? 'Transmitting request...' : 'Transmit inquiry proposal'}
                </button>
              </form>
            </div>

            {/* SEED HISTORIC TESTIMONIAL PANEL FEED */}
            <div className={`p-6 rounded-2xl border ${
              isLightMode ? 'bg-white' : 'bg-zinc-950 border-zinc-850'
            }`}>
              <h3 className="font-serif text-sm font-bold text-white mb-4 flex items-center gap-1.5 pb-2 border-b border-zinc-900 select-none uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-primary" />
                Attendee reviews ({stats.organizedCount + 8} rows)
              </h3>

              <div className="space-y-4 select-text font-sans text-xs">
                <div className="border-b border-zinc-900/60 pb-3 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-xs">Sagar M.</span>
                    <span className="text-[#F59E0B] font-bold">★★★★★</span>
                  </div>
                  <p className="text-gray-400 italic font-light tracking-wide leading-relaxed">
                    "Rohan Sharma coordinates beautiful sets. The laser lights mapping and valet checkouts at JW Marriott Pun summit were world class!"
                  </p>
                </div>

                <div className="pb-1 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-xs">Kavita Deshmukh</span>
                    <span className="text-[#F59E0B] font-bold">★★★★★</span>
                  </div>
                  <p className="text-gray-400 italic font-light tracking-wide leading-relaxed">
                    "Very responsive, very clean work, absolute design craft with wedding sets! Highly recommended organizers."
                  </p>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
};
