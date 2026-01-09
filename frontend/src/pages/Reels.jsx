import React, { useState } from 'react';
import './Reels.css';
import { reel } from '../data/reel.js'

const Reels = () => {
  const [reelsData, setReelsData] = useState(reel);

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

  return (
    <div className="reels-container">
      <div className="reels-section">
        <div className="all-reels">
          {reelsData.map((elem, idx) => (
            <div key={idx} className="reel">
              <video
                autoPlay
                loop
                muted={elem.ismuted}
                src={elem.video}
              />
              <div className="mute" onClick={() => handleMute(idx)}>
                {elem.ismuted ? (
                  <i className="ri-volume-mute-fill"></i>
                ) : (
                  <i className="ri-volume-up-line"></i>
                )}
              </div>
              <div className="bottom">
                <div className="user">
                  <img src={elem.userprofile} alt={elem.username} />
                  <h4>{elem.username}</h4>
                  <button onClick={() => handleFollow(idx)} className='follow'>
                    {elem.isFollowed ? 'Unfollow' : 'Follow'}
                  </button>
                </div>
                <h3>{elem.caption}</h3>
              </div>
              <div className="right">
                <div onClick={() => handleLike(idx)} className="like">
                  <h4 className="like-icon icon">
                    {elem.isLiked ? (
                      <i className="love ri-heart-3-fill"></i>
                    ) : (
                      <i className="ri-heart-3-line"></i>
                    )}
                  </h4>
                  <h6>{elem.likeCount}</h6>
                </div>
                <div className="comment">
                  <h4 className="comment-icon icon">
                    <i className="ri-chat-3-line"></i>
                  </h4>
                  <h6>{elem.commentCount}</h6>
                </div>
                <div className="share">
                  <h4 className="share-icon icon">
                    <i className="ri-share-forward-line"></i>
                  </h4>
                  <h6>{elem.shareCount}</h6>
                </div>
                <div className="menu">
                  <h4 className="menu-icon icon">
                    <i className="ri-more-2-fill"></i>
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reels;
