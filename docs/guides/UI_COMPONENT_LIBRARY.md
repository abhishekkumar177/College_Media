# Component Library

This document catalogs and describes the reusable React components used in the College Media application. Each component includes detailed information on props, usage, styling, accessibility, and more to ensure consistency in UI development and aid new contributors.

## Table of Contents

- [Navigation Bar](#navigation-bar)
- [Search Input](#search-input)
- [Menu Item](#menu-item)
- [Stories Carousel](#stories-carousel)
- [Story Item](#story-item)
- [Post Card](#post-card)
- [Suggested Account Item](#suggested-account-item)
- [Trending Hashtag](#trending-hashtag)
- [Online Friend Item](#online-friend-item)

## Navigation Bar

### Description
The main navigation bar at the top of the application, containing the app logo, search functionality, and user profile button.

### Props/Interfaces
```typescript
interface NavigationBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
```

### Usage Example
```jsx
<NavigationBar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
/>
```

### Styling Notes
- Uses Tailwind CSS classes for responsive design
- Gradient background for logo: `bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400`
- Sticky positioning: `sticky top-0 z-50`
- Shadow and border: `shadow-sm border-b border-gray-100`

### Accessibility Features
- Search input has proper label (implied by placeholder)
- Logo has hover effects for better interaction feedback
- User profile button uses SVG icons with descriptive paths

### Dependencies
- React
- Tailwind CSS

### State Management
- Managed by parent component (App) for search query state

### Event Handlers
- `onChange` for search input updates
- `onClick` for logo and profile button (currently no-op)

### Responsive Breakpoints
- Mobile: Logo and search stack vertically
- Tablet/Desktop: Horizontal layout with centered search

### Visual Mockup
![Navigation Bar Mockup](mockups/navigation-bar.png)

## Search Input

### Description
A search input field with magnifying glass icon for finding users and posts.

### Props/Interfaces
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

### Usage Example
```jsx
<SearchInput
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search"
/>
```

### Styling Notes
- Rounded full design: `rounded-full`
- Focus states: `focus:ring-2 focus:ring-purple-300 focus:bg-white`
- Icon positioned absolutely: `absolute left-3 top-2.5`

### Accessibility Features
- Proper input type: `type="text"`
- Placeholder text for guidance
- Focus ring for keyboard navigation

### Dependencies
- React
- Tailwind CSS
- SVG icons (search icon)

### State Management
- Controlled component with external state

### Event Handlers
- `onChange` for input value updates

### Responsive Breakpoints
- Responsive width: `max-w-lg mx-8` on larger screens

### Visual Mockup
![Search Input Mockup](mockups/search-input.png)

## Menu Item

### Description
Individual navigation menu items in the left sidebar with icons and labels.

### Props/Interfaces
```typescript
interface MenuItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}
```

### Usage Example
```jsx
<MenuItem
  icon="🏠"
  label="Home"
  active={activeTab === "Home"}
  onClick={() => handleTabClick("Home")}
/>
```

### Styling Notes
- Active state: `bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 shadow-sm`
- Hover effects: `hover:bg-gray-50`
- Rounded corners: `rounded-xl`

### Accessibility Features
- Button element for keyboard navigation
- Visual active state indication
- Emoji icons for visual identification

### Dependencies
- React
- Tailwind CSS

### State Management
- Active state managed by parent component

### Event Handlers
- `onClick` for navigation tab changes

### Responsive Breakpoints
- Full width on all screen sizes: `w-full`

### Visual Mockup
![Menu Item Mockup](mockups/menu-item.png)

## Stories Carousel

### Description
Horizontal scrolling carousel displaying user stories with auto-scroll functionality.

### Props/Interfaces
```typescript
interface StoriesCarouselProps {
  stories: Array<{
    id: number;
    username: string;
    avatar: string;
  }>;
  currentIndex: number;
  onStoryClick: (index: number) => void;
}
```

### Usage Example
```jsx
<StoriesCarousel
  stories={stories}
  currentIndex={currentStoryIndex}
  onStoryClick={setCurrentStoryIndex}
/>
```

### Styling Notes
- Horizontal scroll: `overflow-x-auto`
- Hidden scrollbar: `scrollbar-hide`
- Active story border: gradient border animation

### Accessibility Features
- Alt text for avatar images
- Clickable areas for story selection
- Visual indicators for active story

### Dependencies
- React
- Tailwind CSS
- Custom CSS for scrollbar hiding and gradient borders

### State Management
- Current index managed by parent component
- Auto-scroll effect using useEffect

### Event Handlers
- `onClick` for story selection
- Auto-scroll interval (cleanup on unmount)

### Responsive Breakpoints
- Horizontal layout on all screen sizes
- Fixed item sizes: `w-16 h-16`

### Visual Mockup
![Stories Carousel Mockup](mockups/stories-carousel.png)

## Story Item

### Description
Individual story item in the carousel with user avatar and username.

### Props/Interfaces
```typescript
interface StoryItemProps {
  story: {
    id: number;
    username: string;
    avatar: string;
  };
  isActive: boolean;
  onClick: () => void;
}
```

### Usage Example
```jsx
<StoryItem
  story={story}
  isActive={index === currentStoryIndex}
  onClick={() => setCurrentStoryIndex(index)}
/>
```

### Styling Notes
- Circular avatar: `rounded-full`
- Active border: gradient animation
- Hover scale: `hover:scale-105`

### Accessibility Features
- Alt text for images
- Clickable for navigation
- Visual active state

### Dependencies
- React
- Tailwind CSS

### State Management
- Active state from parent

### Event Handlers
- `onClick` for selection

### Responsive Breakpoints
- Fixed size: `w-16 h-16`

### Visual Mockup
![Story Item Mockup](mockups/story-item.png)

## Post Card

### Description
Individual post display with user info, media, interactions, and caption.

### Props/Interfaces
```typescript
interface PostCardProps {
  post: {
    id: number;
    user: {
      username: string;
      avatar: string;
    };
    media: string;
    caption: string;
    likes: number;
    comments: number;
  };
  isLiked: boolean;
  onLikeToggle: () => void;
}
```

### Usage Example
```jsx
<PostCard
  post={post}
  isLiked={likedPosts[post.id]}
  onLikeToggle={() => toggleLike(post.id)}
/>
```

### Styling Notes
- Card layout: `bg-white rounded-2xl shadow-sm`
- Hover effects: `hover:shadow-md`
- Gradient text for hashtags (implied in caption)

### Accessibility Features
- Alt text for images
- Button elements for interactions
- Semantic HTML structure

### Dependencies
- React
- Tailwind CSS
- SVG icons for interactions

### State Management
- Like state managed by parent
- Local animation states

### Event Handlers
- `onClick` for like, comment, share buttons
- Hover effects for interactive elements

### Responsive Breakpoints
- Full width images: `w-full`
- Responsive padding and spacing

### Visual Mockup
![Post Card Mockup](mockups/post-card.png)

## Suggested Account Item

### Description
Individual suggested account display with avatar, username, follower count, and follow button.

### Props/Interfaces
```typescript
interface SuggestedAccountItemProps {
  account: {
    username: string;
    avatar: string;
    followers: string;
  };
  onFollow: () => void;
}
```

### Usage Example
```jsx
<SuggestedAccountItem
  account={account}
  onFollow={() => handleFollow(account.username)}
/>
```

### Styling Notes
- Follow button: `bg-blue-500 hover:bg-blue-600`
- Avatar hover: `hover:scale-110`
- Rounded design: `rounded-full`

### Accessibility Features
- Alt text for avatars
- Button for follow action
- Descriptive follower count

### Dependencies
- React
- Tailwind CSS

### State Management
- Follow state could be added for toggle functionality

### Event Handlers
- `onClick` for follow button

### Responsive Breakpoints
- Flexible layout: `flex items-center justify-between`

### Visual Mockup
![Suggested Account Item Mockup](mockups/suggested-account-item.png)

## Trending Hashtag

### Description
Individual trending hashtag display as a clickable badge.

### Props/Interfaces
```typescript
interface TrendingHashtagProps {
  hashtag: string;
  onClick: () => void;
}
```

### Usage Example
```jsx
<TrendingHashtag
  hashtag="#photography"
  onClick={() => handleHashtagClick("#photography")}
/>
```

### Styling Notes
- Gradient background: `bg-gradient-to-r from-pink-100 to-purple-100`
- Hover effects: `hover:from-pink-200 hover:to-purple-200`
- Rounded badge: `rounded-full`

### Accessibility Features
- Clickable for navigation
- Visual hover states

### Dependencies
- React
- Tailwind CSS

### State Management
- No internal state

### Event Handlers
- `onClick` for hashtag selection

### Responsive Breakpoints
- Flexible wrapping: `flex flex-wrap gap-2`

### Visual Mockup
![Trending Hashtag Mockup](mockups/trending-hashtag.png)

## Online Friend Item

### Description
Individual online friend display with avatar and green online indicator.

### Props/Interfaces
```typescript
interface OnlineFriendItemProps {
  friend: {
    username: string;
    avatar: string;
  };
  onClick: () => void;
}
```

### Usage Example
```jsx
<OnlineFriendItem
  friend={friend}
  onClick={() => handleFriendClick(friend.username)}
/>
```

### Styling Notes
- Circular avatar: `w-12 h-12 rounded-full`
- Online indicator: green dot with white border
- Hover scale: `hover:scale-105`

### Accessibility Features
- Alt text for avatars
- Clickable for interaction
- Visual online status

### Dependencies
- React
- Tailwind CSS

### State Management
- Static online status (could be dynamic)

### Event Handlers
- `onClick` for friend selection

### Responsive Breakpoints
- Fixed size avatars
- Horizontal layout: `flex space-x-3`

### Visual Mockup
![Online Friend Item Mockup](mockups/online-friend-item.png)
