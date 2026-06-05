import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEventSpark } from '../context/EventSparkContext';
import { Sparkles, Ticket, User, Shield, Compass, LogOut, Sun, Moon, ChevronDown, Check } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, switchRole, logout, isLightMode, toggleTheme } = useEventSpark();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header id="nav-header" className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
      isLightMode 
        ? 'bg-white/80 border-gray-200 text-gray-900 backdrop-blur-md' 
        : 'bg-[#080808]/80 border-gray-800 text-white backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-primary to-accent p-2 rounded-lg text-white">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-serif tracking-widest bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              EVENTSPARK
            </span>
            <span className="block text-[8px] tracking-[0.25em] text-gray-400 font-sans font-medium uppercase">
              India's Premier Event Hub
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/events"
            className={`font-sans text-sm font-medium tracking-wide transition-colors hover:text-primary flex items-center gap-1.5 ${
              isActive('/events') ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <Compass className="w-4 h-4" />
            Browse Events
          </Link>
          
          {currentUser?.role === 'attendee' && (
            <Link
              to="/my-tickets"
              className={`font-sans text-sm font-medium tracking-wide transition-colors hover:text-primary flex items-center gap-1.5 ${
                isActive('/my-tickets') ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Ticket className="w-4 h-4" />
              My Tickets
            </Link>
          )}

          {currentUser?.role === 'organizer' && (
            <Link
              to="/organizer"
              className={`font-sans text-sm font-medium tracking-wide transition-colors hover:text-primary flex items-center gap-1.5 ${
                isActive('/organizer') ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <User className="w-4 h-4" />
              Organizer Console
            </Link>
          )}

          {currentUser?.role === 'admin' && (
            <Link
              to="/admin"
              className={`font-sans text-sm font-medium tracking-wide transition-colors hover:text-primary flex items-center gap-1.5 ${
                isActive('/admin') ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
        </nav>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-colors ${
              isLightMode 
                ? 'border-gray-200 text-gray-600 hover:bg-gray-100' 
                : 'border-gray-800 text-gray-300 hover:bg-gray-900'
            }`}
            title="Toggle Theme"
          >
            {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* SIMULATED ROLE SWITCHER HUD */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border hover:opacity-95 transition-opacity ${
                currentUser?.role === 'admin'
                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                  : currentUser?.role === 'organizer'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                  : 'bg-pink-500/10 border-pink-500 text-pink-400'
              }`}
            >
              <span className="capitalize">{currentUser?.role || 'Guest'} Mode</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {dropdownOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border p-2 z-50 text-left ${
                isLightMode ? 'bg-white border-gray-200' : 'bg-[#111111] border-gray-850'
              }`}>
                <div className="px-3 py-1 text-gray-400 text-[10px] font-sans font-bold uppercase tracking-wider border-b border-gray-800/10 shrink-0 select-none pb-2">
                  Swap Session Persona
                </div>
                <button
                  onClick={() => {
                    switchRole('attendee');
                    setDropdownOpen(false);
                    navigate('/events');
                  }}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-medium mt-1 hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-accent transition-colors ${
                    currentUser?.role === 'attendee' ? 'text-pink-400 bg-pink-500/5' : 'text-gray-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold">Attendee View</span>
                    <span className="text-[10px] opacity-80">Book & checkout tickets</span>
                  </div>
                  {currentUser?.role === 'attendee' && <Check className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    switchRole('organizer');
                    setDropdownOpen(false);
                    navigate('/organizer');
                  }}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-medium mt-1 hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-accent transition-colors ${
                    currentUser?.role === 'organizer' ? 'text-purple-400 bg-purple-500/5' : 'text-gray-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold">Organizer View</span>
                    <span className="text-[10px] opacity-80">Draft events & see statistics</span>
                  </div>
                  {currentUser?.role === 'organizer' && <Check className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    switchRole('admin');
                    setDropdownOpen(false);
                    navigate('/admin');
                  }}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-medium mt-1 hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-accent transition-colors ${
                    currentUser?.role === 'admin' ? 'text-yellow-400 bg-yellow-500/5' : 'text-gray-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold">Platform Admin View</span>
                    <span className="text-[10px] opacity-80">Authorize organizers & audits</span>
                  </div>
                  {currentUser?.role === 'admin' && <Check className="w-4 h-4" />}
                </button>

                {currentUser && (
                  <div className="border-t border-gray-800/10 mt-1.5 pt-1.5">
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        navigate('/events');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out Session
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* USER MINI AVATAR */}
          {currentUser && (
            <div className="hidden sm:block">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-primary/40 focus:outline-none focus:ring focus:ring-primary/20 cursor-pointer"
                title={`Active User: ${currentUser.name}`}
              />
            </div>
          )}
        </div>
      </div>

      {/* MOBILE LOWER RAIL NAVIGATION */}
      <div className={`md:hidden flex border-t justify-around py-3 ${
        isLightMode ? 'bg-gray-50 border-gray-200' : 'bg-[#0f0f0f] border-gray-900'
      }`}>
        <Link
          to="/events"
          className={`flex flex-col items-center text-[10px] font-sans ${
            isActive('/events') ? 'text-primary' : 'text-gray-500'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          Browse catalog
        </Link>
        {currentUser?.role === 'attendee' && (
          <Link
            to="/my-tickets"
            className={`flex flex-col items-center text-[10px] font-sans ${
              isActive('/my-tickets') ? 'text-primary' : 'text-gray-500'
            }`}
          >
            <Ticket className="w-5 h-5 mb-0.5" />
            My Tickets
          </Link>
        )}
        {currentUser?.role === 'organizer' && (
          <Link
            to="/organizer"
            className={`flex flex-col items-center text-[10px] font-sans ${
              isActive('/organizer') ? 'text-primary' : 'text-gray-500'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            Dashboard
          </Link>
        )}
        {currentUser?.role === 'admin' && (
          <Link
            to="/admin"
            className={`flex flex-col items-center text-[10px] font-sans ${
              isActive('/admin') ? 'text-primary' : 'text-gray-500'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            Admin
          </Link>
        )}
      </div>
    </header>
  );
};
