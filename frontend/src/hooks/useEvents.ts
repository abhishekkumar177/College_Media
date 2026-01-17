import { useState, useCallback } from 'react';
import { eventsApi } from '../api/endpoints';
import { Event, Ticket } from '../types';
import { toast } from 'react-hot-toast';

export const useEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await eventsApi.getAll();
            setEvents(response.data.data);
        } catch (error) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMyTickets = useCallback(async () => {
        try {
            const response = await eventsApi.getMyTickets();
            setTickets(response.data.data);
        } catch (error) {
            toast.error('Failed to load your tickets');
        }
    }, []);

    const buyTicket = async (eventId: string, tierName: string) => {
        try {
            // Simulate "Processing"
            const promise = eventsApi.purchaseTicket(eventId, tierName);
            await toast.promise(promise, {
                loading: 'Generating Secure Ticket...',
                success: 'Ticket Purchased! Check your wallet.',
                error: (err) => err.response?.data?.message || 'Transaction failed'
            });
            return true;
        } catch (error: any) {
            return false;
        }
    };

    const verifyScannerTicket = async (token: string) => {
        try {
            const { data } = await eventsApi.verifyTicket(token);
            toast.success('Valid Ticket! Entry Allowed.');
            return data.ticket;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid Ticket');
            return null;
        }
    };

    return {
        events,
        tickets,
        loading,
        fetchEvents,
        fetchMyTickets,
        buyTicket,
        verifyScannerTicket
    };
};
