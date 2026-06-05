import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEventSpark } from '../context/EventSparkContext';
import { Event, TicketType } from '../types';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2, CalendarPlus, ChevronDown, Check, Star, ShieldAlert } from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEventById, isLightMode, currentUser, showToast } = useEventSpark();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'schedule' | 'speakers' | 'venue' | 'faqs'>('about');
  
  // Ticketing Selection States
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);

  // Countdown timer hook calculations
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    let active = true;
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getEventById(id);
      if (active) {
        if (data) {
          setEvent(data);
          // Set standard starting ticket class selected
          if (data.tickets.length > 0) {
            setSelectedTicketType(data.tickets[0].type);
          }
        }
        setLoading(false);
      }
    };
    fetchDetail();
    return () => { active = false; };
  }, [id]);

  // Tick interval calculation loops
  useEffect(() => {
    if (!event) return;

    const interval = setInterval(() => {
      const targetDate = new Date(`${event.startDate}T${event.startTime}:00`).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] text-white px-4 text-center">
        <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-2xl font-serif font-bold mb-2">Event Registration Slot Not Found</h2>
        <p className="text-sm text-gray-400 mb-6">This list event may be empty or canceled.</p>
        <Link to="/events" className="bg-primary text-white font-semibold text-xs tracking-widest px-6 py-3 rounded-xl uppercase">
          Return to Events Catalog
        </Link>
      </div>
    );
  }

  const ticketsList = event.tickets || [];
  const activeTicketInfo = ticketsList.find(t => t.type === selectedTicketType);
  const remainingSeatsCount = activeTicketInfo ? (activeTicketInfo.quantity - activeTicketInfo.sold) : 0;
  const capacityPercent = activeTicketInfo ? Math.round((activeTicketInfo.sold / activeTicketInfo.quantity) * 100) : 0;

  // Add to Google Calendar simulation generator
  const getGoogleCalendarLink = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(`${event.venue.name}, ${event.venue.city}`);
    const dateFormatted = event.startDate.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}/${dateFormatted}&details=${details}&location=${location}`;
  };

  const handleShareOnWhatsApp = () => {
    const shareText = `Hey! Check out this amazing event on EventSpark: ${event.title} in ${event.venue.city} on ${event.startDate}! Book tickets at ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Event link copied to clipboard!', 'info');
  };

  const handleBookTicketsNavigation = () => {
    if (!activeTicketInfo) return;
    navigate(`/events/${event._id}/book`, {
      state: {
        selectedClass: selectedTicketType,
        quantity: quantity,
        price: activeTicketInfo.price
      }
    });
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-200 ${
      isLightMode ? 'bg-slate-50 text-gray-900' : 'bg-[#080808] text-white'
    }`}>
      
      {/* 1. HERO PHOTO BANNER SECTION */}
      <section className="relative h-[48vh] sm:h-[55vh] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={event.coverImage} 
            alt={event.title}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
          {/* Shimmer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />
        </div>

        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button 
            onClick={() => navigate('/events')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-xs font-bold border border-zinc-850 hover:bg-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-primary" />
            <span>Catalog</span>
          </button>
        </div>

        <div className="absolute bottom-6 left-4 sm:left-8 z-10 max-w-4xl right-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary text-white text-[10px] font-bold uppercase tracking-wider mb-3">
            <Star className="w-3 h-3 fill-current" />
            {event.category}
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-wide text-white leading-tight mb-4 drop-shadow-xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-gray-300 font-sans tracking-wide">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              {new Date(event.startDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-accent shrink-0" />
              {event.startTime} - {event.endTime} IST
            </span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              {event.venue.name}, {event.venue.city}
            </span>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC REAL-TIME COUNTDOWN SPLIT CONTAINER */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/5 to-gold/5 border-y border-zinc-900 overflow-hidden py-5 select-none shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="animate-pulse w-2.5 h-2.5 bg-green-500 rounded-full" />
            <span className="font-serif font-bold text-sm sm:text-base tracking-widest uppercase">
              Ticking countdown till slot start:
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 font-mono text-center">
            <div>
              <div className="text-xl sm:text-3xl font-bold text-primary">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest font-sans font-semibold">Days</div>
            </div>
            <div className="text-xl text-gray-600">:</div>
            <div>
              <div className="text-xl sm:text-3xl font-bold text-accent">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest font-sans font-semibold">Hours</div>
            </div>
            <div className="text-xl text-gray-600">:</div>
            <div>
              <div className="text-xl sm:text-3xl font-bold text-gold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest font-sans font-semibold">Mins</div>
            </div>
            <div className="text-xl text-gray-600">:</div>
            <div>
              <div className="text-xl sm:text-3xl font-bold text-red-400">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest font-sans font-semibold">Secs</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SUB CONTENTS CONTAINER AND SIDEBAR PANEL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: MULTI-TABS DESCRIPTION PANEL */}
        <div className="lg:col-span-2 space-y-8 h-fit select-text">
          <div className="border-b border-zinc-900 flex flex-wrap gap-4 select-none">
            {(['about', 'schedule', 'speakers', 'venue', 'faqs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-serif text-sm sm:text-base font-bold uppercase tracking-wider border-b-2 transition-colors relative focus:outline-none capitalize ${
                  activeTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="prose prose-invert max-w-none text-gray-300 font-sans text-xs sm:text-sm leading-relaxed tracking-wide">
            
            {/* ABOUT ACTIVE VIEW */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white mb-2">About The Experience</h3>
                  <p className="whitespace-pre-line leading-relaxed">{event.description}</p>
                </div>

                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900">
                  <h4 className="font-serif font-bold text-base text-primary mb-3">Highlights & Perks</h4>
                  <ul className="space-y-2 list-none p-0 m-0 text-gray-400">
                    <li className="flex gap-2 text-xs">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      Authentic production quality, curated directly by accredited organizers.
                    </li>
                    <li className="flex gap-2 text-xs">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      Catered food courts and verified sanitization measures.
                    </li>
                    <li className="flex gap-2 text-xs">
                      <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                      Instant PDF tickets and priority check-in gates.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* SCHEDULE ACTIVE VIEW */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white mb-4">Programme Timeline</h3>
                
                {event.schedule && event.schedule.length > 0 ? (
                  <div className="border-l border-zinc-800 ml-3 pl-6 space-y-8">
                    {event.schedule.map((item, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-[31px] top-1 bg-gradient-to-tr from-primary to-accent p-1 rounded-full text-white ring-4 ring-[#080808]">
                          <Clock className="w-2.5 h-2.5" />
                        </span>
                        
                        <div className="font-mono text-xs text-[#F59E0B] font-bold mb-1">{item.time}</div>
                        <h4 className="font-serif font-bold text-base text-white mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed font-sans">{item.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No schedules posted for this slot. Check again later.</p>
                )}
              </div>
            )}

            {/* SPEAKERS ACTIVE VIEW */}
            {activeTab === 'speakers' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white mb-4">Host and Guest Panelists</h3>
                
                {event.speakers && event.speakers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {event.speakers.map((sp, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-900 text-left">
                        <img 
                          src={sp.photo} 
                          alt={sp.name} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-accent/40 shrink-0"
                        />
                        <div>
                          <h4 className="font-serif font-bold text-base text-white mb-0.5">{sp.name}</h4>
                          <div className="text-[10px] text-pink-400 font-semibold mb-2">{sp.title}</div>
                          <p className="text-xs text-gray-400 font-sans line-clamp-2 leading-relaxed">{sp.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Hosts details not published yet.</p>
                )}
              </div>
            )}

            {/* VENUE ACTIVE VIEW */}
            {activeTab === 'venue' && (
              <div className="space-y-6">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white mb-2">Location & Transit Guides</h3>
                <p className="text-xs text-gray-400 mb-4 font-sans uppercase tracking-widest">{event.venue.city}, INDIA</p>
                
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-4 text-left">
                  <div className="font-sans font-bold text-white mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gold" />
                    {event.venue.name}
                  </div>
                  <p className="text-xs text-gray-400 font-sans leading-relaxed">{event.venue.address}</p>

                  <div className="rounded-xl overflow-hidden h-40 bg-zinc-900 flex items-center justify-center relative border border-zinc-800">
                    {/* Simulated small location box */}
                    <svg className="absolute w-40 h-40 opacity-30" viewBox="0 0 100 100">
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#8B5CF6" strokeWidth="0.5" />
                      <line x1="50" y1="0" x2="50" y2="100" stroke="#8B5CF6" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="10" fill="none" stroke="#EC4899" strokeWidth="1" />
                    </svg>
                    <div className="relative text-center p-3">
                      <div className="text-xs font-bold text-white mb-1">Interactive coordinates plotted</div>
                      <a 
                        href={event.venue.mapLink || 'https://google.com/maps'} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[10px] text-primary hover:underline"
                      >
                        Launch in Google Maps →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQS ACTIVE VIEW */}
            {activeTab === 'faqs' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>
                
                {event.faqs && event.faqs.length > 0 ? (
                  <div className="space-y-3">
                    {event.faqs.map((faq, i) => (
                      <div key={i} className="border border-zinc-950 rounded-xl overflow-hidden bg-zinc-950">
                        <button
                          onClick={() => setFaqOpenIdx(faqOpenIdx === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left font-serif font-bold text-xs sm:text-sm text-white hover:bg-zinc-900 transition-colors"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown className={`w-4 h-4 text-primary transition-transform ${faqOpenIdx === i ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {faqOpenIdx === i && (
                          <div className="p-4 pt-0 border-t border-zinc-900 text-xs text-gray-400 font-sans leading-relaxed">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border border-zinc-900 rounded-xl p-4 bg-zinc-950">
                      <span className="font-bold text-white block mb-1 text-xs">Are child discount slots available?</span>
                      <p className="text-xs text-gray-400">Yes, infants or kids below the age of 8 do not require separate entry tickets.</p>
                    </div>
                    <div className="border border-zinc-900 rounded-xl p-4 bg-zinc-950">
                      <span className="font-bold text-white block mb-1 text-xs">What is the cancellation refund model?</span>
                      <p className="text-xs text-gray-400">{event.refundPolicy}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* 4. RIGHT SIDEBAR COL: BUY TICKETS SLOT */}
        <aside className="space-y-6 select-none">
          
          <div className={`p-6 rounded-3xl border ${
            isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-850'
          }`}>
            <span className="text-[10px] text-gray-500 font-sans font-bold uppercase tracking-widest block mb-1">Secures Vacancy</span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white border-b border-zinc-900 pb-3 mb-4">
              Ticketing Desk
            </h3>

            {/* SELECTION GRID PER TICKET CLASS */}
            <div className="space-y-3 mb-6">
              {(event.tickets || []).map((t) => {
                const isSelected = selectedTicketType === t.type;
                const isSoldOut = t.sold >= t.quantity;
                return (
                  <button
                    key={t.type}
                    onClick={() => {
                      if (!isSoldOut) {
                        setSelectedTicketType(t.type);
                        setQuantity(1); // reset counter
                      }
                    }}
                    disabled={isSoldOut}
                    className={`w-full p-4 rounded-xl border text-left flex justify-between items-center transition-all ${
                      isSoldOut 
                        ? 'opacity-40 border-zinc-900 cursor-not-allowed bg-zinc-950/20' 
                        : isSelected 
                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                        : 'border-zinc-900 hover:border-zinc-700 bg-zinc-900/10'
                    }`}
                  >
                    <div>
                      <span className="block font-serif text-sm font-bold text-white mb-0.5">{t.type}</span>
                      <span className="text-[11px] text-gray-400 block line-clamp-1 font-sans">{t.description || 'Access to seat'}</span>
                      {isSoldOut && (
                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block mt-1">SOLD OUT</span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-pink-400 block">
                        {t.price === 0 ? 'FREE' : `₹${t.price}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* STEPPER MULTIPLICATION */}
            {activeTicketInfo && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Total volume tickets:</span>
                  <div className="flex items-center border border-zinc-800 rounded-lg bg-zinc-950">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1 text-gray-400 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-white border-x border-zinc-800">{quantity}</span>
                    <button
                      onClick={() => {
                        if (quantity < remainingSeatsCount) {
                          setQuantity(prev => prev + 1);
                        } else {
                          showToast(`Only ${remainingSeatsCount} seats available in this tier!`, 'info');
                        }
                      }}
                      className="px-3 py-1 text-gray-400 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Progress Indicators Bar */}
                <div className="mt-4 pt-3 border-t border-zinc-900">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                    <span>Seats remaining indicator:</span>
                    <span className="font-bold">{remainingSeatsCount} left / {activeTicketInfo.quantity} max</span>
                  </div>
                  
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        capacityPercent >= 85 ? 'bg-red-400' : capacityPercent >= 60 ? 'bg-[#F2994A]' : 'bg-primary'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LOCK BUTTON CHEKOUT */}
            <button
              onClick={handleBookTicketsNavigation}
              disabled={!selectedTicketType || remainingSeatsCount === 0}
              className={`w-full py-4 rounded-xl text-white font-sans text-xs uppercase tracking-widest font-bold transition-all ${
                (!selectedTicketType || remainingSeatsCount === 0)
                  ? 'bg-zinc-800 border border-zinc-700 cursor-not-allowed opacity-40 text-gray-400'
                  : 'bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-xl shadow-primary/10'
              }`}
            >
              Book Tickets Now
            </button>
          </div>

          {/* SHARE ACTION AND GOOGLE CALENDAR REDIRECT LINKS */}
          <div className="flex gap-2.5">
            <button
              onClick={handleShareOnWhatsApp}
              className="flex-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-green-400 rounded-xl py-3 px-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>

            <a
              href={getGoogleCalendarLink()}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-blue-400 rounded-xl py-3 px-3 flex items-center justify-center gap-1.5 text-xs font-bold transition-all text-center"
            >
              <CalendarPlus className="w-4 h-4" />
              Add Calendar
            </a>

            <button
              onClick={copyPageLink}
              className="p-3 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-gray-300 rounded-xl flex items-center justify-center"
              title="Copy link address"
            >
              <Share2 className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* ORGANIZER PROFILE SHORT CARD */}
          <div className={`p-5 rounded-2xl border ${
            isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950/60 border-zinc-900'
          }`}>
            <span className="text-[10px] text-gray-500 font-sans font-bold uppercase tracking-widest block mb-2">Organizer</span>
            <div className="flex items-center gap-3.5">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120"
                alt="Organizer avatar"
                className="w-12 h-12 rounded-full object-cover border border-[#F59E0B]"
              />
              
              <div>
                <span className="font-serif font-bold text-sm text-white block hover:text-primary transition-colors">
                  Rohan Sharma
                </span>
                
                <div className="flex items-center gap-1 mt-0.5 select-none">
                  <Star className="w-3.5 h-3.5 text-gold fill-current" />
                  <span className="text-xs font-bold text-gray-300">4.8</span>
                  <span className="text-[10px] text-gray-500 font-medium">(21 past events feedback)</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3 font-sans leading-relaxed">
              Premier planning agency based out of Balewadi Pune. Specializing in high-budget structural assemblies.
            </p>

            <Link
              to="/organizers/usr-org"
              className="mt-4 block text-center border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900 text-xs font-semibold py-2 rounded-lg text-primary"
            >
              View Full Profile
            </Link>
          </div>

        </aside>

      </div>
    </div>
  );
};
