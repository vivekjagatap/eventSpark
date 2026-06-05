import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEventSpark } from '../context/EventSparkContext';
import { Sparkles, Calendar, Users, Award, ShieldCheck, MapPin, ArrowRight, Play, Music, Gift, Heart, HelpCircle } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { events, isLightMode, switchRole } = useEventSpark();
  const navigate = useNavigate();

  // Filter 4 featured events for the preview cards
  const featuredEvents = events.filter(e => e.isFeatured).slice(0, 4);

  const categories = [
    { name: 'Wedding', icon: Heart, count: 48, desc: 'Royal luxury rituals' },
    { name: 'Corporate', icon: ShieldCheck, count: 125, desc: 'Summits & conferences' },
    { name: 'Birthday', icon: Gift, count: 64, desc: 'Theme party suites' },
    { name: 'Concert', icon: Music, iconColor: 'text-primary', count: 82, desc: 'Open-air EDM & Sufi' },
    { name: 'Conference', icon: Award, count: 94, desc: 'National summits' },
    { name: 'Exhibition', icon: Calendar, count: 37, desc: 'Food & art trade expos' },
    { name: 'Sports', icon: Play, count: 22, desc: 'Turfs meetings' },
    { name: 'Workshop', icon: Sparkles, count: 110, desc: 'Bootcamps & photography' }
  ];

  const handleCategoryClick = (catName: string) => {
    navigate(`/events?category=${encodeURIComponent(catName)}`);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isLightMode ? 'bg-slate-50 text-gray-900' : 'bg-[#080808] text-white'
    }`}>
      {/* 1. HERO SECTION WITH SPARKLING DOT BACKDROP */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 px-4">
        {/* Glowing atmospheric circles */}
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] bg-accent/20 rounded-full blur-[120px]" />
        
        {/* Topographic radar visual backdrop lines */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(#EC4899 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-6 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover India's Elite Event Infrastructure</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif font-bold tracking-tight mb-6 leading-[1.05]">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">Create. </span>
            <span className="bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent">Celebrate. </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-200 via-purple-300 to-pink-200 bg-clip-text text-transparent">Remember.</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-xl max-w-2xl font-sans font-light tracking-wide leading-relaxed mb-10">
            EventSpark is India's premium design ecosystem. Empowering event planners, wedding registrars, and corporate authorities across 10+ major cities to scale and execute luxurious productions seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
            <Link
              to="/events"
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-sans font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-xl flex items-center justify-center gap-2 group shadow-xl shadow-primary/20"
            >
              Browse Events
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button
              onClick={() => {
                switchRole('organizer');
                navigate('/organizer');
              }}
              className="w-full sm:w-auto border border-gray-700 bg-white/5 hover:bg-white/10 text-white font-sans font-bold text-sm tracking-widest uppercase px-8 py-4 rounded-xl flex items-center justify-center gap-2"
            >
              Organize an Event
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className={`border-y shrink-0 py-8 ${
        isLightMode ? 'bg-white border-slate-200 text-gray-800' : 'bg-black/40 border-zinc-900 text-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-primary mb-1">500+</div>
              <p className="text-xs sm:text-sm text-gray-400 font-sans tracking-widest uppercase font-medium">Events Organized</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-accent mb-1">50,000+</div>
              <p className="text-xs sm:text-sm text-gray-400 font-sans tracking-widest uppercase font-medium">Tickets Issued</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gold mb-1">200+</div>
              <p className="text-xs sm:text-sm text-gray-400 font-sans tracking-widest uppercase font-medium">Luxury Planners</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-indigo-400 mb-1">10+</div>
              <p className="text-xs sm:text-sm text-gray-400 font-sans tracking-widest uppercase font-medium">Metros & Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-wide mb-4">
            Curated Event Realms
          </h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm">
            Filters our platform tailored specifically to your project requirements.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => handleCategoryClick(cat.name)}
                className={`p-6 rounded-2xl text-left border cursor-pointer hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden ${
                  isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-850'
                }`}
              >
                {/* Accent glow on hover */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="bg-primary/10 text-primary p-3 rounded-xl w-fit mb-4">
                  <IconComponent className="w-5 h-5" />
                </div>
                
                <h3 className="font-serif text-lg sm:text-xl font-bold tracking-wide mb-1 transition-colors group-hover:text-primary">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-400 mb-2 leading-relaxed font-sans">{cat.desc}</p>
                
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#F59E0B] block mt-auto">
                  {cat.count} verified events
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED EVENTS SECTION */}
      <section className={`py-24 border-y ${
        isLightMode ? 'bg-slate-100 border-slate-250' : 'bg-zinc-950/60 border-zinc-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16">
            <div>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-wide mb-4 text-white">
                Featured Experiences
              </h2>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                Pre-selected verified luxury productions trending this month across Pune and Mumbai.
              </p>
            </div>
            
            <Link
              to="/events"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors"
            >
              Browse all {events.length} events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {featuredEvents.map((evt) => {
              const tickets = evt.tickets || [];
              const cheapest = tickets.length > 0 ? Math.min(...tickets.map(t => t.price)) : 0;
              const available = tickets.reduce((acc, t) => acc + (t.quantity - t.sold), 0);
              return (
                <div
                  key={evt._id}
                  className={`rounded-2xl overflow-hidden border flex flex-col group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 transition-all ${
                    isLightMode ? 'bg-white border-slate-200' : 'bg-black/40 border-zinc-850'
                  }`}
                >
                  <div className="relative h-48 w-full overflow-hidden shrink-0">
                    <img
                      src={evt.coverImage}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-gold text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border border-gold/20 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 animate-spin" />
                      Featured
                    </div>

                    <div className="absolute bottom-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {evt.category}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-2 font-mono">
                        <MapPin className="w-3 h-3 text-accent shrink-0" />
                        <span>{evt.venue.city}</span>
                        <span className="text-gray-600">|</span>
                        <span>{new Date(evt.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      
                      <h3 className="font-serif text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {evt.title}
                      </h3>
                      
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                        {evt.description}
                      </p>
                    </div>

                    <div>
                      {/* Urgency Badge */}
                      {available <= 180 && available > 0 && (
                        <div className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-md w-fit mb-3">
                          Only {available} slots left!
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Pricing</span>
                          <span className="font-bold text-sm text-pink-400">
                            {cheapest === 0 ? 'FREE' : `₹${cheapest}`}
                          </span>
                        </div>

                        <Link
                          to={`/events/${evt._id}`}
                          className="bg-zinc-900 border border-zinc-800 hover:bg-primary hover:border-primary text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (Attendee vs Organizer) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold mb-4">
            Dual Success Pathways
          </h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            Tailor-made pipelines designed whether you are checking in at the door as an attendee or organizing the stage behind-the-scenes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Pathway A: Attendees */}
          <div className={`p-8 rounded-2xl border ${
            isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-850'
          }`}>
            <h3 className="text-2xl font-serif font-bold text-primary mb-6 flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Users className="w-6 h-6" />
              For Attendees & Guest Lists
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                <div>
                  <h4 className="font-serif font-bold text-base mb-1">Browse Elite Catalogs</h4>
                  <p className="text-xs text-gray-400">Apply cities, dates, or prices filters on our high-speed explore page.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                <div>
                  <h4 className="font-serif font-bold text-base mb-1">Lock Tickets securely</h4>
                  <p className="text-xs text-gray-400">Select early, regular or business tickets and validate instant 20% discount codes.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                <div>
                  <h4 className="font-serif font-bold text-base mb-1">Instant QR Passes</h4>
                  <p className="text-xs text-gray-400">Download high-definition ticket cards matching digital check-in passes.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pathway B: Planners */}
          <div className={`p-8 rounded-2xl border ${
            isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-850'
          }`}>
            <h3 className="text-2xl font-serif font-bold text-accent mb-6 flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Award className="w-6 h-6" />
              For Event Planners & Venues
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-accent/10 text-accent w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                <div>
                  <h4 className="font-serif font-bold text-base mb-1">Draft Step Wizards</h4>
                  <p className="text-xs text-gray-400">Assemble schedules, speakers grids, and customizable ticket types in minutes.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-accent/10 text-accent w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                <div>
                  <h4 className="font-serif font-bold text-base mb-1">Track Live Analytics</h4>
                  <p className="text-xs text-gray-400">Monitor registration volumes, class income, and demographics with interactive Recharts.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-accent/10 text-accent w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                <div>
                  <h4 className="font-serif font-bold text-base mb-1">Gate Check-In Panels</h4>
                  <p className="text-xs text-gray-400">Process ticket entries synchronously using simulated live camera QR scanners.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SUCCESS STORIES TESTIMONIALS */}
      <section className={`py-24 border-y ${
        isLightMode ? 'bg-slate-100 border-slate-250' : 'bg-zinc-950/60 border-zinc-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold mb-4">Event Success Stories</h2>
            <p className="text-gray-400 max-w-sm mx-auto text-xs">Read how regional Indian firms scaled up utilizing our ticketing gates.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white' : 'bg-[#111]'}`}>
              <div className="text-gold mb-3 flex gap-0.5">★★★★★</div>
              <p className="text-xs text-gray-400 italic mb-6 leading-relaxed">
                "EventSpark changed the operational landscape of Siddhi Wedding Planners. Moving from old-fashioned Excel registers to synchronized digital slots enabled us to handle over 40 luxury themes last winter across Goa and Pune without a single double-booking error!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 shrink-0 font-bold text-xs flex items-center justify-center text-primary">SC</div>
                <div>
                  <span className="font-serif font-bold text-sm block">Sonia Chaturvedi</span>
                  <span className="text-[10px] text-gray-500">Founder, Royal Theme Weddings</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white' : 'bg-[#111]'}`}>
              <div className="text-gold mb-3 flex gap-0.5">★★★★★</div>
              <p className="text-xs text-gray-400 italic mb-6 leading-relaxed">
                "Checking in 1,200 financial technology pioneers at the Taj Lands End ballroom in Mumbai used to be a logistical bottleneck. Using EventSpark's simulated gate check-ins, we bypassed queues and saved over 3 hours during day-1 registrations."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 shrink-0 font-bold text-xs flex items-center justify-center text-accent">SM</div>
                <div>
                  <span className="font-serif font-bold text-sm block">Sagar Mehta</span>
                  <span className="text-[10px] text-gray-500">Lead, Fintech Bharat Hub</span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white' : 'bg-[#111]'}`}>
              <div className="text-gold mb-3 flex gap-0.5">★★★★★</div>
              <p className="text-xs text-gray-400 italic mb-6 leading-relaxed">
                "Selling out three consecutive comedy open-air shows across Pune used to occupy all our marketing assets. Integrating custom promo coupons like SPARK20 on booking pages escalated checkouts by 45% within three block days."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 shrink-0 font-bold text-xs flex items-center justify-center text-gold">JD</div>
                <div>
                  <span className="font-serif font-bold text-sm block">Jeet Deshmukh</span>
                  <span className="text-[10px] text-gray-500">Director, Laugh Out Loud Arena</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BECOME AN ORGANIZER BOTTOM HERO CTA */}
      <section className="relative py-24 overflow-hidden px-4">
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className={`max-w-4xl mx-auto rounded-3xl p-8 sm:p-16 text-center border relative z-10 ${
          isLightMode 
            ? 'bg-white/80 border-slate-200' 
            : 'bg-[#111]/80 border-zinc-850 shadow-2xl shadow-primary/5'
        }`}>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold mb-4 tracking-wide leading-tight">
            Ready to Monopolize Your Next Grand Venture?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-8 font-sans leading-relaxed">
            Register your venues or agency space as an organizer on EventSpark. Deploy tickets, inspect entries, and collect payouts under pre-vetted platform modules.
          </p>

          <button
            onClick={() => {
              switchRole('organizer');
              navigate('/organizer/create');
            }}
            className="bg-white hover:bg-white/90 text-[#080808] font-sans font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-xl shadow-lg transition-all"
          >
            Become an Organizer
          </button>
        </div>
      </section>
    </div>
  );
};
