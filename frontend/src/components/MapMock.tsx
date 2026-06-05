import React, { useState } from 'react';
import { Event } from '../types';
import { MapPin, X, Navigation, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface MapMockProps {
  events: Event[];
  isLightMode: boolean;
  onSelectEvent?: (eventId: string) => void;
}

export const MapMock: React.FC<MapMockProps> = ({ events, isLightMode, onSelectEvent }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Approximate relative offsets for India's coordinates mapped container sizes
  const getCityCoordinates = (city: string) => {
    switch (city.toLowerCase()) {
      case 'pune':
        return { x: 38, y: 65 };
      case 'mumbai':
        return { x: 32, y: 60 };
      case 'delhi':
        return { x: 44, y: 25 };
      case 'online':
        return { x: 50, y: 50 };
      default:
        return { x: 48, y: 55 };
    }
  };

  return (
    <div className={`relative rounded-3xl h-[450px] w-full overflow-hidden border transition-all duration-200 ${
      isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-850'
    }`}>
      {/* Background Grid Lines representing high-tech topography radar */}
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: `radial-gradient(${isLightMode ? '#000' : '#8B5CF6'} 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }}></div>

      {/* Grid Coordinates display */}
      <div className="absolute top-4 left-4 font-mono text-[9px] text-gray-400 select-none hidden sm:block">
        RADAR IND-EAST_LOCATOR [ZOOM_{zoomLevel}X]
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button 
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 text-gray-300 hover:text-white hover:bg-zinc-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* MAPPED CONTAINER */}
      <div 
        className="absolute inset-0 transition-transform duration-300 flex items-center justify-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Draw abstract Indian sub-continent boundaries sketch */}
        <svg className="absolute w-[500px] h-[500px] opacity-25" viewBox="0 0 100 100">
          <path 
            d="M 30,15 L 45,10 L 60,15 L 50,35 L 55,50 L 40,85 L 35,65 L 20,55 Z" 
            fill="none" 
            stroke={isLightMode ? '#EC4899' : '#8B5CF6'}
            strokeWidth="0.75" 
            strokeDasharray="2,2"
          />
        </svg>

        {/* Major Cities Names tags */}
        <div className="absolute left-[38%] top-[65%] text-[9px] font-mono text-gray-500 font-bold select-none uppercase pointer-events-none">Pune</div>
        <div className="absolute left-[24%] top-[58%] text-[9px] font-mono text-gray-500 font-bold select-none uppercase pointer-events-none">Mumbai</div>
        <div className="absolute left-[47%] top-[25%] text-[9px] font-mono text-gray-500 font-bold select-none uppercase pointer-events-none">Delhi</div>

        {/* Shimmering Event Pins indicators */}
        {events.map((evt) => {
          const coords = getCityCoordinates(evt.venue.city || (evt.type === 'online' ? 'Online' : 'Pune'));
          // Add a minor offset jitter per event so pins do not overlap precisely
          const jitter = (parseInt(evt._id.replace(/\D/g, '')) || 5) % 15 - 7;
          const leftPercent = coords.x + jitter / 6;
          const topPercent = coords.y + jitter / 6;

          return (
            <button
              key={evt._id}
              onClick={() => setSelectedEvent(evt)}
              className="absolute group z-10 transition-transform duration-200 hover:scale-130 focus:outline-none"
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
            >
              {/* Pulsing visual halo */}
              <span className="absolute inline-flex h-6 w-6 rounded-full bg-primary/30 animate-ping opacity-75 -left-[5px] -top-[5px]"></span>
              
              <div className={`relative px-2 py-1 rounded-lg border text-[9px] font-bold font-sans flex items-center gap-1 shadow-lg pointer-events-auto ${
                selectedEvent?._id === evt._id 
                  ? 'bg-primary text-white border-primary' 
                  : isLightMode 
                  ? 'bg-white text-gray-800 border-gray-200' 
                  : 'bg-zinc-900 text-purple-300 border-accent/40'
              }`}>
                <MapPin className="w-3.5 h-3.5 fill-current" />
                <span>₹{evt.tickets[0]?.price || 'FREE'}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* FOOTER LEGEND */}
      <div className="absolute bottom-4 left-4 p-2 bg-black/80 backdrop-blur-md rounded-xl border border-zinc-800 text-[9px] leading-relaxed max-w-[200px] pointer-events-none hidden sm:block">
        <div className="font-bold flex items-center gap-1 mb-0.5 text-primary">
          <Layers className="w-3 h-3" />
          MAP SATELLITE ACTIVE
        </div>
        Showing {events.length} active event hubs across Pune, Mumbai, Delhi & Virtual platforms.
      </div>

      {/* FLYUP CARD MODAL FOR SELECTED EVENT */}
      {selectedEvent && (
        <div className={`absolute bottom-4 right-4 left-4 sm:left-auto sm:w-80 rounded-2xl p-4 border shadow-2xl animate-in fade-in slide-in-from-bottom-3 z-30 ${
          isLightMode ? 'bg-white border-slate-200 text-gray-900' : 'bg-zinc-900/95 border-zinc-800 text-white'
        }`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {selectedEvent.category}
            </span>
            <button 
              onClick={() => setSelectedEvent(null)}
              className="p-1 rounded-full text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <img 
            src={selectedEvent.coverImage} 
            alt={selectedEvent.title}
            className="w-full h-24 rounded-lg object-cover mb-2 select-none pointer-events-none"
          />

          <h3 className="font-serif text-base font-bold mb-1 tracking-wide leading-tight line-clamp-1">
            {selectedEvent.title}
          </h3>

          <p className="text-xs text-gray-400 mb-2 line-clamp-1 flex items-center gap-1 md:line-clamp-2">
            <Navigation className="w-3 h-3 text-accent shrink-0" />
            {selectedEvent.venue.name}, {selectedEvent.venue.city}
          </p>

          <div className="flex items-center justify-between mt-3 text-xs">
            <div>
              <span className="text-xs text-gray-400">Date: </span>
              <span className="font-bold">{new Date(selectedEvent.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
            </div>
            
            {onSelectEvent ? (
              <button
                onClick={() => {
                  onSelectEvent(selectedEvent._id);
                  setSelectedEvent(null);
                }}
                className="bg-primary text-white px-3 py-1.5 rounded-lg font-sans text-xs font-bold hover:opacity-90 transition-opacity"
              >
                View Event details
              </button>
            ) : (
              <span className="font-bold text-gold">₹{selectedEvent.tickets[0]?.price || 'FREE'}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
