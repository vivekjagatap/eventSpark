import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Event, Registration, User, PromoCode } from '../types';

interface EventSparkContextType {
  events: Event[];
  registrations: Registration[];
  promoCodes: PromoCode[];
  currentUser: User | null;
  isLightMode: boolean;
  fetchEvents: () => void;
  getEventById: (id: string) => Event | undefined;
  bookTickets: (eventId: string, tickets: any, attendees: any, promo: any, totalAmount: number) => Promise<void>;
  validatePromo: (code: string) => PromoCode | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  getOrganizerStats: (organizerId: string) => any;
  cancelBooking: (registrationId: string) => void;
  addReview: (eventId: string, review: any) => void;
  switchRole: (role: 'attendee' | 'organizer' | 'admin') => void;
  logout: () => void;
  toggleTheme: () => void;
  addEvent: (event: any) => void;
  deleteEvent: (eventId: string) => void;
  createPromo: (promo: any) => void;
  toggleCheckIn: (registrationId: string) => void;
}

const EventSparkContext = createContext<EventSparkContextType | undefined>(undefined);

export const EventSparkProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>({
    _id: 'mock-user-1',
    name: 'Guest Attendee',
    email: 'guest@eventspark.in',
    role: 'attendee',
    createdAt: new Date().toISOString()
  });
  const [isLightMode, setIsLightMode] = useState(false);

  const fetchEvents = () => {};
  const getEventById = (id: string) => events.find(e => e._id === id);
  const bookTickets = async () => {};
  const validatePromo = () => null;
  const showToast = (message: string) => console.log('Toast:', message);
  const getOrganizerStats = () => ({ totalEvents: 0, totalTickets: 0, revenue: 0 });
  const cancelBooking = () => {};
  const addReview = () => {};
  const switchRole = (role: 'attendee' | 'organizer' | 'admin') => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };
  const logout = () => setCurrentUser(null);
  const toggleTheme = () => setIsLightMode(!isLightMode);
  
  const addEvent = () => {};
  const deleteEvent = () => {};
  const createPromo = () => {};
  const toggleCheckIn = () => {};

  return (
    <EventSparkContext.Provider value={{
      events, registrations, promoCodes, currentUser, isLightMode,
      fetchEvents, getEventById, bookTickets, validatePromo, showToast,
      getOrganizerStats, cancelBooking, addReview, switchRole, logout, toggleTheme,
      addEvent, deleteEvent, createPromo, toggleCheckIn
    }}>
      {children}
    </EventSparkContext.Provider>
  );
};

export const useEventSpark = () => {
  const context = useContext(EventSparkContext);
  if (context === undefined) {
    throw new Error('useEventSpark must be used within a EventSparkProvider');
  }
  return context;
};
