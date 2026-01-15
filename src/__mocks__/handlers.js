export const handlers = [
  rest.get('/api/posts', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          user: { username: 'testuser' },
          caption: 'Mocked post',
          likes: 10
        }
      ])
    );
  }),

  rest.post('/api/posts/:id/like', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({ success: true, likes: 11 })
    );
  })
];
export const handlers = [
  // Existing post handlers
  rest.get('/api/posts', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 1,
          user: { username: 'testuser' },
          caption: 'Mocked post',
          likes: 10
        }
      ])
    );
  }),

  rest.post('/api/posts/:id/like', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({ success: true, likes: 11 })
    );
  }),

  // Notification handlers
  rest.get('/api/notifications', (req, res, ctx) => {
    return res(
      ctx.delay(500), // Simulate network delay
      ctx.json({
        success: true,
        data: mockNotifications,
        pagination: {
          total: mockNotifications.length,
          limit: 20,
          offset: 0,
          has_more: false
        }
      })
    );
  }),

  rest.put('/api/notifications/:id/read', (req, res, ctx) => {
    const { id } = req.params;
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
    }
    return res(
      ctx.json({ success: true, message: 'Notification marked as read' })
    );
  }),

  rest.put('/api/notifications/mark-all-read', (req, res, ctx) => {
    mockNotifications.forEach(notification => {
      notification.isRead = true;
    });
    return res(
      ctx.json({ success: true, message: 'All notifications marked as read' })
    );
  }),

  rest.delete('/api/notifications/:id', (req, res, ctx) => {
    const { id } = req.params;
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index > -1) {
      mockNotifications.splice(index, 1);
    }
    return res(
      ctx.json({ success: true, message: 'Notification deleted' })
    );
  }),

  rest.get('/api/notifications/preferences', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          likes: true,
          comments: true,
          follows: true,
          messages: true,
          mentions: true,
          pushEnabled: false,
          soundEnabled: true
        }
      })
    );
  }),

  rest.put('/api/notifications/preferences', async (req, res, ctx) => {
    const preferences = await req.json();
    return res(
      ctx.json({
        success: true,
        data: preferences,
        message: 'Preferences updated successfully'
      })
    );
  }),

  // Real-time notification simulation (WebSocket-like)
  rest.post('/api/notifications/simulate', (req, res, ctx) => {
    const types = ['like', 'comment', 'follow', 'message'];
    const actors = [
      { id: 'user1', username: 'traveler_adventures', profilePicture: 'https://placehold.co/40x40/FF6B6B/FFFFFF?text=TA' },
      { id: 'user2', username: 'foodie_delights', profilePicture: 'https://placehold.co/40x40/45B7D1/FFFFFF?text=FD' },
      { id: 'user3', username: 'fitness_motivation', profilePicture: 'https://placehold.co/40x40/96CEB4/FFFFFF?text=FM' },
      { id: 'user4', username: 'friend_one', profilePicture: 'https://placehold.co/40x40/96CEB4/FFFFFF?text=F1' }
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];

    let content = '';
    switch (type) {
      case 'like':
        content = 'liked your post';
        break;
      case 'comment':
        content = 'commented on your post';
        break;
      case 'follow':
        content = 'started following you';
        break;
      case 'message':
        content = 'sent you a message';
        break;
      default:
        content = 'interacted with your content';
    }

    const newNotification = {
      id: Date.now().toString(),
      type,
      actor,
      target: { type: 'post', id: 'mock' },
      content,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    mockNotifications.unshift(newNotification);

    return res(
      ctx.json({
        success: true,
        data: newNotification,
        message: 'New notification simulated'
      })
    );
  })
];
=======
import { rest } from 'msw';

// Mock user database
const mockUsers = [
  {
    id: 'user-1',
    username: 'demo_user',
    email: 'demo@college.edu',
    password: 'demo123',
    firstName: 'Demo',
    lastName: 'User',
    bio: 'College student exploring the world of social media',
    profilePictureUrl: 'https://placehold.co/100x100/FF6B6B/FFFFFF?text=DU',
    followerCount: 245,
    followingCount: 189,
    postCount: 42,
    isVerified: false,
    isPrivate: false,
    createdAt: '2024-01-15T10:30:00Z'
  }
];

