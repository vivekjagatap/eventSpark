import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useEventSpark } from '../context/EventSparkContext';
import { MapMock } from '../components/MapMock';
import { Search, Map, Grid, SlidersHorizontal, Calendar, MapPin, Users, Sparkles, Filter, ChevronRight } from 'lucide-react';

export const EventsListingPage: React.FC = () => {
  const { events, fetchEvents, isLightMode } = useEventSpark();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [priceRange, setPriceRange] = useState('All'); // All, FREE, Under 500, Under 1000
  const [sortOption, setSortOption] = useState('date'); // date, price, popularity
  const [isMapView, setIsMapView] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = ['Wedding', 'Corporate', 'Birthday', 'Concert', 'Conference', 'Exhibition', 'Sports', 'Workshop'];
  const cities = ['All', 'Pune', 'Mumbai', 'Delhi', 'Online'];
  const typeOptions = ['All', 'online', 'offline', 'hybrid'];

  // Initialize filters from search parameters (like home link category search query)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Query database on filter modifications
  useEffect(() => {
    const filters = {
      category: selectedCategories.length > 0 ? selectedCategories.join(',') : 'All',
      city: selectedCity,
      type: selectedType,
      maxPrice: priceRange === 'FREE' ? '0' : priceRange === 'Under 500' ? '500' : priceRange === 'Under 1000' ? '1000' : 'All',
      search: searchQuery
    };
    fetchEvents(filters);
  }, [selectedCategories, selectedCity, selectedType, priceRange, searchQuery]);

  // Client sort lists
  const sortedEvents = [...events].sort((a, b) => {
    if (sortOption === 'price') {
      const ticketsA = a.tickets || [];
      const ticketsB = b.tickets || [];
      const minA = ticketsA.length > 0 ? Math.min(...ticketsA.map(t => t.price)) : 0;
      const minB = ticketsB.length > 0 ? Math.min(...ticketsB.map(t => t.price)) : 0;
      return minA - minB;
    }
    if (sortOption === 'popularity') {
      return b.totalRegistrations - a.totalRegistrations;
    }
    // Default date sorting
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  const handleCategoryToggle = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(prev => prev.filter(c => c !== cat));
    } else {
      setSelectedCategories(prev => [...prev, cat]);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedCity('All');
    setSelectedType('All');
    setPriceRange('All');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className={`min-h-screen py-10 transition-colors duration-200 ${
      isLightMode ? 'bg-slate-50 text-gray-900' : 'bg-[#080808] text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* UPPER TITLE HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Explore Event Catalog
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-md">
              Browse luxurious rituals, premier technology summits, workshops, and concerts near you.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* VIEW MODE TOGGER */}
            <div className="bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 flex items-center">
              <button
                onClick={() => setIsMapView(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  !isMapView ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Card Grid</span>
              </button>
              <button
                onClick={() => setIsMapView(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isMapView ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Radar Map</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-gray-300"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SEARCH AND QUICK BAR */}
        <div className="relative mb-8 max-w-2xl shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 focus:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by titles, planners, topics (e.g., Pune, AI, Comedy)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-2xl py-4.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 tracking-wide text-white transition-all placeholder:text-gray-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* MAIN BODY GRID STRUCTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR FILTER (Hidden on mobile unless requested) */}
          <aside className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} space-y-8 select-none lg:sticky lg:top-28 h-fit`}>
            
            {/* CATEGORIES CONTAINER */}
            <div className={`p-6 rounded-2xl border ${
              isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-850'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-4">
                <span className="font-serif font-bold text-base tracking-wide flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Categories
                </span>
                <button 
                  onClick={clearFilters}
                  className="text-[10px] text-gray-500 hover:text-primary uppercase font-bold tracking-wider"
                >
                  Reset All
                </button>
              </div>

              <div className="space-y-2.5">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2.5 text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryToggle(cat)}
                      className="w-4 h-4 rounded border-zinc-800 text-primary bg-zinc-900 accent-primary"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* URBAN SELECTION AREA */}
            <div className={`p-6 rounded-2xl border ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-850'
            }`}>
              <span className="font-serif font-bold text-base tracking-wide flex items-center gap-2 pb-4 border-b border-zinc-900 mb-4">
                <MapPin className="w-4 h-4 text-accent" />
                Select City
              </span>

              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedCity === city
                        ? 'bg-accent/15 border-accent text-accent'
                        : 'bg-zinc-900/40 border-zinc-850 text-gray-400 hover:text-white hover:border-zinc-750'
                    }`}
                  >
                    {city === 'All' ? 'All Cities' : city}
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE CLASSIFICATION */}
            <div className={`p-6 rounded-2xl border ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-850'
            }`}>
              <span className="font-serif font-bold text-base tracking-wide flex items-center gap-2 pb-4 border-b border-zinc-900 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-gold" />
                Ticket Price
              </span>

              <div className="space-y-2">
                {['All', 'FREE', 'Under 500', 'Under 1000'].map((price) => (
                  <button
                    key={price}
                    onClick={() => setPriceRange(price)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                      priceRange === price
                        ? 'bg-gold/15 text-gold border border-gold/30'
                        : 'border border-transparent text-gray-400 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    <span>{price === 'All' ? 'All Prices' : price}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            {/* EVENT FORMAT */}
            <div className={`p-6 rounded-2xl border ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-850'
            }`}>
              <span className="font-serif font-bold text-base tracking-wide flex items-center gap-2 pb-4 border-b border-zinc-900 mb-4">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Format Mode
              </span>

              <div className="flex flex-col gap-2">
                {typeOptions.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedType(fmt)}
                    className={`text-left px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      selectedType === fmt
                        ? 'bg-pink-500/10 border-pink-500/40 text-pink-400'
                        : 'bg-zinc-900/40 border-zinc-850 text-gray-400 hover:text-white'
                    }`}
                  >
                    {fmt === 'All' ? 'online & physical both' : fmt}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* EVENTS CONTENT CLUSTER */}
          <section className="lg:col-span-3 space-y-6">
            
            {/* SORTING CONTROLS TOP BAR */}
            <div className={`sm:flex items-center justify-between p-4 rounded-2xl border ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950/80 border-zinc-850'
            }`}>
              <span className="text-xs text-gray-400 font-sans tracking-wide block sm:inline mb-2 sm:mb-0">
                Sorted results: <b className="text-white">{sortedEvents.length}</b> productions meet your requirements
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 shrink-0 font-medium">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary/50"
                >
                  <option value="date">Upcoming Date</option>
                  <option value="price">Budget: Lowest First</option>
                  <option value="popularity">Popularity: Crowd sizes</option>
                </select>
              </div>
            </div>

            {/* ERROR FALLBACK */}
            {sortedEvents.length === 0 && (
              <div className="text-center py-20 bg-zinc-950/20 rounded-3xl border border-zinc-900/60 p-8">
                <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold mb-2">No Matches Found</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed mb-6">
                  We couldn't locate active verified slots matching these selectors. Try resetting filters or adjust your text term.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white font-sans text-xs uppercase tracking-wider font-bold px-5 py-2.5 rounded-xl"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* GRID CATALOG OF EVENT CARDS */}
            {!isMapView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedEvents.map((evt) => {
                  const tickets = evt.tickets || [];
                  const cheapest = tickets.length > 0 ? Math.min(...tickets.map(t => t.price)) : 0;
                  const totalTicketsQty = tickets.reduce((acc, t) => acc + t.quantity, 0);
                  const soldTicketsQty = tickets.reduce((acc, t) => acc + t.sold, 0);
                  const vacancy = totalTicketsQty - soldTicketsQty;

                  return (
                    <div
                      key={evt._id}
                      className={`rounded-2xl overflow-hidden border flex flex-col justify-between group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 transition-all ${
                        isLightMode ? 'bg-white border-slate-200 text-gray-900' : 'bg-zinc-950 border-zinc-850'
                      }`}
                    >
                      {/* CARD COVER */}
                      <div className="relative h-44 overflow-hidden shrink-0">
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-350 select-none"
                        />
                        <span className="absolute bottom-3 left-3 bg-primary text-white text-[9px] uppercase font-mono px-2 py-0.5 rounded-md tracking-wider">
                          {evt.type}
                        </span>

                        <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {evt.category}
                        </span>
                      </div>

                      {/* CARD TEXT */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>{new Date(evt.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>

                          <h3 className={`font-serif text-lg font-bold mb-1 tracking-wide line-clamp-1 group-hover:text-primary transition-colors ${
                            isLightMode ? 'text-gray-900' : 'text-white'
                          }`}>
                            {evt.title}
                          </h3>

                          <p className="text-xs text-gray-400 font-sans line-clamp-2 leading-relaxed mb-4">
                            {evt.description}
                          </p>

                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                            <span className="line-clamp-1 text-[11px]">{evt.venue.name}, {evt.venue.city}</span>
                          </div>
                        </div>

                        <div>
                          {/* URGENCIES */}
                          {vacancy <= 50 ? (
                            <div className="text-[9px] font-bold tracking-wide uppercase text-red-400 bg-red-500/5 px-2 py-0.5 rounded-md w-fit mb-4">
                              🚨 Selling Super Fast! Only {vacancy} seats remaining!
                            </div>
                          ) : vacancy <= 180 ? (
                            <div className="text-[9px] font-bold tracking-wide uppercase text-gold bg-gold/10 px-2 py-0.5 rounded-md w-fit mb-4">
                              ⏳ Only {vacancy} seats left!
                            </div>
                          ) : null}

                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3 font-medium">
                            <span>Organizer:</span>
                            <span className="text-gray-300 font-semibold">{evt.organizerName}</span>
                          </div>

                          <div className="flex items-center justify-between border-t border-zinc-900/60 pt-4 mt-2">
                            <div>
                              <span className="text-[10px] text-gray-500 block">Entry Gate</span>
                              <span className="font-bold text-sm text-pink-500">
                                {cheapest === 0 ? 'FREE' : `₹${cheapest}`}
                              </span>
                            </div>

                            <Link
                              to={`/events/${evt._id}`}
                              className="bg-primary hover:opacity-90 text-white font-sans text-xs font-bold px-3.5 py-2 rounded-xl transition-opacity"
                            >
                              Register Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* RADAR MAP INTERACTIVE VIEW */
              <div className="space-y-4">
                <MapMock 
                  events={events} 
                  isLightMode={isLightMode} 
                  onSelectEvent={(id) => navigate(`/events/${id}`)}
                />
              </div>
            )}

          </section>

        </div>
      </div>
    </div>
  );
};
