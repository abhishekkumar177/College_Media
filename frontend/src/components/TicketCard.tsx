import React from 'react';
import { Ticket } from '../types';
import { FaCalendarAlt, FaMapMarkerAlt, FaQrcode, FaCheckCircle, FaDownload } from 'react-icons/fa';

interface TicketCardProps {
    ticket: Ticket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = ticket.qrCode;
        link.download = `ticket-${ticket.event.title}-${ticket._id}.png`;
        link.click();
    };

    return (
        <div className="bg-bg-secondary rounded-2xl overflow-hidden shadow-lg border border-border flex flex-col md:flex-row max-w-2xl mx-auto relative group">
            {/* Cutout Effect */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-bg-primary rounded-full" />
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-bg-primary rounded-full" />

            {/* Left: QR Code Section */}
            <div className="bg-white p-6 flex flex-col items-center justify-center border-r md:border-r border-dashed border-gray-300 relative">
                <img src={ticket.qrCode} alt="Ticket QR" className="w-32 h-32 object-contain mix-blend-multiply" />
                <div className="text-[10px] text-gray-500 font-mono mt-2 uppercase tracking-widest text-center">
                    {ticket._id.substring(0, 8)}...
                </div>
                {ticket.status === 'Used' && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
                            <FaCheckCircle /> CHECKED IN
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Event Details */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-bold rounded uppercase">
                            {ticket.tierName} Ticket
                        </span>
                        <span className="text-sm font-bold text-text-primary">
                            ₹{ticket.pricePaid}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-text-primary leading-tight mb-2">
                        {ticket.event.title}
                    </h3>
                    <div className="space-y-1 text-xs text-text-secondary">
                        <div className="flex items-center gap-2">
                            <FaCalendarAlt />
                            {new Date(ticket.event.date).toLocaleDateString()} at {new Date(ticket.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <FaMapMarkerAlt /> {ticket.event.location}
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <div className="text-[10px] text-text-secondary">
                        Purchased by <span className="font-bold text-text-primary text-xs">You</span>
                    </div>
                    <button
                        onClick={handleDownload}
                        className="text-xs font-bold flex items-center gap-1 text-brand-primary hover:underline"
                    >
                        <FaDownload /> Save QR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketCard;
