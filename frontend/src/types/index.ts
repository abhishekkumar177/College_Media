export interface User {
    id: string;
    _id?: string;
    username: string;
    email: string;
    profilePicture?: string;
    bio?: string;
    college?: string;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
}

export interface Post {
    id: string;
    _id: string;
    user: User;
    caption: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    timestamp: string;
    likes: number;
    liked: boolean;
    comments: number;
    poll?: Poll;
}

export interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    duration: number;
    durationUnit: 'minutes' | 'hours' | 'days';
    allowVoteChange: boolean;
    expiresAt: string;
    totalVotes: number;
    hasVoted: boolean;
    userVote?: number;
}

export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export interface Comment {
    id: string;
    user: User;
    text: string;
    timestamp: string;
    likes: number;
    replies?: Comment[];
}

export interface Notification {
    id: string;
    type: 'like' | 'comment' | 'follow' | 'mention' | 'share' | 'reply';
    actor: User;
    targetId: string; // post id, comment id, etc.
    isRead: boolean;
    timestamp: string;
    message?: string;
}

export interface Collection {
    _id: string;
    name: string;
    description?: string;
    color: string;
    isPublic: boolean;
    posts: string[] | Post[];
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    _id: string;
    seller: User;
    title: string;
    description: string;
    price: number;
    category: 'Books' | 'Electronics' | 'Dorm Essentials' | 'Clothing' | 'Services' | 'Other';
    images: string[];
    condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
    status: 'Available' | 'Pending' | 'Sold';
    location: string;
    createdAt: string;
}

export interface Order {
    _id: string;
    buyer: User | string;
    seller: User | string;
    product: Product | string;
    amount: number;
    currency: string;
    status: 'Pending' | 'Paid' | 'Delivered' | 'Completed' | 'Cancelled' | 'Refunded';
    escrowStatus: 'Held' | 'Released' | 'Refunded' | 'N/A';
    createdAt: string;
}

export interface Document {
    _id: string;
    title: string;
    owner: User | string;
    content?: any;
    collaborators: { user: User | string; role: 'editor' | 'viewer' }[];
    isPublic: boolean;
    lastModified: string;
    createdAt: string;
}

export interface Event {
    _id: string;
    organizer: User;
    title: string;
    description: string;
    bannerUrl?: string;
    date: string;
    location: string;
    category: 'Fest' | 'Workshop' | 'Seminar' | 'Concert' | 'Competition' | 'Other';
    ticketTiers: {
        name: string;
        price: number;
        quantity: number;
        sold: number;
    }[];
    aiRiskScore?: number;
    expectedAttendance?: number;
    createdAt: string;
}

export interface Ticket {
    _id: string;
    event: Event;
    user: User | string;
    tierName: string;
    pricePaid: number;
    qrCode: string; // Data URL
    status: 'Valid' | 'Used' | 'Cancelled';
    checkedInAt?: string;
}
