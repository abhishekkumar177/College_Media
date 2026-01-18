import React from 'react';
import { MentorProfile } from '../types';
import { FaGraduationCap, FaStar, FaGlobe, FaArrowRight } from 'react-icons/fa';

interface MentorCardProps {
    mentor: MentorProfile;
    onViewDetail: (mentor: MentorProfile) => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, onViewDetail }) => {
    const { userId, major, yearOfGraduation, rating, skills, matchScore, pricing } = mentor;

    // Normalize user object if it comes populated or just as an object
    const user = userId as any;

    return (
        <div className="bg-bg-secondary rounded-2xl overflow-hidden shadow-xl border border-border group hover:border-brand-primary transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img
                                src={user.profilePicture || 'https://via.placeholder.com/150'}
                                alt={user.username}
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-primary/20"
                            />
                            {matchScore && matchScore > 0 && (
                                <div className="absolute -top-2 -right-2 bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg">
                                    {Math.round(matchScore)}% Match
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                                {user.firstName || user.username} {user.lastName || ''}
                            </h3>
                            <div className="flex items-center gap-2 text-text-muted text-sm">
                                <FaGraduationCap className="text-brand-primary" />
                                <span>{major} ({yearOfGraduation})</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg text-xs font-bold">
                        <FaStar />
                        <span>{rating.average.toFixed(1)}</span>
                        <span className="opacity-60 font-normal">({rating.count})</span>
                    </div>
                    <div className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-lg text-xs font-bold">
                        {pricing.isFree ? 'Free' : `${pricing.amount} ${pricing.currency}/hr`}
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-text-secondary text-sm line-clamp-2 italic">
                        "{mentor.bio}"
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {skills.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-bg-tertiary text-text-primary px-2 py-1 rounded-md text-[10px] border border-border">
                            {skill}
                        </span>
                    ))}
                    {skills.length > 3 && (
                        <span className="text-text-muted text-[10px] flex items-center">+{skills.length - 3} more</span>
                    )}
                </div>

                <button
                    onClick={() => onViewDetail(mentor)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary/10 text-brand-primary rounded-xl font-bold hover:bg-brand-primary hover:text-white transition-all duration-300"
                >
                    Book a Session <FaArrowRight className="text-xs" />
                </button>
            </div>
        </div>
    );
};

export default MentorCard;
