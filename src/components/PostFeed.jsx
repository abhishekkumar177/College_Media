import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreatePost from './CreatePost';

const PostFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(null);

  // Mock data for now - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockPosts = [
        {
          id: 1,
          user: {
            id: 2,
            username: 'college_friend',
            profilePicture: 'https://placehold.co/40x40/4F46E5/FFFFFF?text=CF'
          },
          imageUrl: 'https://placehold.co/600x600/6366F1/FFFFFF?text=Campus+Life',
          caption: 'Enjoying the beautiful campus weather! 🌞 #college #fun',
          likes: 24,
          comments: 5,
          timestamp: '2 hours ago',
          liked: false
        },
        {
          id: 2,
          user: {
            id: 3,
            username: 'study_buddy',
            profilePicture: 'https://placehold.co/40x40/EC4899/FFFFFF?text=SB'
          },
          imageUrl: 'https://placehold.co/600x600/EC4899/FFFFFF?text=Study+Group',
          caption: 'Group study session in the library! 📚 #study #motivation',
          likes: 42,
          comments: 8,
          timestamp: '4 hours ago',
          liked: true
        },
        {
          id: 3,
          user: {
            id: 4,
            username: 'campus_chef',
            profilePicture: 'https://placehold.co/40x40/10B981/FFFFFF?text=CC'
          },
          imageUrl: 'https://placehold.co/600x600/10B981/FFFFFF?text=Cooking',
          caption: 'Made this amazing dish in the dorm kitchen! 🍳 #cooking #dormlife',
          likes: 18,
          comments: 3,
          timestamp: '6 hours ago',
          liked: false
        }
      ];
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } 
        : post
    ));
  };

  // Generate post URL
  const getPostUrl = (post) => {
    return `https://collegemedia.com/post/${post.id}`;
  };

  // Generate share text
  const getShareText = (post) => {
    return `Check out this post from ${post.user.username}: ${post.caption}`;
  };

  // Share Functions
  const handleShareWhatsApp = (post) => {
    const text = getShareText(post);
    const url = getPostUrl(post);
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(shareUrl, '_blank');
  };

  const handleShareTelegram = (post) => {
    const text = getShareText(post);
    const url = getPostUrl(post);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const handleShareTwitter = (post) => {
    const text = getShareText(post);
    const url = getPostUrl(post);
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=CollegeMedia`;
    window.open(shareUrl, '_blank');
  };

  const handleShareFacebook = (post) => {
    const url = getPostUrl(post);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  };

  const handleShareLinkedIn = (post) => {
    const url = getPostUrl(post);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  };

  const handleShareReddit = (post) => {
    const text = getShareText(post);
    const url = getPostUrl(post);
    const shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  const handleShareEmail = (post) => {
    const text = getShareText(post);
    const url = getPostUrl(post);
    const subject = `Check out this post from ${post.user.username} on CollegeMedia`;
    const body = `${text}\n\n${url}\n\nShared from CollegeMedia - The college social network`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleCopyLink = (post) => {
    const url = getPostUrl(post);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopiedLink(post.id);
          setTimeout(() => setCopiedLink(null), 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          fallbackCopyToClipboard(url, post.id);
        });
    } else {
      fallbackCopyToClipboard(url, post.id);
    }
  };

  const fallbackCopyToClipboard = (text, postId) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopiedLink(postId);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    
    document.body.removeChild(textArea);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
          <div className="h-64 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const [newPosts, setNewPosts] = useState([]);

  const handleNewPost = (post) => {
    setNewPosts(prev => [post, ...prev]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CreatePost onPostCreated={handleNewPost} />
      {[...newPosts, ...posts].map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Post Header */}
          <div className="flex items-center p-4">
            <img 
              src={post.user.profilePicture} 
              alt={post.user.username}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{post.user.username}</h3>
              <p className="text-xs text-gray-500">{post.timestamp}</p>
            </div>
          </div>

          {/* Post Image */}
          <div className="relative">
            <img 
              src={post.imageUrl} 
              alt="Post" 
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Post Actions */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center ${post.liked ? 'text-red-500' : 'text-gray-700'}`}
                  aria-label={post.liked ? 'Unlike post' : 'Like post'}
                >
                  <svg 
                    className={`w-6 h-6 ${post.liked ? 'fill-current' : ''}`} 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
                <button 
                  className="text-gray-700"
                  aria-label="Comment on post"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                
                {/* WhatsApp Share Button */}
                <button 
                  onClick={() => handleShareWhatsApp(post)}
                  className="text-green-600 hover:text-green-700 transition-colors"
                  aria-label="Share on WhatsApp"
                  title="Share on WhatsApp"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
                  </svg>
                </button>
                
                {/* LinkedIn Share Button */}
                <button 
                  onClick={() => handleShareLinkedIn(post)}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  aria-label="Share on LinkedIn"
                  title="Share on LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
                
                {/* Copy Link Button */}
                <button 
                  onClick={() => handleCopyLink(post)}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label={copiedLink === post.id ? 'Link copied' : 'Copy link'}
                  title="Copy link"
                >
                  {copiedLink === post.id ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Likes */}
            <p className="font-semibold text-gray-900 mb-1">{post.likes} likes</p>

            {/* Caption */}
            <div className="mb-2">
              <span className="font-semibold text-gray-900 mr-2">{post.user.username}</span>
              <span className="text-gray-700">{post.caption}</span>
            </div>

            {/* More Share Options Section */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">More sharing options:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleShareTwitter(post)}
                  className="flex items-center px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition-colors text-sm"
                  aria-label="Share on Twitter"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>
                
                <button
                  onClick={() => handleShareFacebook(post)}
                  className="flex items-center px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors text-sm"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                
                <button
                  onClick={() => handleShareTelegram(post)}
                  className="flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm"
                  aria-label="Share on Telegram"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </button>
                
                <button
                  onClick={() => handleShareEmail(post)}
                  className="flex items-center px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm"
                  aria-label="Share via Email"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </button>
              </div>
            </div>

            {/* Comments */}
            {post.comments > 0 && (
              <button className="text-gray-500 text-sm mb-2 mt-3">
                View all {post.comments} comments
              </button>
            )}

            {/* Add Comment */}
            <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 border-0 focus:ring-0 text-sm focus:outline-none"
              />
              <button className="text-blue-500 font-semibold text-sm hover:text-blue-600 transition-colors">
                Post
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostFeed;