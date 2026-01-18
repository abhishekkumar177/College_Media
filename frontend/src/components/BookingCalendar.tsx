import React, { useState } from 'react';
import { Availability, TimeSlot } from '../types';
import { FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';

interface BookingCalendarProps {
    availability: Availability[];
    onBook: (day: string, slotId: string) => void;
    isBooking: boolean;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ availability, onBook, isBooking }) => {
    const [selectedDay, setSelectedDay] = useState(availability[0]?.day || '');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const currentDay = availability.find(a => a.day === selectedDay);

    const handleBook = () => {
        if (selectedSlot && selectedDay) {
            onBook(selectedDay, selectedSlot);
        }
    };

    if (availability.length === 0) {
        return (
            <div className="text-center p-8 bg-bg-secondary rounded-2xl border border-dashed border-border">
                <p className="text-text-muted">No availability shared by this mentor yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-bg-secondary rounded-2xl p-6 border border-border shadow-lg">
            <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <FaCalendarAlt className="text-brand-primary" />
                Select a Slot
            </h3>

            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {availability.map((a) => (
                    <button
                        key={a.day}
                        onClick={() => {
                            setSelectedDay(a.day);
                            setSelectedSlot(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${selectedDay === a.day
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-tertiary/80'
                            }`}
                    >
                        {a.day}
                    </button>
                ))}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {currentDay?.slots.map((slot) => (
                    <button
                        key={slot._id}
                        disabled={slot.isBooked}
                        onClick={() => setSelectedSlot(slot._id)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${slot.isBooked
                                ? 'bg-bg-tertiary opacity-40 cursor-not-allowed border-transparent'
                                : selectedSlot === slot._id
                                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold'
                                    : 'bg-bg-secondary border-border hover:border-brand-primary/50 text-text-secondary'
                            }`}
                    >
                        <FaClock className="text-[10px]" />
                        <span className="text-sm">{slot.start} - {slot.end}</span>
                    </button>
                ))}
            </div>

            <button
                onClick={handleBook}
                disabled={!selectedSlot || isBooking}
                className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-primary/20"
            >
                {isBooking ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <FaCheckCircle />
                        Confirm Booking
                    </>
                )}
            </button>
        </div>
    );
};

export default BookingCalendar;
