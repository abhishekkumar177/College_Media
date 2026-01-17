import React, { useEffect, useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import TicketCard from '../components/TicketCard';
import QRScanner from '../components/QRScanner';
import { FaCalendarPlus, FaTicketAlt, FaQrcode, FaSearch, FaMapMarkerAlt, FaUsers, FaExclamationTriangle, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EventsHub: React.FC = () => {
    const { events, tickets, loading, fetchEvents, fetchMyTickets, buyTicket, verifyScannerTicket } = useEvents();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'browse' | 'wallet' | 'checkin'>('browse');
    const [showScanner, setShowScanner] = useState(false);
    const [buyingEvent, setBuyingEvent] = useState<string | null>(null);

    useEffect(() => {
        fetchEvents();
        fetchMyTickets();
    }, []);

    const handleBuy = async (eventId: string, tierName: string, price: number) => {
        if (!window.confirm(`Purchase ${tierName} ticket for ₹${price}?`)) return;

        setBuyingEvent(eventId);
        const success = await buyTicket(eventId, tierName);
        if (success) {
            fetchMyTickets(); // Refresh wallet
            setActiveTab('wallet');
        }
        setBuyingEvent(null);
    };

    const handleScan = async (data: string) => {
        await verifyScannerTicket(data);
        setShowScanner(false); // Close after one scan, or keep open in loop
    };

    return (
        <div className="min-h-screen bg-bg-primary pb-20">
            {/* Header */}
            <div className="bg-bg-secondary border-b border-border py-10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-text-primary mb-2">Events & Fest Hub</h1>
                        <p className="text-text-secondary text-lg">Discover campus life, book tickets, and manage entries.</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'browse' ? 'bg-text-primary text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}`}
                        >
                            Browse Events
                        </button>
                        <button
                            onClick={() => setActiveTab('wallet')}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'wallet' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}`}
                        >
                            <FaTicketAlt /> My Wallet
                        </button>
                        {/* Organizer Only Check - simple check for now */}
                        <button
                            onClick={() => setActiveTab('checkin')}
                            className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'checkin' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-bg-tertiary text-text-secondary hover:bg-border'}`}
                        >
                            <FaQrcode /> Organizer
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* BROWSE TAB */}
                {activeTab === 'browse' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {loading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-64 bg-bg-secondary rounded-3xl animate-pulse" />)
                        ) : events.map(event => (
                            <div key={event._id} className="bg-bg-secondary rounded-3xl overflow-hidden border border-border group hover:shadow-2xl transition-all duration-300">
                                {/* Banner */}
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    <img
                                        src={event.bannerUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80'}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-black">
                                        {event.category}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-2xl font-black text-text-primary mb-2 line-clamp-1">{event.title}</h3>

                                    <div className="flex flex-col gap-2 text-sm text-text-secondary mb-6">
                                        <div className="flex items-center gap-2">
                                            <FaCalendarAlt className="text-brand-primary" />
                                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-brand-tertiary" />
                                            {event.location}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaUsers className="text-blue-500" />
                                            Expected: {event.expectedAttendance || 'N/A'} • Risk:
                                            <span className={`${(event.aiRiskScore || 0) > 60 ? 'text-red-500' : 'text-green-500'} font-bold flex items-center gap-1`}>
                                                {(event.aiRiskScore || 0) > 60 && <FaExclamationTriangle />}
                                                {event.aiRiskScore || 'Low'}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {event.ticketTiers.map((tier, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-xl border border-transparent hover:border-brand-primary/30 transition-colors">
                                                <div>
                                                    <div className="font-bold text-text-primary text-sm">{tier.name}</div>
                                                    <div className="text-[10px] text-text-secondary">{tier.quantity - tier.sold} left</div>
                                                </div>
                                                <button
                                                    disabled={tier.sold >= tier.quantity || buyingEvent === event._id}
                                                    onClick={() => handleBuy(event._id, tier.name, tier.price)}
                                                    className="px-4 py-2 bg-text-primary text-white text-xs font-bold rounded-lg hover:bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {tier.sold >= tier.quantity ? 'SOLD OUT' : `₹${tier.price}`}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* WALLET TAB */}
                {activeTab === 'wallet' && (
                    <div className="space-y-8">
                        {tickets.length === 0 ? (
                            <div className="text-center py-20">
                                <FaTicketAlt className="text-6xl text-bg-tertiary mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-text-secondary">Your wallet is empty</h3>
                            </div>
                        ) : (
                            tickets.map(ticket => <TicketCard key={ticket._id} ticket={ticket} />)
                        )}
                    </div>
                )}

                {/* CHECK-IN TAB */}
                {activeTab === 'checkin' && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        <div className="text-center max-w-md mb-8">
                            <h2 className="text-2xl font-black text-text-primary mb-2">Organizer Check-in</h2>
                            <p className="text-text-secondary">Scan attendee QR codes to validate entry. Ensure you have organizer permissions for the event.</p>
                        </div>

                        {!showScanner ? (
                            <button
                                onClick={() => setShowScanner(true)}
                                className="w-64 h-64 bg-bg-secondary border-4 border-dashed border-brand-primary rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-bg-tertiary transition-all group"
                            >
                                <FaQrcode className="text-6xl text-brand-primary group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-text-primary">Launch Scanner</span>
                            </button>
                        ) : (
                            <div className="w-full max-w-md">
                                <p className="text-center mb-4 font-bold text-green-500 animate-pulse">Scanner Active...</p>
                                {/* We mount the scanner in a portal or modal normally, here inline just for structure */}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scanner Modal */}
            {showScanner && (
                <QRScanner
                    onScan={handleScan}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
};

export default EventsHub;