// Mock JWT tokens (simplified for demo)
const generateMockToken = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

const generateMockRefreshToken = () => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  }));
  const signature = btoa('mock-refresh-signature');
  return `${header}.${payload}.${signature}`;
};

export const handlers = [
  // Authentication endpoints
  rest.post('/api/v1/auth/register', async (req, res, ctx) => {
    const { username, email, password, firstName, lastName } = await req.json();

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email || user.username === username);
    if (existingUser) {
      return res(
        ctx.status(400),
        ctx.json({
          success: false,
          message: 'User with this email or username already exists'
        })
      );
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      password, // In real app, this would be hashed
      firstName,
      lastName,
      bio: '',
      profilePictureUrl: `https://placehold.co/100x100/FF6B6B/FFFFFF?text=${firstName[0]}${lastName[0]}`,
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
      isVerified: false,
      isPrivate: false,
      createdAt: new Date().toISOString()
    };

    mockUsers.push(newUser);

    const token = generateMockToken(newUser);
    const refreshToken = generateMockRefreshToken();

    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          token,
          refresh_token: refreshToken
        }
      })
    );
  }),

  rest.post('/api/v1/auth/login', async (req, res, ctx) => {
    const { email, password } = await req.json();

    // Find user
    const user = mockUsers.find(u => u.email === email);
    if (!user || user.password !== password) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: 'Invalid email or password'
        })
      );
    }

    const token = generateMockToken(user);
    const refreshToken = generateMockRefreshToken();

    return res(
      ctx.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          token,
          refresh_token: refreshToken
        }
      })
    );
  }),

  rest.post('/api/v1/auth/refresh', async (req, res, ctx) => {
    const { refresh_token } = await req.json();

    // In a real app, you'd validate the refresh token
    // For demo, we'll just generate new tokens
    if (!refresh_token) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          message: 'Invalid refresh token'
        })
      );
    }

    // Get the first user for demo purposes
    const user = mockUsers[0];
    const token = generateMockToken(user);
    const newRefreshToken = generateMockRefreshToken();

    return res(
      ctx.json({
        success: true,
        data: {
          token,
          refresh_token: newRefreshToken
        }
      })
    );
  }),

  // Posts endpoints
  rest.get('/api/v1/posts/feed', (req, res, ctx) => {
    // Mock feed data
    const mockPosts = [
      {
        id: 'post-1',
        user: {
          id: 'user-1',
          username: 'demo_user',
          profilePictureUrl: 'https://placehold.co/40x40/FF6B6B/FFFFFF?text=DU'
        },
        caption: 'Beautiful campus sunset! 🌅 #college #nature',
        media: [
          {
            mediaUrl: 'https://placehold.co/500x600/4ECDC4/FFFFFF?text=Beautiful+Landscape',
            mediaType: 'image'
          }
        ],
        likeCount: 245,
        commentCount: 18,
        isLiked: false,
        createdAt: '2024-01-15T18:30:00Z'
      },
      {
        id: 'post-2',
        user: {
          id: 'user-1',
          username: 'demo_user',
          profilePictureUrl: 'https://placehold.co/40x40/FF6B6B/FFFFFF?text=DU'
        },
        caption: 'Study session complete! Time for some fun 🎉 #studentlife',
        media: [
          {
            mediaUrl: 'https://placehold.co/500x600/FFEAA7/FFFFFF?text=Study+Session',
            mediaType: 'image'
          }
        ],
        likeCount: 89,
        commentCount: 12,
        isLiked: true,
        createdAt: '2024-01-14T14:20:00Z'
      }
    ];

    return res(
      ctx.json({
        success: true,
        data: mockPosts,
        pagination: {
          total: 50,
          limit: 20,
          offset: 0,
          hasMore: true
        }
      })
    );
  }),

  rest.post('/api/v1/posts/:id/like', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({
        success: true,
        data: {
          postId: id,
          likeCount: 246,
          isLiked: true
        }
      })
    );
  }),

  rest.delete('/api/v1/posts/:id/like', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.json({
        success: true,
        data: {
          postId: id,
          likeCount: 245,
          isLiked: false
        }
      })
    );
  })
];
