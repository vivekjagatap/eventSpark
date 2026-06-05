import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useEventSpark } from '../context/EventSparkContext';
import { Confetti } from '../components/Confetti';
import { Event, Registration, AttendeeDetail, RegisteredTicket } from '../types';
import { Calendar, MapPin, ShieldCheck, Ticket, Users, ArrowRight, ArrowLeft, ArrowUpRight, Percent, ArrowDown, Printer, Clipboard, Share2, DollarSign } from 'lucide-react';

export const TicketBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { getEventById, bookTickets, validatePromo, isLightMode, currentUser, showToast } = useEventSpark();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Configuration Parameters
  const [ticketClass, setTicketClass] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState(0);

  // Form Inputs
  const [attendees, setAttendees] = useState<AttendeeDetail[]>([]);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // Completion State
  const [bookingResult, setBookingResult] = useState<Registration | null>(null);

  // Initialize selected slots
  useEffect(() => {
    let active = true;
    const fetchEventData = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getEventById(id);
      if (active) {
        if (data) {
          setEvent(data);
          
          // Hydrate from state navigation values if present
          const stateValues = location.state as { selectedClass: string; quantity: number; price: number };
          if (stateValues) {
            setTicketClass(stateValues.selectedClass);
            setQuantity(stateValues.quantity);
            setPricePerUnit(stateValues.price);
            
            // Generate list inputs matching volume
            const inputs = Array.from({ length: stateValues.quantity }).map(() => ({
              name: currentUser?.name || '',
              email: currentUser?.email || '',
              phone: currentUser?.phone || ''
            }));
            setAttendees(inputs);
          } else {
            // standard default fallback
            setTicketClass(data.tickets[0]?.type || '');
            setPricePerUnit(data.tickets[0]?.price || 0);
            setAttendees([{ name: currentUser?.name || '', email: currentUser?.email || '', phone: currentUser?.phone || '' }]);
          }
        }
        setLoading(false);
      }
    };
    fetchEventData();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!event || !ticketClass) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] text-white">
        <h2 className="text-xl font-bold font-serif mb-4">No Active Seat Booking Context Found</h2>
        <Link to="/events" className="text-primary hover:underline">Return to Events catalog</Link>
      </div>
    );
  }

  const subtotal = pricePerUnit * quantity;
  const netTotal = Math.max(0, subtotal - discountAmount);

  // Form check
  const isFormValid = () => {
    return attendees.every(a => a.name.trim() !== '' && a.email.trim() !== '' && a.phone.trim() !== '');
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    const result = await validatePromo(promoCodeInput, event._id);
    if (result) {
      setAppliedPromo(result);
      if (result.discountType === 'percentage') {
        const discountValue = Math.round(subtotal * (result.discountValue / 100));
        setDiscountAmount(discountValue);
      } else {
        setDiscountAmount(result.discountValue);
      }
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
    setIsPaying(true);
    setTimeout(async () => {
      // Create registered payload
      const payload = {
        eventId: event._id,
        tickets: [{ ticketType: ticketClass, quantity, price: pricePerUnit }],
        attendees,
        promoCode: appliedPromo?.code || '',
        discount: discountAmount,
        totalAmount: netTotal
      };

      const result = await bookTickets(payload);
      setIsPaying(false);
      setShowPaymentModal(false);
      if (result) {
        setBookingResult(result);
      }
    }, 2000); // simulated payment wait gateway
  };

  const handleAttendeeChange = (idx: number, field: keyof AttendeeDetail, value: string) => {
    const updated = [...attendees];
    updated[idx] = { ...updated[idx], [field]: value };
    setAttendees(updated);
  };

  // Browser printable helper
  const triggerPrintTicket = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen py-12 transition-colors duration-200 ${
      isLightMode ? 'bg-slate-50 text-gray-900' : 'bg-[#080808] text-white'
    }`}>
      
      {/* Visual Confetti fireworks on successful booking */}
      {bookingResult && <Confetti />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* PROGRESS STEPPER HEADER */}
        <div className="mb-10 text-center select-none">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wide">
            {bookingResult ? 'Reservations Confirmed!' : 'Securing Gate Pass'}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold select-none ${
              bookingResult ? 'bg-zinc-800 text-gray-400 border border-zinc-700' : 'bg-primary text-white'
            }`}>
              1. Information
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold select-none ${
              bookingResult ? 'bg-primary text-white' : 'bg-zinc-900 text-gray-500 border border-transparent'
            }`}>
              2. Passes Confirmed
            </span>
          </div>
        </div>

        {/* ======================================= */}
        {/* CONDITIONAL SUB CLUSTERS: CHECKOUT FORM VS CONFIRMED TICKET */}
        {/* ======================================= */}
        {!bookingResult ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* LEFT 2-COLS: ATTENDEES FORM DETAILS */}
            <div className="md:col-span-2 space-y-6">
              
              <div className={`p-6 rounded-2xl border ${
                isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-850'
              }`}>
                <h3 className="font-serif text-lg font-bold text-white mb-4 border-b border-zinc-900 pb-2">
                  Attendee Information
                </h3>

                <p className="text-[11px] text-gray-400 mb-6 font-sans leading-relaxed">
                  Provide credentials for each pass. E-tickets and digital QR checks will be dispatched to these emails.
                </p>

                <div className="space-y-6">
                  {attendees.map((att, idx) => (
                    <div key={idx} className="border border-zinc-900 p-4 rounded-xl bg-zinc-900/10 text-left">
                      <div className="font-serif font-bold text-xs text-primary uppercase tracking-widest mb-3">
                        Pass #{idx + 1} ({ticketClass})
                      </div>
                      
                      <div className="space-y-3 font-sans">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={att.name}
                            onChange={(e) => handleAttendeeChange(idx, 'name', e.target.value)}
                            placeholder="e.g. Amit Patel"
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Email Address</label>
                            <input
                              type="email"
                              required
                              value={att.email}
                              onChange={(e) => handleAttendeeChange(idx, 'email', e.target.value)}
                              placeholder="amit@test.in"
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Mobile Phone</label>
                            <input
                              type="tel"
                              required
                              value={att.phone}
                              onChange={(e) => handleAttendeeChange(idx, 'phone', e.target.value)}
                              placeholder="9988776655"
                              className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary/50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CANCEL & RETURN GUIDE */}
              <button
                onClick={() => navigate(`/events/${event._id}`)}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Adjust ticket parameters</span>
              </button>

            </div>

            {/* RIGHT SIDEBAR: ORDER SUMMARY & PAYMENT SUMMARY */}
            <div className="space-y-6">
              
              <div className={`p-6 rounded-2xl border ${
                isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-850'
              }`}>
                <h3 className="font-serif text-base font-bold text-white mb-3">Order Summary</h3>
                
                <div className="border-b border-zinc-900 pb-3 mb-4 text-xs space-y-2">
                  <div className="flex justify-between font-bold text-gray-300">
                    <span className="line-clamp-1">{event.title}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>{quantity}x {ticketClass}</span>
                    <span>₹{subtotal}</span>
                  </div>
                </div>

                {/* Promo Code Input panel */}
                <div className="mb-6 space-y-2 select-none">
                  <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-wider">Apply Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SPARK20"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none uppercase"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-white font-sans text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="text-[10px] text-green-400 font-semibold flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      <span>Code "{appliedPromo.code}" applied successfully! Saved ₹{discountAmount}</span>
                    </div>
                  )}
                </div>

                {/* TOTAL SUMMARY GRID */}
                <div className="space-y-2.5 text-xs border-t border-zinc-900 pt-4 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-900 pt-2.5">
                    <span>Net Amount</span>
                    <span className="text-pink-400 text-base">₹{netTotal}</span>
                  </div>
                </div>

                {/* PROCEED TRIGGER */}
                <button
                  type="button"
                  onClick={() => {
                    if (isFormValid()) {
                      setShowPaymentModal(true);
                    } else {
                      showToast('Please fulfill all Attendee form parameters.', 'error');
                    }
                  }}
                  className={`w-full py-3.5 rounded-xl text-white font-sans text-xs uppercase tracking-widest font-bold transition-all ${
                    isFormValid() 
                      ? 'bg-gradient-to-r from-primary to-accent hover:opacity-95 shadow-lg shadow-primary/10 cursor-pointer'
                      : 'bg-zinc-800 border border-zinc-750 text-gray-500 cursor-not-allowed opacity-40'
                  }`}
                >
                  Pay secure with Razorpay
                </button>
              </div>

              {/* SECURE MARKERS */}
              <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-[10px] text-gray-500 flex items-center gap-3 select-none">
                <ShieldCheck className="w-8 h-8 text-green-400 shrink-0" />
                <p className="leading-normal">
                  EventSpark utilizes 256-bit encrypted SSL token tunnels. Your mock payment processes securely with Razorpay India gates.
                </p>
              </div>

            </div>

          </div>
        ) : (
          
          /* ======================================= */
          /* SUCCESS SUB SCREEN: PRINTABLE DIGITAL TICKET */
          /* ======================================= */
          <div className="max-w-lg mx-auto space-y-8 select-text animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* COMPLETED SUCCESS LOGO BACKGROUND */}
            <div className="text-center mb-4 select-none">
              <div className="inline-flex items-center justify-center bg-green-500/10 p-4 rounded-full text-green-400 mb-3 border border-green-500/20">
                <ShieldCheck className="w-10 h-10 animate-pulse" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-1">Admission Passes Secured</h2>
              <p className="text-xs text-gray-400">Transaction Code: <b className="font-mono text-gray-300 font-bold">{bookingResult.paymentId}</b></p>
            </div>

            {/* ARTISTIC TICKET GRAPHIC CANVAS */}
            <div id="print-ticket-area" className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-[#111111] shadow-2xl">
              
              {/* Cover Card Image Accent */}
              <div className="h-32 w-full relative">
                <img 
                  src={event.coverImage} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-black/30" />
                <div className="absolute bottom-3 left-4 text-xs font-bold font-mono tracking-widest text-[#F59E0B] uppercase">
                  ⭐ Platform General Admission ⭐
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white tracking-wide mb-1 select-all">{event.title}</h3>
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono mt-1 select-none">
                    <span>{new Date(event.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>|</span>
                    <span>{event.startTime} IST</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border-y border-zinc-800/80 py-4 select-none">
                  <div>
                    <span className="text-gray-500 block mb-0.5">Ticket Class</span>
                    <span className="font-semibold text-white">{ticketClass}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Quantity</span>
                    <span className="font-semibold text-white">{quantity} Pass(es)</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Location Hub</span>
                    <span className="font-semibold text-white line-clamp-1">{event.venue.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">Town City</span>
                    <span className="font-semibold text-white">{event.venue.city}</span>
                  </div>
                </div>

                {/* TEAR OFF RADIAL EDGE HELPER MARKS */}
                <div className="relative h-2 select-none border-b border-dashed border-zinc-800 pb-2 mb-2">
                  <div className="absolute -left-[32px] -top-1.5 w-6 h-6 rounded-full bg-[#080808] border-r border-zinc-800" />
                  <div className="absolute -right-[32px] -top-1.5 w-6 h-6 rounded-full bg-[#080808] border-l border-zinc-800" />
                </div>

                {/* FOOTER BAR: QR CODE & INSTRUCTIONS */}
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-between text-left">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold select-none">Primary Attendee</span>
                      <span className="text-sm font-bold text-white block">{attendees[0]?.name || 'Amit Patel'}</span>
                      <span className="text-xs text-gray-400 block">{attendees[0]?.email || 'attendee@test.in'}</span>
                    </div>

                    <div className="text-[10px] text-gray-500 leading-normal select-none">
                      ⚠️ Show this digital barcode screen or print voucher at the entry doors to check-in.
                    </div>
                  </div>

                  {/* QR Core Graphic */}
                  <div className="p-3 bg-white rounded-2xl select-none flex items-center justify-center shrink-0 border-4 border-accent/25">
                    <img
                      src={bookingResult.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingResult._id}`}
                      alt="Verified Admission QR"
                      className="w-28 h-28"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* ACTION CONTROLS FOR SUCCESS TICKET */}
            <div className="flex flex-col sm:flex-row gap-3 select-none">
              <button
                onClick={triggerPrintTicket}
                className="flex-1 bg-white hover:bg-white/90 text-black py-3.5 rounded-xl font-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print/Download PDF
              </button>

              <Link
                to="/my-tickets"
                className="flex-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white py-3.5 rounded-xl font-sans text-xs tracking-widest font-bold uppercase flex items-center justify-center gap-1.5 text-center transition-all"
              >
                <Ticket className="w-4 h-4" />
                Browse My Tickets
              </Link>
            </div>

          </div>
        )}

      </div>

      {/* ======================================= */}
      {/* SIMULATED RAZORPAY BILL OVERLAY PAYMENT MODAL */}
      {/* ======================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-[#121212] border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 text-left shadow-2xl relative">
            
            {/* Modal branding */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white font-bold text-xs font-mono">
                  R
                </div>
                <div>
                  <span className="text-xs font-bold block text-white">Razorpay Checkout</span>
                  <span className="text-[9px] text-gray-500 uppercase block tracking-wider">Secure Payment Gateway</span>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-xs text-gray-500 hover:text-white"
                disabled={isPaying}
              >
                Cancel
              </button>
            </div>

            <h3 className="font-serif text-lg font-bold text-white mb-4">Confirm Payment Account</h3>
            
            <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl mb-6 text-xs text-blue-400 flex justify-between items-center select-none font-sans">
              <span>Amount payable:</span>
              <span className="font-bold text-lg text-white">₹{netTotal}</span>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Simulated Card-Number</label>
                <input
                  type="text"
                  required
                  placeholder="4111 2222 3333 4444"
                  maxLength={19}
                  value={cardNo}
                  onChange={(e) => setCardNo(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">CVV / Check</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="***"
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>
              </div>

              <div className="text-[9px] text-gray-500 leading-normal select-none">
                ℹ️ Input any mock parameters above to simulation process checkout. No actual money transactions take place.
              </div>

              <button
                type="submit"
                disabled={isPaying}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 rounded-xl shadow-lg mt-6"
              >
                {isPaying ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Authorizing Token Gateway...</span>
                  </div>
                ) : (
                  <span>Verify and Pay ₹{netTotal}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
