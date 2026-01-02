import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const [userStats, setUserStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  });
  
  const [userPosts, setUserPosts] = useState([]);

  // TODO: Replace with actual API calls
  useEffect(() => {
    // Fetch user data
    setUserStats({
      posts: 12,
      followers: 234,
      following: 180
    });
    
    // Fetch user posts
    setUserPosts([
      // Sample data - replace with API
      { id: 1, imageUrl: 'https://placehold.co/100x100/FF6B6B/FFFFFF?text=post 1', likes: 45 },
      { id: 2, imageUrl: 'https://placehold.co/100x100/FF6B6B/FFFFFF?text=post 2', likes: 67 },
      // Add more posts
    ]);
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture">
          <img src="https://placehold.co/100x100/FF6B6B/FFFFFF?text=User" alt="Profile" />
        </div>
        
        <div className="profile-info">
          <div className="profile-username">
            <h2>username</h2>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
          
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-count">{userStats.posts}</span>
              <span className="stat-label">posts</span>
            </div>
            <div className="stat">
              <span className="stat-count">{userStats.followers}</span>
              <span className="stat-label">followers</span>
            </div>
            <div className="stat">
              <span className="stat-count">{userStats.following}</span>
              <span className="stat-label">following</span>
            </div>
          </div>
          
          <div className="profile-bio">
            <p className="bio-name">Full Name</p>
            <p className="bio-text">Bio text goes here...</p>
          </div>
        </div>
      </div>

      <div className="profile-posts">
        <div className="posts-grid">
          {userPosts.map(post => (
            <div key={post.id} className="post-item">
              <img src={post.imageUrl} alt="Post" />
              <div className="post-overlay">
                <span>❤️ {post.likes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
