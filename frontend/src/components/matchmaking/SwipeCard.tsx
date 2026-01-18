import React, { useEffect, useRef, useState } from 'react';
import './SwipeCard.css';

interface Match {
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    courses?: Array<{ name: string } | string>;
    skills?: string[];
    interests?: string[];
    learningStyle?: string;
    department?: string;
  };
  compatibilityScore: number;
  matchReasons: string[];
  vectorSimilarity: number;
}

interface SwipeCardProps {
  match: Match;
  onSwipe: (action: 'like' | 'pass' | 'superlike') => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ match, onSwipe }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        animateSwipe('left');
      } else if (e.key === 'ArrowRight') {
        animateSwipe('right');
      } else if (e.key === 'ArrowUp') {
        animateSwipe('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - startX);
    setOffsetY(e.clientY - startY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Determine swipe action based on offset
    if (Math.abs(offsetX) > 100) {
      if (offsetX > 0) {
        animateSwipe('right');
      } else {
        animateSwipe('left');
      }
    } else if (offsetY < -100) {
      animateSwipe('up');
    } else {
      // Reset position
      setOffsetX(0);
      setOffsetY(0);
    }
  };

  const animateSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    
    if (direction === 'left') {
      card.style.transform = 'translateX(-150%) rotate(-30deg)';
      setTimeout(() => onSwipe('pass'), 300);
    } else if (direction === 'right') {
      card.style.transform = 'translateX(150%) rotate(30deg)';
      setTimeout(() => onSwipe('like'), 300);
    } else if (direction === 'up') {
      card.style.transform = 'translateY(-150%) scale(1.1)';
      setTimeout(() => onSwipe('superlike'), 300);
    }
  };

  const handleButtonClick = (action: 'like' | 'pass' | 'superlike') => {
    if (action === 'like') {
      animateSwipe('right');
    } else if (action === 'pass') {
      animateSwipe('left');
    } else {
      animateSwipe('up');
    }
  };

  const getCourseNames = () => {
    if (!match.user.courses) return [];
    return match.user.courses.map(c => 
      typeof c === 'string' ? c : c.name
    );
  };

  const getCompatibilityColor = () => {
    if (match.compatibilityScore >= 80) return '#28a745';
    if (match.compatibilityScore >= 60) return '#ffc107';
    return '#ff6b6b';
  };

  return (
    <div className="swipe-card-wrapper">
      <div
        ref={cardRef}
        className={`swipe-card ${isDragging ? 'dragging' : ''}`}
        style={{
          transform: isDragging 
            ? `translate(${offsetX}px, ${offsetY}px) rotate(${offsetX * 0.1}deg)`
            : 'translate(0, 0) rotate(0deg)'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Compatibility Badge */}
        <div 
          className="compatibility-badge"
          style={{ background: getCompatibilityColor() }}
        >
          <i className="fas fa-heart"></i>
          {match.compatibilityScore}%
        </div>

        {/* Profile Image */}
        <div className="card-image">
          {match.user.profilePicture ? (
            <img src={match.user.profilePicture} alt={match.user.name} />
          ) : (
            <div className="default-avatar">
              <i className="fas fa-user"></i>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="card-content">
          <div className="card-header">
            <h2>{match.user.name}</h2>
            {match.user.department && (
              <p className="department">
                <i className="fas fa-graduation-cap"></i>
                {match.user.department}
              </p>
            )}
          </div>

          {match.user.bio && (
            <p className="bio">{match.user.bio}</p>
          )}

          {/* Learning Style */}
          {match.user.learningStyle && (
            <div className="info-item">
              <i className="fas fa-brain"></i>
              <span className="label">Learning Style:</span>
              <span className="value">
                {match.user.learningStyle.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* Courses */}
          {getCourseNames().length > 0 && (
            <div className="info-section">
              <h4>
                <i className="fas fa-book"></i> Courses
              </h4>
              <div className="tags">
                {getCourseNames().slice(0, 3).map((course, index) => (
                  <span key={index} className="tag course-tag">
                    {course}
                  </span>
                ))}
                {getCourseNames().length > 3 && (
                  <span className="tag more-tag">
                    +{getCourseNames().length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {match.user.skills && match.user.skills.length > 0 && (
            <div className="info-section">
              <h4>
                <i className="fas fa-star"></i> Skills
              </h4>
              <div className="tags">
                {match.user.skills.slice(0, 5).map((skill, index) => (
                  <span key={index} className="tag skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {match.user.interests && match.user.interests.length > 0 && (
            <div className="info-section">
              <h4>
                <i className="fas fa-heart"></i> Interests
              </h4>
              <div className="tags">
                {match.user.interests.slice(0, 5).map((interest, index) => (
                  <span key={index} className="tag interest-tag">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Match Reasons */}
          {match.matchReasons && match.matchReasons.length > 0 && (
            <div className="match-reasons">
              <h4>
                <i className="fas fa-lightbulb"></i> Why You Match
              </h4>
              <ul>
                {match.matchReasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Details Toggle */}
          <button 
            className="btn-details"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Show Less' : 'Show More Details'}
            <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`}></i>
          </button>

          {showDetails && (
            <div className="additional-details">
              <div className="detail-item">
                <span className="detail-label">Vector Similarity:</span>
                <span className="detail-value">
                  {(match.vectorSimilarity * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Swipe Indicators */}
        <div className={`swipe-indicator swipe-left ${offsetX < -50 ? 'active' : ''}`}>
          <i className="fas fa-times"></i>
          PASS
        </div>
        <div className={`swipe-indicator swipe-right ${offsetX > 50 ? 'active' : ''}`}>
          <i className="fas fa-heart"></i>
          LIKE
        </div>
        <div className={`swipe-indicator swipe-up ${offsetY < -50 ? 'active' : ''}`}>
          <i className="fas fa-star"></i>
          SUPER LIKE
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        <button 
          className="action-btn btn-pass"
          onClick={() => handleButtonClick('pass')}
          title="Pass (←)"
        >
          <i className="fas fa-times"></i>
        </button>
        <button 
          className="action-btn btn-superlike"
          onClick={() => handleButtonClick('superlike')}
          title="Super Like (↑)"
        >
          <i className="fas fa-star"></i>
        </button>
        <button 
          className="action-btn btn-like"
          onClick={() => handleButtonClick('like')}
          title="Like (→)"
        >
          <i className="fas fa-heart"></i>
        </button>
      </div>
    </div>
  );
};

export default SwipeCard;
