import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SwipeCard from '../components/matchmaking/SwipeCard';
import AIChatWindow from '../components/matchmaking/AIChatWindow';
import './Matchmaker.css';

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

const Matchmaker: React.FC = () => {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [matchedUser, setMatchedUser] = useState<Match | null>(null);
  const [stats, setStats] = useState({ liked: 0, passed: 0, matches: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchNextMatch();
  }, []);

  const fetchNextMatch = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/matchmaking/next?excludeIds=${JSON.stringify(seenIds)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch match');
      }

      if (data.match) {
        setCurrentMatch(data.match);
        setSeenIds(prev => [...prev, data.match.user._id]);
      } else {
        setCurrentMatch(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: 'like' | 'pass' | 'superlike') => {
    if (!currentMatch) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/matchmaking/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: currentMatch.user._id,
          action
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to record interaction');
      }

      // Update stats
      if (action === 'like' || action === 'superlike') {
        setStats(prev => ({ ...prev, liked: prev.liked + 1 }));
      } else {
        setStats(prev => ({ ...prev, passed: prev.passed + 1 }));
      }

      // Check for mutual match
      if (data.mutualMatch) {
        setStats(prev => ({ ...prev, matches: prev.matches + 1 }));
        setMatchedUser(currentMatch);
        setShowChat(true);
      } else {
        // Fetch next match
        fetchNextMatch();
      }
    } catch (err: any) {
      console.error('Error recording interaction:', err);
      // Still move to next match even if recording fails
      fetchNextMatch();
    }
  };

  const handleChatClose = () => {
    setShowChat(false);
    setMatchedUser(null);
    fetchNextMatch();
  };

  const handleRefresh = () => {
    setSeenIds([]);
    fetchNextMatch();
  };

  const handleViewMatches = () => {
    navigate('/matches');
  };

  if (loading && !currentMatch) {
    return (
      <div className="matchmaker-container">
        <div className="matchmaker-loading">
          <div className="loading-spinner"></div>
          <p>Finding your perfect study buddy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matchmaker-container">
        <div className="matchmaker-error">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={fetchNextMatch} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentMatch && !loading) {
    return (
      <div className="matchmaker-container">
        <div className="matchmaker-empty">
          <i className="fas fa-user-friends"></i>
          <h2>No More Matches</h2>
          <p>You've seen all available study buddies! Check back later for new matches.</p>
          <div className="empty-actions">
            <button onClick={handleRefresh} className="btn-refresh">
              <i className="fas fa-redo"></i> Start Over
            </button>
            <button onClick={handleViewMatches} className="btn-view-matches">
              <i className="fas fa-list"></i> View All Matches
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="matchmaker-container">
      {/* Header */}
      <div className="matchmaker-header">
        <div className="header-left">
          <h1>
            <i className="fas fa-heart"></i> Study Buddy Matchmaker
          </h1>
          <p className="subtitle">Swipe to find your perfect study partner</p>
        </div>
        <div className="header-right">
          <div className="stats">
            <div className="stat-item">
              <i className="fas fa-heart text-success"></i>
              <span>{stats.liked}</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-times text-danger"></i>
              <span>{stats.passed}</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-star text-warning"></i>
              <span>{stats.matches}</span>
            </div>
          </div>
          <button onClick={handleViewMatches} className="btn-matches">
            <i className="fas fa-list"></i> My Matches
          </button>
        </div>
      </div>

      {/* Swipe Area */}
      <div className="matchmaker-content">
        {currentMatch && (
          <SwipeCard
            match={currentMatch}
            onSwipe={handleSwipe}
          />
        )}
      </div>

      {/* Instructions */}
      <div className="matchmaker-instructions">
        <div className="instruction-item">
          <i className="fas fa-arrow-left text-danger"></i>
          <span>Swipe left or press <kbd>←</kbd> to pass</span>
        </div>
        <div className="instruction-item">
          <i className="fas fa-arrow-right text-success"></i>
          <span>Swipe right or press <kbd>→</kbd> to like</span>
        </div>
        <div className="instruction-item">
          <i className="fas fa-arrow-up text-warning"></i>
          <span>Swipe up or press <kbd>↑</kbd> to superlike</span>
        </div>
      </div>

      {/* AI Chat Window (shown on mutual match) */}
      {showChat && matchedUser && (
        <AIChatWindow
          match={matchedUser}
          onClose={handleChatClose}
        />
      )}
    </div>
  );
};

export default Matchmaker;
