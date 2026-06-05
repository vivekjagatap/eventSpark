import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EventSparkProvider } from './context/EventSparkContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { EventsListingPage } from './pages/EventsListingPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { TicketBookingPage } from './pages/TicketBookingPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { OrganizerProfilePage } from './pages/OrganizerProfilePage';
import { OrganizerConsolePage } from './pages/OrganizerConsolePage';
import { AdminConsolePage } from './pages/AdminConsolePage';

export default function App() {
  return (
    <EventSparkProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen text-gray-300">
          
          {/* Main Floating HUD Navigation Bar */}
          <Navbar />

          {/* Main viewport area matching responsive boundaries */}
          <main className="flex-1 mt-[76px]">
            <Routes>
              {/* Public Paths */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/events" element={<EventsListingPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/events/:id/book" element={<TicketBookingPage />} />
              
              {/* Attendee Paths */}
              <Route path="/my-tickets" element={<MyTicketsPage />} />
              <Route path="/organizers/:id" element={<OrganizerProfilePage />} />
              
              {/* Organizer Control room */}
              <Route path="/organizer" element={<OrganizerConsolePage />} />
              <Route path="/organizer/create" element={<OrganizerConsolePage />} />
              
              {/* Backoffice System Super Admin */}
              <Route path="/admin" element={<AdminConsolePage />} />

              {/* Automatic Fallback Redirect to Landing home page */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* FOOTER GENERAL INFORMATION BAR */}
          <footer className="py-8 bg-[#040404] border-t border-zinc-950 text-center select-none shrink-0 font-sans text-xs text-gray-600">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-serif font-bold text-gray-500 tracking-wider">
                © {new Date().getFullYear()} EventSpark — India's Premier Event Design Ecosystem
              </span>
              
              <div className="flex gap-4">
                <span className="hover:text-gray-400 cursor-pointer">Security Code Vault</span>
                <span>•</span>
                <span className="hover:text-gray-400 cursor-pointer">Razorpay Sandboxed</span>
                <span>•</span>
                <span className="hover:text-gray-400 cursor-pointer">Nodemailer Dummy Channels</span>
              </div>
            </div>
          </footer>
          
        </div>
      </BrowserRouter>
    </EventSparkProvider>
  );
}
