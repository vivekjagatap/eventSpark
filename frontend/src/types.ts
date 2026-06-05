export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'attendee' | 'organizer' | 'admin';
  avatar?: string;
  bio?: string;
  company?: string;
  createdAt: string;
}

export interface Venue {
  name: string;
  address: string;
  city: string;
  mapLink?: string;
}

export interface Speaker {
  id?: string;
  name: string;
  photo: string;
  title: string;
  bio: string;
  socials?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface ScheduleItem {
  id?: string;
  time: string;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TicketType {
  type: string; // e.g. 'Early Bird', 'Regular', 'VIP'
  price: number;
  quantity: number;
  sold: number;
  description?: string;
  saleStart?: string;
  saleEnd?: string;
}

export interface Event {
  _id: string;
  organizerId: string;
  organizerName?: string;
  title: string;
  description: string;
  category: string;
  type: 'online' | 'offline' | 'hybrid';
  coverImage: string;
  tags: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  venue: Venue;
  onlineLink?: string;
  speakers: Speaker[];
  schedule: ScheduleItem[];
  faqs: FAQItem[];
  tickets: TicketType[];
  totalCapacity: number;
  totalRegistrations: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  isFeatured?: boolean;
  refundPolicy: string;
  createdAt: string;
}

export interface RegisteredTicket {
  ticketType: string;
  quantity: number;
  price: number;
}

export interface AttendeeDetail {
  name: string;
  email: string;
  phone: string;
}

export interface Registration {
  _id: string;
  eventId: string;
  userId: string;
  organizerId: string;
  tickets: RegisteredTicket[];
  attendees: AttendeeDetail[];
  totalAmount: number;
  paymentId: string;
  promoCode?: string;
  discount: number;
  qrCode: string;
  status: 'booked' | 'cancelled';
  isCheckedIn: boolean;
  createdAt: string;
  // Hydrated properties for attendee display
  eventTitle?: string;
  eventImage?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
}

export interface PromoCode {
  _id: string;
  eventId?: string; // If empty, applies to all events
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  usageLimit?: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
}

export interface Review {
  _id: string;
  eventId: string;
  userId: string;
  name: string;
  avatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}
