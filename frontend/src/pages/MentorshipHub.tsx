import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGraduationCap, FaFilter, FaSearch, FaUserCircle, FaSparkles } from 'react-icons/fa';
import { mentorshipApi } from '../api/endpoints';
import { MentorProfile } from '../types';
import MentorCard from '../components/MentorCard';
import BookingCalendar from '../components/BookingCalendar';
import { toast } from 'react-hot-toast';

const MentorshipHub: React.FC = () => {
    const { t } = useTranslation();
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        try {
            setLoading(true);
            const response = await mentorshipApi.getMatches();
            if (response.data.success) {
                setMentors(response.data.data);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch mentors');
        } finally {
            setLoading(false);
        }
    };

    const handleBookSession = async (day: string, slotId: string) => {
        if (!selectedMentor) return;

        try {
            setIsBooking(true);
            const response = await mentorshipApi.bookSession(selectedMentor._id, { day, slotId });
            if (response.data.success) {
                toast.success(t('mentorship.bookingSuccess'));
                setSelectedMentor(null);
                fetchMentors(); // Refresh to show slot as booked
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setIsBooking(false);
        }
    };

    const filteredMentors = mentors.filter(m =>
        m.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.userId as any).username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-bold mb-4">
                    <FaSparkles className="animate-pulse" />
                    {t('mentorship.aiPowered')}
                </div>
                <h1 className="text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
                    {t('mentorship.title')}
                </h1>
                <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
                    {t('mentorship.subtitle')}
                </p>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Mentors List */}
                <div className="w-full lg:w-3/5 xl:w-2/3">
                    <div className="mb-8 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="text"
                                placeholder={t('mentorship.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-bg-secondary border border-border rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm group-hover:shadow-md"
                            />
                        </div>
                        <button className="px-6 py-4 bg-bg-secondary border border-border rounded-2xl flex items-center justify-center gap-2 text-text-primary hover:bg-bg-tertiary transition-colors shadow-sm">
                            <FaFilter className="text-brand-primary" />
                            {t('common.filter')}
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 bg-bg-secondary rounded-2xl animate-pulse border border-border" />
                            ))}
                        </div>
                    ) : filteredMentors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredMentors.map(mentor => (
                                <MentorCard
                                    key={mentor._id}
                                    mentor={mentor}
                                    onViewDetail={(m) => setSelectedMentor(m)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-bg-secondary rounded-3xl border border-dashed border-border shadow-inner">
                            <FaUserCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-text-primary">{t('mentorship.noMatches')}</h3>
                            <p className="text-text-muted">{t('mentorship.noMatchesSub')}</p>
                        </div>
                    )}
                </div>

                {/* Right: Booking Side Panel */}
                <div className="w-full lg:w-2/5 xl:w-1/3">
                    {selectedMentor ? (
                        <div className="sticky top-24">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-text-primary">{t('mentorship.bookingSession')}</h2>
                                <button
                                    onClick={() => setSelectedMentor(null)}
                                    className="text-brand-primary text-sm font-bold hover:underline"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>

                            <div className="bg-bg-secondary rounded-2xl p-6 mb-6 border border-border shadow-lg">
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={(selectedMentor.userId as any).profilePicture || 'https://via.placeholder.com/150'}
                                        alt={(selectedMentor.userId as any).username}
                                        className="w-14 h-14 rounded-xl object-cover"
                                    />
                                    <div>
                                        <h4 className="font-bold text-text-primary">{(selectedMentor.userId as any).username}</h4>
                                        <p className="text-sm text-text-muted">{selectedMentor.major}</p>
                                    </div>
                                </div>
                                <div className="bg-bg-tertiary p-3 rounded-lg text-sm text-text-secondary border border-border">
                                    {selectedMentor.bio}
                                </div>
                            </div>

                            <BookingCalendar
                                availability={selectedMentor.availability}
                                onBook={handleBookSession}
                                isBooking={isBooking}
                            />
                        </div>
                    ) : (
                        <div className="sticky top-24 bg-gradient-to-br from-brand-primary/5 to-transparent rounded-3xl p-8 border border-brand-primary/10 text-center">
                            <div className="w-20 h-20 bg-white dark:bg-bg-secondary rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                <FaGraduationCap className="w-10 h-10 text-brand-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary mb-4">{t('mentorship.whyMentorship')}</h3>
                            <ul className="text-left space-y-4 mb-8">
                                {[
                                    t('mentorship.benefit1'),
                                    t('mentorship.benefit2'),
                                    t('mentorship.benefit3')
                                ].map((text, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-text-secondary leading-relaxed">
                                        <span className="w-5 h-5 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                                            {i + 1}
                                        </span>
                                        {text}
                                    </li>
                                ))}
                            </ul>
                            <div className="p-6 bg-white/50 dark:bg-bg-tertiary/50 backdrop-blur-md rounded-2xl border border-white dark:border-border">
                                <p className="text-sm font-medium text-text-primary">
                                    {t('mentorship.ctaText')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorshipHub;
