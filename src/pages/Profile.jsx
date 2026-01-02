import React, { useState, useEffect } from 'react';
import SEO from '../components/Seo';
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
      { id: 1, imageUrl: '/placeholder1.jpg', likes: 45 },
      { id: 2, imageUrl: '/placeholder2.jpg', likes: 67 },
      // Add more posts
    ]);
  }, []);

  return (
    <>
      <SEO 
        title="Profile - UniHub"
        description="Manage your UniHub profile, view your posts, and connect with your college community."
        keywords="student profile, college profile, user account, campus network profile"
      />
      
      <div className="profile-container">
      <div className="profile-header">
        <div className="profile-picture">
          <img src="/default-avatar.png" alt="Profile" />
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
    </>
  );
};

export default Profile;
