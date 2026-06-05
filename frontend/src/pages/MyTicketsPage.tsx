import React, { useEffect, useState } from 'react';
import { useEventSpark } from '../context/EventSparkContext';
import { Registration } from '../types';
import { Ticket, Calendar, MapPin, Star, ShieldCheck, Printer, Trash2, MessageSquareText, ShieldX, CheckCircle2, Award } from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const { registrations, cancelBooking, addReview, isLightMode, currentUser, showToast } = useEventSpark();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Review states selectors
  const [selectedRegForReview, setSelectedRegForReview] = useState<Registration | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Modal print preview selectors
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<Registration | null>(null);

  // Divide listings
  const upcomingTickets = registrations.filter(r => r.status === 'booked' && !r.isCheckedIn);
  const pastTickets = registrations.filter(r => r.status === 'cancelled' || r.isCheckedIn);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegForReview) return;
    
    setSubmittingReview(true);
    const result = await addReview({
      eventId: selectedRegForReview.eventId,
      rating,
      comment
    });
    setSubmittingReview(false);
    setSelectedRegForReview(null);
    setComment('');
  };

  const handlePrint = (reg: Registration) => {
    setSelectedVoucherCode(reg);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className={`min-h-screen py-12 transition-colors duration-200 ${
      isLightMode ? 'bg-slate-50 text-gray-900' : 'bg-[#080808] text-white'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* UPPER CAPTION */}
        <div className="mb-10 text-left select-none">
          <h1 className="text-4xl font-serif font-bold tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Event Tickets
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Displaying secure booking passes ordered under your active attendee session.
          </p>
        </div>

        {/* TABS SELECTOR UPPER HUD */}
        <div className="border-b border-zinc-900 flex mb-8 select-none">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 font-serif font-bold text-sm uppercase tracking-wider border-b-2 mr-6 transition-colors ${
              activeTab === 'upcoming' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Active Passes ({upcomingTickets.length})
          </button>
          
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3 font-serif font-bold text-sm uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Past & Cancelled ({pastTickets.length})
          </button>
        </div>

        {/* ======================================= */}
        {/* UPCOMING TICKETS CLUSTER */}
        {/* ======================================= */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            {upcomingTickets.length === 0 ? (
              <div className="text-center py-20 bg-zinc-950/20 border border-zinc-900/60 rounded-3xl p-8 select-none">
                <Ticket className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold mb-1">No Active Tickets Found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  You haven't locked active seats yet. Explore our premier catalog to reserve your e-tickets.
                </p>
              </div>
            ) : (
              upcomingTickets.map((reg) => (
                <div 
                  key={reg._id} 
                  className={`rounded-3xl border overflow-hidden flex flex-col md:flex-row transition-colors ${
                    isLightMode ? 'bg-white border-slate-200' : 'bg-zinc-950 border-zinc-850'
                  }`}
                >
                  {/* Left Side cover accent */}
                  <div className="md:w-44 h-32 md:h-auto relative shrink-0 select-none">
                    <img 
                      src={reg.eventImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600'} 
                      alt={reg.eventTitle} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="absolute bottom-3 left-3 bg-primary text-white text-[9px] font-mono font-bold uppercase py-0.5 px-2 rounded">
                      Upcoming Pass
                    </div>
                  </div>

                  {/* Middle Content Description */}
                  <div className="p-6 flex-1 flex flex-col justify-between text-left select-text">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] text-[#F2994A] font-semibold mb-2 select-none uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Admission Confirmed</span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-white mb-2 tracking-wide select-all">
                        {reg.eventTitle}
                      </h3>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-gray-400 font-sans mt-3 select-none">
                        <div className="flex items-center gap-1.5 col-span-2">
                          <Calendar className="w-4 h-4 text-accent shrink-0" />
                          <span>{reg.eventDate ? new Date(reg.eventDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'June 15, 2026'}</span>
                          <span>({reg.eventTime || '09:00'} IST)</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <MapPin className="w-4 h-4 text-gold shrink-0" />
                          <span className="line-clamp-1">{reg.eventVenue}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 mt-4 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block mb-0.5 select-none">Pass type:</span>
                        <span className="font-semibold text-white select-all">{reg.tickets[0]?.quantity}x {reg.tickets[0]?.ticketType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5 select-none font-sans uppercase text-[10px]">Total Paid Amount</span>
                        <span className="font-bold text-pink-400 text-sm">₹{reg.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Tear QR */}
                  <div className="border-t md:border-t-0 md:border-l border-dashed border-zinc-900 p-6 flex flex-col items-center justify-center bg-zinc-950/20 shrink-0 md:w-44 select-none">
                    <img 
                      src={reg.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${reg._id}`} 
                      alt="Pass barcode" 
                      onClick={() => setSelectedVoucherCode(reg)}
                      className="w-20 h-20 rounded-lg cursor-pointer hover:ring-2 hover:ring-primary/45 transition-all mb-4 border border-zinc-800 bg-white p-1"
                    />

                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handlePrint(reg)}
                        className="flex-1 border border-zinc-800 hover:bg-zinc-900 text-white rounded-lg py-1.5 text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                        title="Print Ticket / Get PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        PDF
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('Are you calling refund? Tickets cancellation policies deduct 15% booking commissions.')) {
                            cancelBooking(reg._id);
                          }
                        }}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg py-1.5 text-[10px] font-bold uppercase flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 animate-pulse" />
                        Cancel
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* PAST & CANCELLED HISTORIC TICKETS CLUSTER */}
        {/* ======================================= */}
        {activeTab === 'past' && (
          <div className="space-y-6 select-text text-left">
            {pastTickets.length === 0 ? (
              <div className="text-center py-20 bg-zinc-950/20 border border-zinc-900/60 rounded-3xl p-8 select-none">
                <ShieldX className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="font-serif text-lg font-bold mb-1">No past tickets found</h3>
                <p className="text-xs text-gray-500">Your past completed slots, check-ins, or cancellations appear here.</p>
              </div>
            ) : (
              pastTickets.map((reg) => (
                <div 
                  key={reg._id} 
                  className={`p-6 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    reg.status === 'cancelled' 
                      ? 'bg-zinc-950/20 border-zinc-950 opacity-60' 
                      : isLightMode ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-950 border-zinc-850'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2 select-none">
                      <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                        reg.status === 'cancelled' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/10' 
                          : 'bg-green-500/10 text-green-400 border border-green-500/10'
                      }`}>
                        {reg.status === 'cancelled' ? 'Void / Cancelled' : 'Checked In / Attended'}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">Reference Code: {reg._id}</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-white mb-1">{reg.eventTitle}</h3>
                    <p className="text-xs text-gray-400 font-sans">{reg.eventDate} | {reg.eventVenue}</p>
                  </div>

                  {/* Review feedback buttons context or refund descriptions */}
                  <div>
                    {reg.status === 'cancelled' ? (
                      <span className="text-xs text-red-400 font-medium">Refund Dispatched</span>
                    ) : (
                      <button
                        onClick={() => setSelectedRegForReview(reg)}
                        className="bg-zinc-900 border border-zinc-800 hover:bg-primary hover:border-primary text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <MessageSquareText className="w-4 h-4 text-primary" />
                        Write Review
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* WRITE FEEDBACK SUB PANEL MODAL CHECKOUT */}
        {/* ======================================= */}
        {selectedRegForReview && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
            <div className="bg-[#121212] border border-zinc-850 rounded-3xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95 text-left shadow-2xl relative">
              <h3 className="font-serif text-2xl font-bold text-white mb-2 leading-tight">Write Event Review</h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed font-sans">
                Contribute feedback scores for <b className="text-white">"{selectedRegForReview.eventTitle}"</b>. Help other event planners find top-tier regional planners across India.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-5 font-sans text-xs">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-2">My Rating Score</label>
                  <div className="flex gap-2 text-xl cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`hover:scale-110 transition-transform ${star <= rating ? 'text-[#F59E0B]' : 'text-zinc-700'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Detailed Comment</label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    placeholder="Describe your lighting, logistics, cuisine, track speakers experiences..."
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-primary/50 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedRegForReview(null)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white rounded-xl py-3 font-semibold font-sans text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white rounded-xl py-3 font-bold font-sans text-xs uppercase shadow-xl shadow-primary/10"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* DETAILED QR CODE HIGH-RES MODAL */}
        {/* ======================================= */}
        {selectedVoucherCode && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
            <div className="bg-[#111111] border border-zinc-850 rounded-3xl max-w-xs w-full p-6 text-center animate-in zoom-in-95 shadow-2xl relative">
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-1">Digital Admission Ticket</span>
              <h4 className="font-serif text-lg font-bold text-white mb-4 line-clamp-1">{selectedVoucherCode.eventTitle}</h4>
              
              <div className="bg-white p-3.5 rounded-2xl border-4 border-accent/25 w-fit mx-auto mb-4">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedVoucherCode._id}`} 
                  alt="Voucher QR barcode scanner target" 
                  className="w-48 h-48 select-none"
                />
              </div>

              <div className="text-[11px] text-gray-400 font-mono select-all mb-4">
                TICKET_REF: {selectedVoucherCode._id}
              </div>

              <button
                onClick={() => setSelectedVoucherCode(null)}
                className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white rounded-xl py-2.5 font-sans font-bold text-xs uppercase"
              >
                Close Pass
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
