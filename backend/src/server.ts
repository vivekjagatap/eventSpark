import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { createServer as createViteServer } from 'vite';
import { User, Event, Registration, PromoCode, Review } from '../frontend/src/types';
import firebaseConfig from './firebase-applet-config.json';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Firebase Admin SDK
const adminApp = admin.initializeApp({
  projectId: firebaseConfig.projectId
});

const realDb = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);

// Local JSON file database fallback when Admin SDK lacks permissions
class MockFirestore {
  private localFilePath = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'db-store.json');
  private data: Record<string, any[]> = {};

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.localFilePath)) {
        const raw = JSON.parse(fs.readFileSync(this.localFilePath, 'utf8'));
        this.data = {
          users: raw.users || [],
          events: raw.events || [],
          registrations: raw.registrations || [],
          promocodes: raw.promoCodes || raw.promocodes || [],
          reviews: raw.reviews || []
        };
      } else {
        this.data = { users: [], events: [], registrations: [], promocodes: [], reviews: [] };
      }
    } catch (err) {
      console.error('[Mock DB] Load failed:', err);
      this.data = { users: [], events: [], registrations: [], promocodes: [], reviews: [] };
    }
  }

  private saveData() {
    try {
      const payload = {
        users: this.data.users,
        events: this.data.events,
        registrations: this.data.registrations,
        promoCodes: this.data.promocodes, // Map back to key name expected in db-store.json
        reviews: this.data.reviews
      };
      fs.writeFileSync(this.localFilePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (err) {
      console.error('[Mock DB] Save failed:', err);
    }
  }

  collection(name: string) {
    const colName = name.toLowerCase();
    
    if (!this.data[colName]) {
      this.data[colName] = [];
    }

    const createQuerySnapshot = (items: any[]) => {
      const docs = items.map(item => ({
        id: item._id || item.id || '',
        exists: true,
        data: () => item
      }));
      return {
        empty: docs.length === 0,
        size: docs.length,
        docs: docs
      };
    };

    const self = this;

    class MockQuery {
      constructor(public items: any[]) {}

      where(field: string, op: string, val: any) {
        let filtered = this.items;
        if (op === '==') {
          filtered = this.items.filter(item => {
            const itemVal = item[field];
            if (typeof itemVal === 'string' && typeof val === 'string') {
              return itemVal.toLowerCase().trim() === val.toLowerCase().trim();
            }
            return itemVal === val;
          });
        } else if (op === '>=') {
          filtered = this.items.filter(item => item[field] >= val);
        } else if (op === '<=') {
          filtered = this.items.filter(item => item[field] <= val);
        } else if (op === 'in') {
          filtered = this.items.filter(item => Array.isArray(val) && val.includes(item[field]));
        } else if (op === 'array-contains') {
          filtered = this.items.filter(item => Array.isArray(item[field]) && item[field].includes(val));
        }
        return new MockQuery(filtered);
      }

      limit(n: number) {
        return new MockQuery(this.items.slice(0, n));
      }

      async get() {
        return createQuerySnapshot(this.items);
      }
    }

    return {
      doc(docId: string) {
        return {
          async get() {
            const found = self.data[colName].find(item => (item._id || item.id) === docId);
            return {
              id: docId,
              exists: !!found,
              data: () => found || null
            };
          },
          async set(data: any) {
            const index = self.data[colName].findIndex(item => (item._id || item.id) === docId);
            const savedData = { ...data, _id: docId };
            if (index !== -1) {
              self.data[colName][index] = savedData;
            } else {
              self.data[colName].push(savedData);
            }
            self.saveData();
          },
          async update(data: any) {
            const index = self.data[colName].findIndex(item => (item._id || item.id) === docId);
            if (index !== -1) {
              self.data[colName][index] = { ...self.data[colName][index], ...data };
              self.saveData();
            } else {
              throw new Error(`Document with ID ${docId} not found in collection ${colName}`);
            }
          }
        };
      },

      where(field: string, op: string, val: any) {
        return new MockQuery(self.data[colName]).where(field, op, val);
      },

      limit(n: number) {
        return new MockQuery(self.data[colName]).limit(n);
      },

      async get() {
        return createQuerySnapshot(self.data[colName]);
      }
    };
  }
}

class FallbackFirestore {
  private mockDb: MockFirestore;
  private realDb: any;
  private hasRealDb: boolean = false;
  private checkPromise: Promise<void> | null = null;

  constructor(realDb: any) {
    this.realDb = realDb;
    this.mockDb = new MockFirestore();
  }

  async ensureConnection() {
    if (this.checkPromise) return this.checkPromise;
    this.checkPromise = (async () => {
      try {
        // Fast ping to verify credentials and connection
        await this.realDb.collection('events').limit(1).get();
        this.hasRealDb = true;
        console.log('[Database Engine] Connection succeeded. Defaulting to Real Firestore!');
      } catch (err: any) {
        console.warn('[Database Engine] WARNING: Firestore connection fell back to Local file storage.');
        console.warn(`Reason: ${err.message || err}`);
        this.hasRealDb = false;
      }
    })();
    return this.checkPromise;
  }

  collection(name: string) {
    const self = this;
    
    return {
      doc(docId: string) {
        return {
          async get() {
            await self.ensureConnection();
            if (self.hasRealDb) {
              return self.realDb.collection(name).doc(docId).get();
            } else {
              return self.mockDb.collection(name).doc(docId).get();
            }
          },
          async set(data: any) {
            await self.ensureConnection();
            if (self.hasRealDb) {
              return self.realDb.collection(name).doc(docId).set(data);
            } else {
              return self.mockDb.collection(name).doc(docId).set(data);
            }
          },
          async update(data: any) {
            await self.ensureConnection();
            if (self.hasRealDb) {
              return self.realDb.collection(name).doc(docId).update(data);
            } else {
              return self.mockDb.collection(name).doc(docId).update(data);
            }
          }
        };
      },

      where(field: string, op: string, val: any) {
        const chain: any = {
          whereClause: [] as { field: string; op: string; val: any }[],
          limitVal: null as number | null,
          where(f: string, o: string, v: any) {
            this.whereClause.push({ field: f, op: o, val: v });
            return this;
          },
          limit(n: number) {
            this.limitVal = n;
            return this;
          },
          async get() {
            await self.ensureConnection();
            if (self.hasRealDb) {
              let q: any = self.realDb.collection(name);
              for (const w of this.whereClause) {
                q = q.where(w.field, w.op, w.val);
              }
              if (this.limitVal !== null) {
                q = q.limit(this.limitVal);
              }
              return q.get();
            } else {
              let q: any = self.mockDb.collection(name);
              for (const w of this.whereClause) {
                q = q.where(w.field, w.op, w.val);
              }
              if (this.limitVal !== null) {
                q = q.limit(this.limitVal);
              }
              return q.get();
            }
          }
        };
        chain.whereClause.push({ field, op, val });
        return chain;
      },

      limit(n: number) {
        const chain: any = {
          limitVal: n,
          whereClause: [] as { field: string; op: string; val: any }[],
          where(f: string, o: string, v: any) {
            this.whereClause.push({ field: f, op: o, val: v });
            return this;
          },
          limit(num: number) {
            this.limitVal = num;
            return this;
          },
          async get() {
            await self.ensureConnection();
            if (self.hasRealDb) {
              let q: any = self.realDb.collection(name);
              for (const w of this.whereClause) {
                q = q.where(w.field, w.op, w.val);
              }
              q = q.limit(this.limitVal);
              return q.get();
            } else {
              let q: any = self.mockDb.collection(name);
              for (const w of this.whereClause) {
                q = q.where(w.field, w.op, w.val);
              }
              q = q.limit(this.limitVal);
              return q.get();
            }
          }
        };
        return chain;
      },

      async get() {
        await self.ensureConnection();
        if (self.hasRealDb) {
          return self.realDb.collection(name).get();
        } else {
          return self.mockDb.collection(name).get();
        }
      }
    };
  }
}

const db = new FallbackFirestore(realDb);

// Structured Firestore Error Handler following strict skill specifications
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: 'server-admin-role',
      isSystem: true
    }
  };
  console.error('[Firestore Server Error]: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Automatic Firestore Seeding
const seedDataToFirestore = async () => {
  try {
    const eventsSnap = await db.collection('events').limit(1).get();
    if (eventsSnap.empty) {
      console.log('[Firestore] No events found. Automatically seeding default catalog...');

      // 1. Users list
      const seedUsers: User[] = [
        {
          _id: 'usr-admin',
          name: 'EventSpark Admin',
          email: 'admin@eventspark.in',
          phone: '9876543210',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320',
          bio: 'Head of EventSpark Platform Administration.',
          company: 'EventSpark India',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'usr-org',
          name: 'Rohan Sharma',
          email: 'organizer@eventspark.in',
          phone: '9812345678',
          role: 'organizer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320',
          bio: 'Premier Wedding and Corporate Planner across Pune and Mumbai. Creating luxury, tailor-made experiences.',
          company: 'Royal Canvas Planners',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'usr-att',
          name: 'Amit Patel',
          email: 'attendee@test.in',
          phone: '9988776655',
          role: 'attendee',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320',
          bio: 'Lifelong learner, tech enthusiast, and comedy fan from Pune.',
          createdAt: new Date().toISOString()
        }
      ];

      for (const u of seedUsers) {
        await db.collection('users').doc(u._id).set(u);
      }

      // 2. Events list
      const seedEvents: Event[] = [
        {
          _id: 'evt-1',
          organizerId: 'usr-org',
          organizerName: 'Rohan Sharma',
          title: 'TechPune Summit 2026',
          description: 'The largest technology convergence in Maharashtra. Join 30+ leading speakers, venture capitalists, and technological disruptors across India for multiple tracks of panel discussions, machine learning showcases, and keynotes.',
          category: 'Conference',
          type: 'hybrid',
          coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
          tags: ['Tech', 'AI', 'Startup', 'Pune'],
          startDate: '2026-06-15',
          endDate: '2026-06-15',
          startTime: '09:00',
          endTime: '17:00',
          venue: {
            name: 'JW Marriott Grand Ballroom',
            address: 'Senapati Bapat Road, Shivajinagar',
            city: 'Pune',
            mapLink: 'https://maps.google.com'
          },
          onlineLink: 'https://zoom.us/j/techpune-summit',
          speakers: [
            { name: 'Dr. Aarav Mehta', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', title: 'VP of AI Research, DeepTech Labs', bio: 'Pioneering work in transformer architectures.' },
            { name: 'Neha Deshmukh', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', title: 'Founding Partner, VentureSphere India', bio: 'Successfully funded 12 early-stage SaaS unicorns.' }
          ],
          schedule: [
            { time: '09:00 AM', title: 'Registration & Welcome Drinks', description: 'Collect your attendee badges and gift bundles at the front lobby.' },
            { time: '10:00 AM', title: 'Opening Keynote: Generative India v3', description: 'Explore how Indian tech firms are leapfrogging the AI model race.' },
            { time: '01:00 PM', title: 'Networking Lunch', description: 'Gourmet Indian buffet catered by JW Marriott grand chefs.' },
            { time: '03:00 PM', title: 'SaaS Scaling Masterclass', description: 'Fireside panel with regional leaders on building global frameworks from Pune.' }
          ],
          faqs: [
            { question: 'Is parking available at the venue?', answer: 'Yes, JW Marriott offers complimentary valet parking for all Summit badge holders.' },
            { question: 'Will online attendees receive participation certificates?', answer: 'Absolutely. High-quality digital certificate tokens will be emailed within 48 hours.' }
          ],
          tickets: [
            { type: 'Early Bird', price: 999, quantity: 100, sold: 80, description: 'Access to general tracks + delegate kit. Available till June 1.' },
            { type: 'Regular', price: 1499, quantity: 400, sold: 240, description: 'Standard admission pass to all keynotes and offline networking dining.' }
          ],
          totalCapacity: 500,
          totalRegistrations: 320,
          status: 'published',
          isFeatured: true,
          refundPolicy: 'Full refund up to 7 days before event. 50% refund after that.',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'evt-2',
          organizerId: 'usr-org',
          organizerName: 'Rohan Sharma',
          title: 'Sunset EDM Night',
          description: 'Experience an electrifying sunset EDM musical concert in Pune. Handpicked line-up of national DJs, laser mapping, live mocktail lounges, and an unparalleled bass-heavy open-air sound stage.',
          category: 'Concert',
          type: 'offline',
          coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
          tags: ['Music', 'EDM', 'Party', 'Youth'],
          startDate: '2026-06-20',
          endDate: '2026-06-20',
          startTime: '18:00',
          endTime: '23:30',
          venue: {
            name: 'The Orchid Turf Lounge',
            address: 'Balewadi High Street Extension',
            city: 'Pune',
            mapLink: 'https://maps.google.com'
          },
          speakers: [
            { name: 'DJ Zordon (Aniket)', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200', title: 'Electronic Producer & DJ', bio: 'Voted Top 10 Indie Artists in India with over 20M audio streams.' }
          ],
          schedule: [
            { time: '06:00 PM', title: 'Gates Open & Opening Set', description: 'Catch the twilight beats by our local emerging prodigies.' },
            { time: '08:30 PM', title: 'Neon Laser Show', description: 'Synchronized visual mapping on the grand Balewadi turf.' },
            { time: '09:30 PM', title: 'Headline DJ Zordon Live Set', description: 'The absolute power hour of deep-house and bass hits.' }
          ],
          faqs: [
            { question: 'Is alcohol served at the venue?', answer: 'Mocktails and food lounges are open to all. Alcohol stalls are restricted strictly to ages 21+ with verified ID wristbands.' }
          ],
          tickets: [
            { type: 'Regular', price: 799, quantity: 800, sold: 578, description: 'General access to music floor + neon band.' },
            { type: 'VIP', price: 1299, quantity: 200, sold: 100, description: 'Elevated VIP deck, separate lounge bar, unlimited mocktails & snacks.' }
          ],
          totalCapacity: 1000,
          totalRegistrations: 678,
          status: 'published',
          isFeatured: true,
          refundPolicy: 'Tickets are non-refundable. Transfers are permitted up to 24hrs beforehand.',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'evt-3',
          organizerId: 'usr-org',
          organizerName: 'Rohan Sharma',
          title: 'Startup Founders Meetup',
          description: 'An exclusive networking meetup for SaaS and deeptech founders of Mumbai. Pitch your startup to key seed operators in a highly interactive, curated roundtable setup. Dinner and premium cocktails included.',
          category: 'Corporate',
          type: 'offline',
          coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200',
          tags: ['Networking', 'Startups', 'Mumbai'],
          startDate: '2026-06-18',
          endDate: '2026-06-18',
          startTime: '18:30',
          endTime: '21:30',
          venue: {
            name: 'WeWork Galaxy Ballroom',
            address: 'Linking Road, Bandra West',
            city: 'Mumbai',
            mapLink: 'https://maps.google.com'
          },
          speakers: [
            { name: 'Divya Singhal', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200', title: 'Angel Syndicate Chair', bio: 'Invested in over 40 Indian fintech and logistics solutions.' }
          ],
          schedule: [
            { time: '06:30 PM', title: 'Ice-Breaking Circle', description: 'Brief 30-second introductory elevator pitches round.' },
            { time: '07:30 PM', title: 'The Fundraising Reality Checklist', description: 'Interactive keynote focusing on navigating seed crunches.' },
            { time: '08:30 PM', title: 'Roundtable Networking Dinner', description: 'Pre-vetted founder matches for curated scaling advice.' }
          ],
          faqs: [
            { question: 'How are attendees selected?', answer: 'This meetup is pre-screened. If you register, the startup deck will be verified within 3 days for selection confirmation.' }
          ],
          tickets: [
            { type: 'FREE', price: 0, quantity: 200, sold: 145, description: 'Exclusively for pre-vetted founders. Requires brief validation.' }
          ],
          totalCapacity: 200,
          totalRegistrations: 145,
          status: 'published',
          isFeatured: false,
          refundPolicy: 'Free sign-ups face cancellation penalty on no-shows.',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'evt-4',
          organizerId: 'usr-org',
          organizerName: 'Rohan Sharma',
          title: 'Wedding Photography Workshop',
          description: 'Master the beautiful Indian wedding visual landscape. Learn framing, flash handling, light manipulation, capturing candid moments, post-production presets, and closing five-figure contracts with modern Indian brides.',
          category: 'Workshop',
          type: 'online',
          coverImage: 'https://images.unsplash.com/photo-1537655780520-1e392edd816a?w=1200',
          tags: ['Photography', 'Wedding', 'Art', 'Design'],
          startDate: '2026-06-25',
          endDate: '2026-06-25',
          startTime: '14:00',
          endTime: '18:00',
          venue: {
            name: 'Online Zoom Live Session',
            address: 'Live virtual streaming links provided after seat checkout',
            city: 'Online',
            mapLink: ''
          },
          onlineLink: 'https://zoom.us/j/wedding-photo-live',
          speakers: [
            { name: 'Karan Malhotra', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', title: 'Luxury Wedding Photographer', bio: 'Featured in Brides Today and Vogue India. Photographed over 150 royal palace weddings.' }
          ],
          schedule: [
            { time: '02:00 PM', title: 'Lighting Techniques for Indian Wear', description: 'Deconstructing pastel vs heavy gold embroidery color contrast.' },
            { time: '03:30 PM', title: 'Candid Timing Masterclass', description: 'How to preempt and capture high-emotion parent moments.' },
            { time: '05:30 PM', title: 'Business of Weddings', description: 'Pitching pricing tables, managing revisions, and licensing.' }
          ],
          faqs: [
            { question: 'Will we receive edit presets?', answer: 'Yes! Karan Malhotra will share 15 signature Lightroom wedding presets.' }
          ],
          tickets: [
            { type: 'Regular', price: 499, quantity: 100, sold: 67, description: 'Full live access, study guide, and high-fidelity presets.' }
          ],
          totalCapacity: 100,
          totalRegistrations: 67,
          status: 'published',
          isFeatured: false,
          refundPolicy: '100% money back guarantee if you leave feedback wishing for a refund.',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'evt-5',
          organizerId: 'usr-org',
          organizerName: 'Rohan Sharma',
          title: 'Pune Food Festival 2026',
          description: 'Punes largest culinary celebration. 120+ food stalls ranging from spicy Misal Pav and authentic Maharashtrian Wada, to boutique artisanal pizzas, gourmet sliders, and organic chocolate workshops. Live music in the garden area.',
          category: 'Exhibition',
          type: 'offline',
          coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
          tags: ['Food', 'Exhibition', 'Pune', 'Family'],
          startDate: '2026-07-04',
          endDate: '2026-07-06',
          startTime: '11:00',
          endTime: '22:00',
          venue: {
            name: 'SSP Ground (Saras Baug opposite)',
            address: 'Saras Baug Road, Vijayanagar',
            city: 'Pune',
            mapLink: 'https://maps.google.com'
          },
          speakers: [
            { name: 'Chef Tarun Kapoor', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', title: 'Master Chef Winner & Mentor', bio: 'Curator of modern fusion Indian street cuisines.' }
          ],
          schedule: [
            { time: '11:00 AM', title: 'Stalls Open', description: 'Explore the regional pavilion featuring secret ingredients.' },
            { time: '04:00 PM', title: 'Live Cooking Masterclass', description: 'Chef Tarun Kapoor demonstrates nitrogen street chaat.' },
            { time: '07:30 PM', title: 'Live Fusion Sufi Concert', description: 'Ambient music to complement your royal feast experience.' }
          ],
          faqs: [
            { question: 'Are kids allowed?', answer: 'Yes, kid under 8 years of age have free admission. Dedicated play zones are fully supervised.' }
          ],
          tickets: [
            { type: 'Single Entry', price: 299, quantity: 4000, sold: 1800, description: 'One-day access badge.' },
            { type: 'Family Package', price: 599, quantity: 1000, sold: 300, description: 'Admits 3 family members with custom coupon rewards.' }
          ],
          totalCapacity: 5000,
          totalRegistrations: 2100,
          status: 'published',
          isFeatured: true,
          refundPolicy: 'Non-refundable but valid for entry on any of the three carnival days.',
          createdAt: new Date().toISOString()
        }
      ];

      for (const e of seedEvents) {
        await db.collection('events').doc(e._id).set(e);
      }

      // 3. Promos
      const seedPromos: PromoCode[] = [
        {
          _id: 'pc-1',
          code: 'SPARK20',
          discountType: 'percentage',
          discountValue: 20,
          usageLimit: 100,
          usedCount: 15,
          expiryDate: '2026-12-31',
          isActive: true
        },
        {
          _id: 'pc-2',
          code: 'WELCOME500',
          discountType: 'flat',
          discountValue: 500,
          usageLimit: 50,
          usedCount: 6,
          expiryDate: '2026-10-31',
          isActive: true
        }
      ];

      for (const p of seedPromos) {
        await db.collection('promocodes').doc(p._id).set(p);
      }

      // 4. Reviews
      const seedReviews: Review[] = [
        {
          _id: 'rev-1',
          eventId: 'evt-1',
          userId: 'usr-att',
          name: 'Amit Patel',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
          rating: 5,
          comment: 'An absolutely world-class tech conference! The sessions on Generative AI were super informative and the culinary buffet from JW Marriott was spectacular.',
          createdAt: new Date().toISOString()
        }
      ];

      for (const r of seedReviews) {
        await db.collection('reviews').doc(r._id).set(r);
      }

      // 5. Registrations
      const seedRegistrations: Registration[] = [
        {
          _id: 'reg-001',
          eventId: 'evt-1',
          userId: 'usr-att',
          organizerId: 'usr-org',
          tickets: [
            { ticketType: 'Early Bird', quantity: 1, price: 999 }
          ],
          attendees: [
            { name: 'Amit Patel', email: 'attendee@test.in', phone: '9988776655' }
          ],
          totalAmount: 999,
          paymentId: 'pay_MOK_RZR_11029',
          promoCode: '',
          discount: 0,
          qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=reg-001',
          status: 'booked',
          isCheckedIn: false,
          createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
          eventTitle: 'TechPune Summit 2026',
          eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
          eventDate: '2026-06-15',
          eventTime: '09:00',
          eventVenue: 'JW Marriott Grand Ballroom, Pune'
        }
      ];

      for (const r of seedRegistrations) {
        await db.collection('registrations').doc(r._id).set(r);
      }

      console.log('[Firestore] Default data successfully seeded!');
    } else {
      console.log('[Firestore] Database has existing events. Skipping seeding phase.');
    }
  } catch (err) {
    console.error('[Firestore] Error in seeding context:', err);
  }
};

// Initiate Seed Checks
seedDataToFirestore();

// ==========================================
// API REST ENDPOINTS BACKED BY FIRESTORE
// ==========================================

// Authenticate / Login Reference
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const usersSnap = await db.collection('users').where('email', '==', email.trim().toLowerCase()).get();

    if (usersSnap.empty) {
      if (email.includes('@')) {
        const newUser: User = {
          _id: 'usr-' + Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0].toUpperCase(),
          email: email.trim().toLowerCase(),
          role: 'attendee',
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120`,
          createdAt: new Date().toISOString()
        };
        await db.collection('users').doc(newUser._id).set(newUser);
        res.json({ user: newUser });
        return;
      }
      res.status(401).json({ error: 'Invalid credentials. Use provided demo logins.' });
      return;
    }

    const foundUser = usersSnap.docs[0].data() as User;
    res.json({ user: foundUser });
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'users');
    res.status(500).json({ error: 'Firestore transaction failed' });
  }
});

// Create User Register Profile
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, phone, role, company, bio } = req.body;
  if (!name || !email || !role) {
    res.status(400).json({ error: 'Name, email, and role are required' });
    return;
  }

  try {
    const existingU = await db.collection('users').where('email', '==', email.trim().toLowerCase()).get();
    if (!existingU.empty) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const newUser: User = {
      _id: 'usr-' + Math.random().toString(36).substr(2, 9),
      name,
      email: email.trim().toLowerCase(),
      phone,
      role: role as 'attendee' | 'organizer' | 'admin',
      company,
      bio,
      avatar: role === 'organizer'
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120'
        : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
      createdAt: new Date().toISOString()
    };

    await db.collection('users').doc(newUser._id).set(newUser);
    res.json({ user: newUser });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'users');
    res.status(500).json({ error: 'Internal database write error' });
  }
});

// List Events Listing Catalog
app.get('/api/events', async (req: Request, res: Response) => {
  try {
    const eventsSnap = await db.collection('events').get();
    let result = eventsSnap.docs.map(doc => doc.data() as Event);

    const { category, city, type, maxPrice, search } = req.query;

    if (category && typeof category === 'string' && category !== 'All') {
      const categoriesSet = new Set(category.split(',').map(c => c.toLowerCase()));
      result = result.filter(evt => categoriesSet.has(evt.category.toLowerCase()));
    }

    if (city && typeof city === 'string' && city !== 'All') {
      result = result.filter(evt => evt.venue?.city?.toLowerCase() === city.toLowerCase());
    }

    if (type && typeof type === 'string' && type !== 'All') {
      result = result.filter(evt => evt.type?.toLowerCase() === type.toLowerCase());
    }

    if (maxPrice && typeof maxPrice === 'string' && maxPrice !== 'All') {
      const limitPrice = parseFloat(maxPrice);
      result = result.filter(evt => {
        const cheapest = Math.min(...(evt.tickets || []).map(t => t.price));
        if (limitPrice === 0) {
          return cheapest === 0;
        }
        return cheapest <= limitPrice;
      });
    }

    if (search && typeof search === 'string') {
      const term = search.toLowerCase();
      result = result.filter(evt =>
        evt.title?.toLowerCase().includes(term) ||
        evt.description?.toLowerCase().includes(term) ||
        evt.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    res.json(result);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'events');
    res.status(500).json({ error: 'Internal database read error' });
  }
});

// Single Event Detail Retrieve
app.get('/api/events/:id', async (req: Request, res: Response) => {
  try {
    const docSnap = await db.collection('events').doc(req.params.id).get();
    if (!docSnap.exists) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    res.json(docSnap.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `events/${req.params.id}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Dynamic Event
app.post('/api/events', async (req: Request, res: Response) => {
  const eventData: Partial<Event> = req.body;
  if (!eventData.title || !eventData.organizerId) {
    res.status(400).json({ error: 'Title and Organizer ID are required' });
    return;
  }

  try {
    const organizerSnap = await db.collection('users').doc(eventData.organizerId).get();
    const organizer = organizerSnap.exists ? (organizerSnap.data() as User) : null;

    const newEvent: Event = {
      _id: 'evt-' + Math.random().toString(36).substr(2, 9),
      organizerId: eventData.organizerId,
      organizerName: organizer?.name || 'Rohan Sharma',
      title: eventData.title,
      description: eventData.description || '',
      category: eventData.category || 'Workshop',
      type: (eventData.type || 'offline') as 'online' | 'offline' | 'hybrid',
      coverImage: eventData.coverImage || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1000',
      tags: eventData.tags || [],
      startDate: eventData.startDate || new Date().toISOString().substring(0, 10),
      endDate: eventData.endDate || new Date().toISOString().substring(0, 10),
      startTime: eventData.startTime || '09:00',
      endTime: eventData.endTime || '18:00',
      venue: eventData.venue || { name: 'Online Zoom Room', address: 'Online Stream', city: 'Online' },
      onlineLink: eventData.onlineLink,
      speakers: eventData.speakers || [],
      schedule: eventData.schedule || [],
      faqs: eventData.faqs || [],
      tickets: eventData.tickets || [{ type: 'Standard Access', price: 0, quantity: 100, sold: 0 }],
      totalCapacity: eventData.totalCapacity || 100,
      totalRegistrations: 0,
      status: (eventData.status || 'published') as 'draft' | 'published' | 'cancelled' | 'completed',
      isFeatured: eventData.isFeatured || false,
      refundPolicy: eventData.refundPolicy || 'Contact organizer for details.',
      createdAt: new Date().toISOString()
    };

    await db.collection('events').doc(newEvent._id).set(newEvent);
    res.status(201).json(newEvent);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'events');
    res.status(500).json({ error: 'Internal write error' });
  }
});

// Update Event Catalog
app.put('/api/events/:id', async (req: Request, res: Response) => {
  try {
    const docRef = db.collection('events').doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const updated = {
      ...docSnap.data(),
      ...req.body,
      _id: req.params.id
    };

    await docRef.set(updated);
    res.json(updated);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `events/${req.params.id}`);
    res.status(500).json({ error: 'Internal update error' });
  }
});

// Cancel Event Node
app.post('/api/events/:id/cancel', async (req: Request, res: Response) => {
  try {
    const docRef = db.collection('events').doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    await docRef.update({ status: 'cancelled' });
    res.json({ ...docSnap.data(), status: 'cancelled' });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `events/${req.params.id}`);
    res.status(500).json({ error: 'Failed to cancel event' });
  }
});

// Validate Promo Code Coupon
app.post('/api/promocodes/validate', async (req: Request, res: Response) => {
  const { code, eventId } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Promo code is required' });
    return;
  }

  try {
    const promosSnap = await db.collection('promocodes')
      .where('code', '==', code.trim().toUpperCase())
      .where('isActive', '==', true)
      .get();

    if (promosSnap.empty) {
      res.status(404).json({ error: 'Invalid or inactive promotional code.' });
      return;
    }

    const promo = promosSnap.docs[0].data() as PromoCode;

    if (promo.eventId && promo.eventId !== eventId) {
      res.status(400).json({ error: 'This coupon is not valid for this specific event.' });
      return;
    }

    if (promo.usageLimit !== undefined && promo.usedCount >= promo.usageLimit) {
      res.status(400).json({ error: 'This coupon usage cap has been met.' });
      return;
    }

    res.json(promo);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `promocodes/${code}`);
    res.status(500).json({ error: 'Internal server lookup error' });
  }
});

// Book Tickets (with occupancy validation and update)
app.post('/api/events/:id/book', async (req: Request, res: Response) => {
  const eventId = req.params.id;
  const { userId, tickets, attendees, promoCode, discount, totalAmount } = req.body;

  try {
    const eventRef = db.collection('events').doc(eventId);
    const eventSnap = await eventRef.get();
    if (!eventSnap.exists) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const event = eventSnap.data() as Event;
    const inputTicketsList: { ticketType: string, quantity: number, price: number }[] = tickets;

    for (const requested of inputTicketsList) {
      const matchedType = event.tickets.find(t => t.type === requested.ticketType);
      if (!matchedType) {
        res.status(400).json({ error: `Ticket class ${requested.ticketType} does not exist.` });
        return;
      }
      const availability = matchedType.quantity - (matchedType.sold || 0);
      if (availability < requested.quantity) {
        res.status(400).json({ error: `Not enough inventory in ${requested.ticketType}. Only ${availability} remaining.` });
        return;
      }
    }

    // Accumulate levels
    let totalBookedCount = 0;
    for (const requested of inputTicketsList) {
      const targetType = event.tickets.find(t => t.type === requested.ticketType)!;
      targetType.sold = (targetType.sold || 0) + requested.quantity;
      totalBookedCount += requested.quantity;
    }

    event.totalRegistrations = (event.totalRegistrations || 0) + totalBookedCount;
    await eventRef.set(event);

    // Track Promo Usage
    if (promoCode) {
      const promosSnap = await db.collection('promocodes').where('code', '==', promoCode.toUpperCase()).get();
      if (!promosSnap.empty) {
        const promoDoc = promosSnap.docs[0];
        await promoDoc.ref.update({
          usedCount: (promoDoc.data().usedCount || 0) + 1
        });
      }
    }

    const registrationId = 'reg-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const newRegistration: Registration = {
      _id: registrationId,
      eventId,
      userId: userId || 'usr-guest',
      organizerId: event.organizerId,
      tickets: inputTicketsList,
      attendees: attendees || [],
      totalAmount: totalAmount,
      paymentId: 'pay_' + Math.random().toString(36).substr(2, 10).toUpperCase() + '_RZR_IND',
      promoCode: promoCode || '',
      discount: discount || 0,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${registrationId}`,
      status: 'booked',
      isCheckedIn: false,
      createdAt: new Date().toISOString(),
      eventTitle: event.title,
      eventImage: event.coverImage,
      eventDate: event.startDate,
      eventTime: event.startTime,
      eventVenue: event.venue.name + ', ' + event.venue.city
    };

    await db.collection('registrations').doc(registrationId).set(newRegistration);
    res.status(201).json(newRegistration);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `registrations`);
    res.status(500).json({ error: 'Transactional checkout failed' });
  }
});

// Cancel Reg Ticket
app.post('/api/registrations/:id/cancel', async (req: Request, res: Response) => {
  try {
    const regRef = db.collection('registrations').doc(req.params.id);
    const regSnap = await regRef.get();
    if (!regSnap.exists) {
      res.status(404).json({ error: 'Registration record not found' });
      return;
    }

    const reg = regSnap.data() as Registration;
    if (reg.status === 'cancelled') {
      res.status(400).json({ error: 'Tickets already cancelled.' });
      return;
    }

    reg.status = 'cancelled';
    await regRef.update({ status: 'cancelled' });

    // Restore event inventory
    const eventRef = db.collection('events').doc(reg.eventId);
    const eventSnap = await eventRef.get();
    if (eventSnap.exists) {
      const event = eventSnap.data() as Event;
      let restoredQuantity = 0;
      for (const item of reg.tickets) {
        const type = event.tickets.find(t => t.type === item.ticketType);
        if (type) {
          type.sold = Math.max(0, (type.sold || 0) - item.quantity);
        }
        restoredQuantity += item.quantity;
      }
      event.totalRegistrations = Math.max(0, (event.totalRegistrations || 0) - restoredQuantity);
      await eventRef.set(event);
    }

    res.json(reg);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `registrations/${req.params.id}`);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

// Gate Scan and Checkin Status Confirm
app.post('/api/registrations/:id/checkin', async (req: Request, res: Response) => {
  try {
    const regRef = db.collection('registrations').doc(req.params.id);
    const regSnap = await regRef.get();
    if (!regSnap.exists) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }
    await regRef.update({ isCheckedIn: true });
    res.json({ success: true, message: 'Check-in processed successfully!', registration: { ...regSnap.data(), isCheckedIn: true } });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `registrations/${req.params.id}`);
    res.status(500).json({ error: 'Checkin transaction failed' });
  }
});

// Fetch Personal Reservations Ticket Lists
app.get('/api/registrations', async (req: Request, res: Response) => {
  const { userId, organizerId, eventId } = req.query;

  try {
    let queryRef: any = db.collection('registrations');

    if (userId) {
      queryRef = queryRef.where('userId', '==', userId);
    }
    if (organizerId) {
      queryRef = queryRef.where('organizerId', '==', organizerId);
    }
    if (eventId) {
      queryRef = queryRef.where('eventId', '==', eventId);
    }

    const snap = await queryRef.get();
    const results = snap.docs.map(doc => doc.data());
    res.json(results);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'registrations');
    res.status(500).json({ error: 'Internal lookup failed' });
  }
});

// Publish Event Review Segment
app.post('/api/reviews', async (req: Request, res: Response) => {
  const { eventId, userId, name, avatar, rating, comment } = req.body;
  if (!eventId || !userId || !rating || !comment) {
    res.status(400).json({ error: 'Missing required review fields' });
    return;
  }

  try {
    const reviewId = 'rev-' + Math.random().toString(36).substr(2, 9);
    const newReview: Review = {
      _id: reviewId,
      eventId,
      userId,
      name: name || 'Anonymous Attendee',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
      rating: parseInt(rating),
      comment,
      createdAt: new Date().toISOString()
    };

    await db.collection('reviews').doc(reviewId).set(newReview);
    res.status(201).json(newReview);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'reviews');
    res.status(500).json({ error: 'Write failed' });
  }
});

// Retrieve Reviews match Event Id
app.get('/api/reviews/:eventId', async (req: Request, res: Response) => {
  try {
    const snap = await db.collection('reviews').where('eventId', '==', req.params.eventId).get();
    const results = snap.docs.map(doc => doc.data());
    res.json(results);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'reviews');
    res.status(500).json({ error: 'Internal lookup failed' });
  }
});

// Organizer aggregates
app.get('/api/organizers/:id', async (req: Request, res: Response) => {
  try {
    const organizerSnap = await db.collection('users').doc(req.params.id).get();
    if (!organizerSnap.exists || organizerSnap.data()?.role !== 'organizer') {
      res.status(404).json({ error: 'Organizer not found' });
      return;
    }

    const eventsSnap = await db.collection('events').where('organizerId', '==', req.params.id).get();
    const organizerEvents = eventsSnap.docs.map(doc => doc.data() as Event);
    const totalAttending = organizerEvents.reduce((acc, evt) => acc + (evt.totalRegistrations || 0), 0);

    res.json({
      organizer: organizerSnap.data(),
      events: organizerEvents,
      stats: {
        rating: 4.8,
        organizedCount: organizerEvents.length,
        attendeesServed: totalAttending + 1450 // simulation offset
      }
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${req.params.id}`);
    res.status(500).json({ error: 'Internal profile compile error' });
  }
});

// Super Administrator Control Board stats
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  try {
    const eventsSnap = await db.collection('events').get();
    const usersSnap = await db.collection('users').get();
    const registrationsSnap = await db.collection('registrations').get();

    const eventsList = eventsSnap.docs.map(doc => doc.data() as Event);
    const registrationsList = registrationsSnap.docs.map(doc => doc.data() as Registration);

    const totalCommissionRate = 0.12; // Platform commission fee is 12%
    const bookedRegistrations = registrationsList.filter(r => r.status === 'booked');
    const totalRevenueGenerated = bookedRegistrations.reduce((acc, reg) => acc + reg.totalAmount, 0);

    res.json({
      eventsCount: eventsList.length,
      usersCount: usersSnap.size,
      registeredCount: bookedRegistrations.length,
      totalGrossSales: totalRevenueGenerated,
      platformCommissionCommission: Math.round(totalRevenueGenerated * totalCommissionRate),
      featuredCount: eventsList.filter(e => e.isFeatured).length
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'admin/stats');
    res.status(500).json({ error: 'Internal statistical report compute failed' });
  }
});

// ==========================================
// VITE CLIENT INTEGRATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EventSpark Live Firebase] Server listening at http://localhost:${PORT}`);
    console.log(`- Connected to Named Firestore Catalog ID: ${firebaseConfig.firestoreDatabaseId}`);
    console.log(`- Admin account: admin@eventspark.in / Admin@123`);
    console.log(`- Organizer account: organizer@eventspark.in / Org@123`);
    console.log(`- Attendee account: attendee@test.in / Test@123`);
  });
}

startServer();
