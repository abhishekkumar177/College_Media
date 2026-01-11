import React, { useState, useEffect, useRef } from 'react';
import './Reels.css';
import { reel } from '../data/reel.js';
import CommentModal from "../components/CommentModal";


const Reels = () => {
  const [reelsData, setReelsData] = useState(reel);
  const videoRefs = useRef([]);
  
  // State for handling the Comment Modal
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const handleLike = (idx) => {
    const newReels = [...reelsData];
    if (!newReels[idx].isLiked) {
      newReels[idx].likeCount++;
      newReels[idx].isLiked = true;
    } else {
      newReels[idx].likeCount--;
      newReels[idx].isLiked = false;
    }
    setReelsData(newReels);
  };

  const handleFollow = (idx) => {
    const newReels = [...reelsData];
    newReels[idx].isFollowed = !newReels[idx].isFollowed;
    setReelsData(newReels);
  };

  const handleMute = (idx) => {
    const newReels = [...reelsData];
    newReels[idx].ismuted = !newReels[idx].ismuted;
    setReelsData(newReels);
  };

  // Function to trigger the dynamic comment modal
  const handleOpenComments = (post) => {
    // Use the database _id if available, otherwise fallback to index
    setSelectedPostId(post._id || reelsData.indexOf(post));
    setIsCommentModalOpen(true);
  };

  useEffect(() => {
    if (videoRefs.current[0]) {
      videoRefs.current[0].play().catch(err => console.log('Auto-play prevented:', err));
    }
    console.log('Reels data:', reelsData);
  }, []);

  const handleScroll = (e) => {
    const container = e.target;
    const scrollPosition = container.scrollTop;
    const reelHeight = container.clientHeight;
    const currentIndex = Math.round(scrollPosition / reelHeight);
    
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === currentIndex) {
          video.play().catch(err => console.log('Play error:', err));

          // --- ADD THIS LOGIC HERE ---
          // This updates the ID when you scroll, which refreshes the CommentModal
          const currentReel = reelsData[currentIndex];
          const newId = currentReel?._id || currentIndex;
          
          if (selectedPostId !== newId) {
            setSelectedPostId(newId);
          }
          // ---------------------------

        } else {
          video.pause();
        }
      }
    });
  };
  return (
    <div className="reels-container">
      <div className="reels-section">
        <div className="all-reels" onScroll={handleScroll}>
          {reelsData && reelsData.length > 0 ? (
            reelsData.map((elem, idx) => (
              <div key={idx} className="reel">
                <video
                  ref={el => videoRefs.current[idx] = el}
                  loop
                  muted={elem.ismuted}
                  playsInline
                  preload="metadata"
                  style={{ backgroundColor: '#000' }}
                >
                  <source src={elem.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-sm">
                  {!videoRefs.current[idx]?.readyState && 'Loading...'}
                </div>

                <div className="mute" onClick={() => handleMute(idx)}>
                  {elem.ismuted ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </div>

                <div className="bottom">
                  <div className="user">
                    <img src={elem.userprofile} alt={elem.username} />
                    <h4>{elem.username}</h4>
                    <button onClick={() => handleFollow(idx)} className='follow'>
                      {elem.isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                  <h3>{elem.caption}</h3>
                </div>

                <div className="right">
                  <div onClick={() => handleLike(idx)} className="like">
                    <h4 className="like-icon icon">
                      {elem.isLiked ? (
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'red' }}>
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      ) : (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                    </h4>
                    <h6>{elem.likeCount > 1000 ? `${(elem.likeCount / 1000).toFixed(1)}k` : elem.likeCount}</h6>
                  </div>

                  {/* FIXED: Added onClick to open the dynamic comment modal */}
                  <div className="comment" onClick={() => handleOpenComments(elem)}>
                    <h4 className="comment-icon icon">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </h4>
                    <h6>{elem.commentCount}</h6>
                  </div>

                  <div className="share">
                    <h4 className="share-icon icon">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </h4>
                    <h6>{elem.shareCount}</h6>
                  </div>

                  <div className="menu">
                    <h4 className="menu-icon icon">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </h4>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <p>No reels available</p>
            </div>
          )}
        </div>
      </div>

      {/* DYNAMIC MODAL INTEGRATION */}
      <CommentModal 
        isOpen={isCommentModalOpen} 
        onClose={() => setIsCommentModalOpen(false)} 
        postId={selectedPostId}
        commentCount={reelsData.find(r => (r._id || reelsData.indexOf(r)) === selectedPostId)?.commentCount || 0}
      />
    </div>
  );
};

export default Reels;