import PostCard from './PostCard';

// Mock data for posts
const mockPosts = [
  {
    id: 1,
    user: {
      name: 'John Doe',
      title: 'Software Engineer at TechCorp',
      avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%234F46E5" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial"%3EJD%3C/text%3E%3C/svg%3E',
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
      avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%2310B981" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial"%3EJS%3C/text%3E%3C/svg%3E',
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
      avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%23F59E0B" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial"%3EAJ%3C/text%3E%3C/svg%3E',
    },
    content: 'New design trends for 2024: minimalism, accessibility, and user-centric approaches. How are you incorporating these in your projects?',
    timestamp: '6h ago',
    likes: 67,
    comments: 15,
  },
];

export default function SocialFeed() {
  return (
    <section className="w-full flex justify-center">
      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        
        <header className="py-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 text-center">
            Social Feed
          </h2>
        </header>

        <div className="py-6 space-y-6">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

      </div>
    </section>
  );
}
