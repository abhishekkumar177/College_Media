import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import CreatePost from "./CreatePost";
import Post from "../components/Post";
import SkeletonPost from "../components/SkeletonPost";

const PostFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPosts, setNewPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      const mockPosts = [
        {
          id: 1,
          user: {
            id: 2,
            username: "college_friend",
            profilePicture: "https://placehold.co/40x40/4F46E5/FFFFFF?text=CF"
          },
          imageUrl: "https://placehold.co/600x600/6366F1/FFFFFF?text=Campus+Life",
          caption: "Enjoying the beautiful campus weather!",
          likes: 24,
          comments: 5,
          timestamp: "2 hours ago",
          liked: false
        },
        {
          id: 2,
          user: {
            id: 3,
            username: "study_buddy",
            profilePicture: "https://placehold.co/40x40/EC4899/FFFFFF?text=SB"
          },
          imageUrl: "https://placehold.co/600x600/EC4899/FFFFFF?text=Study+Group",
          caption: "Group study session in the library",
          likes: 42,
          comments: 8,
          timestamp: "4 hours ago",
          liked: true
        }
      ];
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const getPostUrl = (post) =>
    `https://collegemedia.com/post/${post.id}`;

  const getShareText = (post) =>
    `Check out this post from ${post.user.username}: ${post.caption}`;

  const openShare = (url) => window.open(url, "_blank");

  const handleShareWhatsApp = (post) =>
    openShare(
      `https://wa.me/?text=${encodeURIComponent(
        getShareText(post) + " " + getPostUrl(post)
      )}`
    );

  const handleShareTelegram = (post) =>
    openShare(
      `https://t.me/share/url?url=${encodeURIComponent(
        getPostUrl(post)
      )}&text=${encodeURIComponent(getShareText(post))}`
    );

  const handleShareTwitter = (post) =>
    openShare(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        getShareText(post)
      )}&url=${encodeURIComponent(getPostUrl(post))}`
    );

  const handleShareFacebook = (post) =>
    openShare(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        getPostUrl(post)
      )}`
    );

  const handleShareLinkedIn = (post) =>
    openShare(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        getPostUrl(post)
      )}`
    );

  const handleShareEmail = (post) =>
    openShare(
      `mailto:?subject=CollegeMedia Post&body=${encodeURIComponent(
        getShareText(post) + "\n\n" + getPostUrl(post)
      )}`
    );

  const handleCopyLink = (post) => {
    navigator.clipboard.writeText(getPostUrl(post));
    setCopiedLink(post.id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleNewPost = (post) => {
    setNewPosts((prev) => [post, ...prev]);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SkeletonPost />
        <SkeletonPost />
        <SkeletonPost />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CreatePost onPostCreated={handleNewPost} />

      {[...newPosts, ...posts].map((post) => (
        <Post
          key={post.id}
          post={post}
          onLike={handleLike}
          onShareWhatsApp={handleShareWhatsApp}
          onShareTelegram={handleShareTelegram}
          onShareTwitter={handleShareTwitter}
          onShareFacebook={handleShareFacebook}
          onShareLinkedIn={handleShareLinkedIn}
          onShareEmail={handleShareEmail}
          onCopyLink={handleCopyLink}
          copiedLink={copiedLink}
        />
      ))}
    </div>
  );
};

export default PostFeed;
