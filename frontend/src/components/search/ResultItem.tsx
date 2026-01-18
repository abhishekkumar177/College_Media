import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultItem.css';

interface SearchResult {
  _id: string;
  type: 'post' | 'user' | 'event';
  title?: string;
  caption?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  location?: string;
  createdAt?: string;
  author?: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  creator?: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  profilePicture?: string;
  verified?: boolean;
  score?: number;
}

interface ResultItemProps {
  result: SearchResult;
}

const ResultItem: React.FC<ResultItemProps> = ({ result }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    switch (result.type) {
      case 'post':
        navigate(`/post/${result._id}`);
        break;
      case 'user':
        navigate(`/profile/${result.username}`);
        break;
      case 'event':
        navigate(`/event/${result._id}`);
        break;
      default:
        break;
    }
  };

  const truncate = (text: string | undefined, length: number = 100) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}m ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  if (result.type === 'post') {
    return (
      <div className="result-item result-post" onClick={handleClick}>
        <div className="result-icon">📝</div>
        <div className="result-content">
          <h4 className="result-title">{truncate(result.title || result.caption, 80)}</h4>
          <p className="result-description">{truncate(result.caption || result.description, 120)}</p>
          <div className="result-meta">
            <span className="meta-author">
              By {result.author?.username || 'Unknown'}
            </span>
            {result.createdAt && (
              <span className="meta-date">{formatDate(result.createdAt)}</span>
            )}
            {result.score && (
              <span className="meta-score">Match: {(result.score * 100).toFixed(0)}%</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (result.type === 'user') {
    return (
      <div className="result-item result-user" onClick={handleClick}>
        <div className="result-avatar">
          {result.profilePicture ? (
            <img src={result.profilePicture} alt={result.username} />
          ) : (
            <div className="avatar-placeholder">👤</div>
          )}
        </div>
        <div className="result-content">
          <h4 className="result-title">
            {result.firstName && result.lastName
              ? `${result.firstName} ${result.lastName}`
              : result.username}
            {result.verified && <span className="verified-badge">✓</span>}
          </h4>
          <p className="result-username">@{result.username}</p>
          <p className="result-description">{truncate(result.description, 100)}</p>
        </div>
      </div>
    );
  }

  if (result.type === 'event') {
    return (
      <div className="result-item result-event" onClick={handleClick}>
        <div className="result-icon">📅</div>
        <div className="result-content">
          <h4 className="result-title">{truncate(result.title, 80)}</h4>
          <p className="result-description">{truncate(result.description, 120)}</p>
          <div className="result-meta">
            {result.location && (
              <span className="meta-location">📍 {result.location}</span>
            )}
            {result.creator && (
              <span className="meta-creator">By {result.creator.username}</span>
            )}
            {result.createdAt && (
              <span className="meta-date">{formatDate(result.createdAt)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ResultItem;
