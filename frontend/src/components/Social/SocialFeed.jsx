import PostCard from './PostCard';

// Mock data for posts
const mockPosts = [
  {
    id: 1,
    user: {
      name: 'John Doe',
      title: 'Software Engineer at TechCorp',
      avatar: 'https://via.placeholder.com/40',
    },
    content: 'Excited to share my latest project! 🚀 Working on a new social media platform that connects developers worldwide. #Tech #Innovation',
    timestamp: '2h ago',
    likes: 42,
    comments: 8,
  },
  {
    id: 2,
    user: {
      name: 'Jane Smith',
      title: 'Product Manager at StartupXYZ',
      avatar: 'https://via.placeholder.com/40',
    },
    content: 'Just finished a great workshop on agile methodologies. The key takeaway: communication is everything! What are your thoughts on agile?',
    timestamp: '4h ago',
    likes: 28,
    comments: 12,
  },
  {
    id: 3,
    user: {
      name: 'Alex Johnson',
      title: 'UX Designer at DesignStudio',
      avatar: 'https://via.placeholder.com/40',
    },
    content: 'New design trends for 2024: minimalism, accessibility, and user-centric approaches. How are you incorporating these in your projects?',
    timestamp: '6h ago',
    likes: 67,
    comments: 15,
  },
];

export default function SocialFeed() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Social Feed</h2>
      <div className="flex flex-col gap-4 space-y-4">
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
