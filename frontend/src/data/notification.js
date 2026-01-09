export const notification =[
    {
      id: 1,
      type: 'like',
      user: { 
        name: 'Sarah Chen', 
        username: '@sarahchen',
        avatar: 'https://placehold.co/48x48/EC4899/FFFFFF?text=SC' 
      },
      action: 'liked your post',
      postPreview: 'Great work on the semester project!',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'comment',
      user: { 
        name: 'Mike Johnson', 
        username: '@mikej',
        avatar: 'https://placehold.co/48x48/3B82F6/FFFFFF?text=MJ' 
      },
      action: 'commented on your post',
      content: 'Amazing presentation! Can you share the slides?',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'follow',
      user: { 
        name: 'Emma Davis', 
        username: '@emmad',
        avatar: 'https://placehold.co/48x48/10B981/FFFFFF?text=ED' 
      },
      action: 'started following you',
      time: '2 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'mention',
      user: { 
        name: 'Alex Wilson', 
        username: '@alexw',
        avatar: 'https://placehold.co/48x48/F59E0B/FFFFFF?text=AW' 
      },
      action: 'mentioned you in a comment',
      content: '@you This is exactly what we need for our project!',
      time: '3 hours ago',
      read: true,
    },
    {
      id: 5,
      type: 'event',
      user: { 
        name: 'Campus Events', 
        username: '@campusevents',
        avatar: 'https://placehold.co/48x48/8B5CF6/FFFFFF?text=CE' 
      },
      action: 'Tech Talk: AI in Education starts in 1 hour',
      location: 'Main Auditorium',
      time: '4 hours ago',
      read: true,
    },
    {
      id: 6,
      type: 'group',
      user: { 
        name: 'Study Group', 
        username: '@cs101group',
        avatar: 'https://placehold.co/48x48/EF4444/FFFFFF?text=SG' 
      },
      action: 'added you to "CS101 Study Group"',
      time: '6 hours ago',
      read: true,
    },
    {
      id: 7,
      type: 'achievement',
      user: { 
        name: 'College Media', 
        username: '@collegemedia',
        avatar: 'https://placehold.co/48x48/6366F1/FFFFFF?text=CM' 
      },
      action: 'You earned the "Active Contributor" badge',
      time: '1 day ago',
      read: true,
    },
    {
      id: 8,
      type: 'announcement',
      user: { 
        name: 'College Admin', 
        username: '@collegeadmin',
        avatar: 'https://placehold.co/48x48/6B7280/FFFFFF?text=CA' 
      },
      action: 'Mid-semester break starts next week',
      time: '2 days ago',
      read: true,
    },
  ]