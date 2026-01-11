# Interactive Poll System

**Issue #342** - Complete poll functionality for posts with voting and real-time results

## Overview

The Interactive Poll System allows users to create polls within posts, vote on options, and view real-time results with animated progress bars. Polls can have customizable durations, allow vote changes, and display comprehensive statistics.

## Features

### Core Features

1. **Poll Creation**
   - Create polls with 2-6 options
   - Set poll duration (1 hour, 1 day, 3 days, 1 week, or never expire)
   - Optional: Allow users to change their votes
   - Character limits and validation
   - Integrated into post creation flow

2. **Poll Voting**
   - One vote per user (single choice)
   - Optional vote changing if enabled
   - Real-time vote count updates
   - Visual feedback on selected option
   - Automatic percentage calculation

3. **Poll Display**
   - Visual progress bars for each option
   - Vote counts and percentages
   - Total votes counter
   - Time remaining indicator
   - "Ended" badge for expired polls
   - Highlight user's voted option

4. **Poll Results**
   - Live results after voting
   - Animated progress bars
   - Top option highlighting with trophy icon
   - Export results to JSON
   - Share poll functionality
   - Comprehensive statistics dashboard

5. **Poll Management**
   - Auto-expiration based on duration
   - Delete polls (author only)
   - View detailed poll statistics
   - Copy and share poll results

### Technical Features

- **LocalStorage Persistence**: Offline-first approach with localStorage
- **Real-time Updates**: Instant vote count updates
- **Animated UI**: Smooth progress bar animations
- **Responsive Design**: Mobile-optimized layout
- **Input Validation**: Client-side validation for poll creation
- **Error Handling**: Graceful error handling with toast notifications
- **Accessibility**: ARIA labels and keyboard navigation

## User Guide

### Creating a Poll

1. **Open Create Post**:
   - Click "Create Post" or "What's happening?"

2. **Add Poll**:
   - Click the poll icon (📊) below the text input
   - Poll creator interface appears

3. **Configure Poll**:
   - Enter poll question (max 200 characters)
   - Add 2-6 options
   - Select poll duration:
     - 1 Hour
     - 1 Day
     - 3 Days
     - 1 Week
     - Never (no expiration)
   - Toggle "Allow users to change their vote" option

4. **Create and Post**:
   - Click "Create Poll"
   - Review poll preview
   - Add caption (optional)
   - Click "Post" to publish

### Voting on Polls

1. **View Poll**:
   - Polls appear in post feed
   - Shows question and options

2. **Cast Vote**:
   - Click your preferred option
   - Click "Submit Vote" button
   - See immediate results with your choice highlighted

3. **Change Vote** (if allowed):
   - Click different option
   - Click "Submit Vote" again
   - Previous vote is replaced

4. **View Results**:
   - After voting, see:
     - Progress bars for each option
     - Vote counts and percentages
     - Total votes
     - Winning option (trophy icon)
     - Your voted option (checkmark)

### Understanding Poll Status

**Active Poll**:
- Green badge: "Active"
- Can vote if not yet voted
- Shows time remaining

**Expired Poll**:
- Red badge: "Ended"
- Cannot vote
- Shows when it ended
- Results visible to all

**No Votes Yet**:
- Gray badge: "No votes yet"
- Waiting for first vote
- All options at 0%

## Technical Architecture

### Component Structure

```
frontend/src/
├── components/
│   ├── PollCreator.jsx          # Poll creation form
│   ├── PollDisplay.jsx          # Poll display with voting
│   ├── PollResults.jsx          # Detailed results view
│   └── PollOption.jsx           # Individual poll option
├── context/
│   └── PollContext.jsx          # Global poll state
├── hooks/
│   └── usePolls.js              # Custom hooks
└── utils/
    ├── pollStorage.js           # localStorage utilities
    └── pollHelpers.js           # Helper functions
```

### State Management

**PollContext** provides:
- `polls`: Array of all polls
- `loading`: Loading state
- `userVotes`: User's vote history
- `createPoll()`: Create new poll
- `getPollById()`: Get specific poll
- `getPollByPostId()`: Get poll for a post
- `updatePoll()`: Update poll
- `deletePoll()`: Delete poll
- `submitVote()`: Submit/change vote
- `getPollResults()`: Get formatted results
- `hasUserVoted()`: Check if user voted
- `getUserVote()`: Get user's vote
- `getPollStatistics()`: Get poll stats
- `exportResults()`: Export to JSON
- `generateShareText()`: Generate share text

### Data Models

#### Poll Object
```javascript
{
  id: "poll_1234567890_abc123",
  postId: "post_1234567890",
  question: "What's your favorite feature?",
  options: [
    {
      id: "opt_0_1234567890",
      text: "Dark Mode",
      votes: 45
    },
    {
      id: "opt_1_1234567890",
      text: "Real-time Updates",
      votes: 67
    }
  ],
  allowVoteChange: true,
  endsAt: "2024-01-15T00:00:00.000Z", // or null for never
  totalVotes: 112,
  voters: ["user1", "user2", ...],
  createdAt: "2024-01-10T00:00:00.000Z",
  updatedAt: "2024-01-10T12:30:00.000Z"
}
```

#### User Vote Object
```javascript
{
  "poll_1234567890_abc123": "opt_1_1234567890",
  "poll_0987654321_xyz789": "opt_0_0987654321"
}
```

### API Endpoints

```javascript
// Poll Management
POST   /api/polls              // Create poll
GET    /api/polls/:id          // Get poll details
DELETE /api/polls/:id          // Delete poll (author only)

// Voting
POST   /api/polls/:id/vote     // Submit vote
PUT    /api/polls/:id/vote     // Change vote

// Results
GET    /api/polls/:id/results  // Get results with percentages
```

### Storage Strategy

**LocalStorage (Current Implementation)**:
- Key: `polls` - All polls
- Key: `poll_votes` - User vote history
- Auto-sync on every operation
- Instant updates without backend
- No network dependency

**Vote Tracking**:
- Separate localStorage key for user votes
- Maps pollId to selected optionId
- Persists across sessions
- Used to show voted option

## Component Reference

### PollCreator

Poll creation form component.

**Props:**
- `onPollCreate` (function, required): Callback when poll is created
- `onCancel` (function, required): Callback to cancel poll creation

**Features:**
- Question input (200 char limit)
- 2-6 option inputs
- Add/remove option buttons
- Duration dropdown
- Vote change toggle
- Real-time validation
- Character counter

**Usage:**
```jsx
import PollCreator from './components/PollCreator';

<PollCreator
  onPollCreate={(pollData) => handlePollCreate(pollData)}
  onCancel={() => setShowPoll(false)}
/>
```

### PollDisplay

Main poll display with voting interface.

**Props:**
- `poll` (object, required): Poll object to display

**Features:**
- Poll question display
- Status badge (Active/Ended/No votes)
- Votable options (if active)
- Submit vote button
- Results after voting
- Time remaining/ended indicator
- Vote change info
- Progress bars with animation

**Usage:**
```jsx
import PollDisplay from './components/PollDisplay';

<PollDisplay poll={poll} />
```

### PollOption

Individual poll option component.

**Props:**
- `option` (object, required): Option object
- `poll` (object, required): Parent poll object
- `isSelected` (boolean): If option is currently selected
- `isUserChoice` (boolean): If user voted for this option
- `onVote` (function): Vote callback
- `canVote` (boolean): If voting is allowed
- `showResults` (boolean): Show results vs voting UI

**Features:**
- Radio button for voting
- Progress bar background
- Vote count and percentage
- Winner badge (trophy)
- User choice badge (checkmark)
- Hover effects

### PollResults

Detailed poll results view.

**Props:**
- `poll` (object, required): Poll object with results

**Features:**
- Statistics cards (total votes, participants, status, average)
- Winning option highlight
- Detailed breakdown with progress bars
- Sorted by vote count
- Export to JSON button
- Share button
- Time information

**Usage:**
```jsx
import PollResults from './components/PollResults';

<PollResults poll={poll} />
```

## Custom Hooks

### usePolls

Main hook for poll operations.

```javascript
const {
  polls,
  loading,
  userVotes,
  createPoll,
  getPollById,
  getPollByPostId,
  updatePoll,
  deletePoll,
  submitVote,
  getPollResults,
  hasUserVoted,
  getUserVote,
  getPollStatistics,
  exportResults,
  generateShareText
} = usePolls();
```

### usePoll

Get specific poll by ID.

```javascript
const { poll, loading, exists } = usePoll(pollId);
```

### usePollByPost

Get poll associated with a post.

```javascript
const { poll, loading, hasPoll } = usePollByPost(postId);
```

### useVote

Voting operations for a specific poll.

```javascript
const { vote, hasVoted, userVote, loading } = useVote(pollId);

// Submit/change vote
await vote(optionId);
```

### usePollResults

Get formatted poll results.

```javascript
const { results, loading } = usePollResults(pollId);
```

### usePollStatistics

Get poll statistics.

```javascript
const { statistics, loading } = usePollStatistics(pollId);
```

### useExportPoll

Export poll results.

```javascript
const { exportPoll, loading } = useExportPoll(pollId);

// Export to JSON file
exportPoll();
```

### useSharePoll

Share poll functionality.

```javascript
const { sharePoll, shareText, loading } = useSharePoll(pollId);

// Share via Web Share API or clipboard
await sharePoll();
```

## Utility Functions

### pollStorage.js

LocalStorage management utilities.

**Functions:**
- `getPolls()`: Get all polls
- `savePolls(polls)`: Save polls array
- `getPollById(pollId)`: Get specific poll
- `getPollByPostId(postId)`: Get poll by post
- `createPoll(pollData)`: Create new poll
- `updatePoll(pollId, updates)`: Update poll
- `deletePoll(pollId)`: Delete poll
- `submitVote(pollId, optionId, userId)`: Submit vote
- `getUserVote(pollId)`: Get user's vote
- `hasUserVoted(pollId)`: Check if voted
- `getPollResults(pollId)`: Get formatted results
- `clearAllPolls()`: Clear all data (testing)

### pollHelpers.js

Helper functions for calculations and checks.

**Functions:**
- `calculatePercentage(votes, totalVotes)`: Calculate percentage
- `isPollExpired(endsAt)`: Check if poll ended
- `getTimeRemaining(endsAt)`: Get time string
- `formatPollDuration(endsAt, createdAt)`: Format duration
- `getPollDurationOptions()`: Get duration options
- `calculatePollEndDate(duration, unit)`: Calculate end date
- `getWinningOption(options)`: Get option with most votes
- `isWinningOption(option, options)`: Check if option is winning
- `validatePollData(pollData)`: Validate poll data
- `sortOptionsByVotes(options)`: Sort by vote count
- `getPollStatistics(poll)`: Get comprehensive stats
- `formatVoteCount(count)`: Format vote number
- `getProgressBarColor(percentage, isWinner, isUserChoice)`: Get bar color
- `exportPollResults(poll)`: Export to JSON string
- `generatePollShareText(poll)`: Generate share text
- `canUserVote(poll, hasVoted)`: Check if user can vote
- `getPollStatusBadge(poll)`: Get status badge info

## Implementation Guide

### Adding Polls to Your App

1. **Install Dependencies** (already included):
   - React
   - @iconify/react
   - react-hot-toast
   - date-fns

2. **Wrap App with PollProvider**:
```jsx
import { PollProvider } from './context/PollContext';

<PollProvider>
  <App />
</PollProvider>
```

3. **Integrate PollCreator in CreatePost**:
```jsx
import PollCreator from './components/PollCreator';

const [showPollCreator, setShowPollCreator] = useState(false);
const [pollData, setPollData] = useState(null);

// In render:
{showPollCreator && (
  <PollCreator
    onPollCreate={(poll) => setPollData(poll)}
    onCancel={() => setShowPollCreator(false)}
  />
)}
```

4. **Display Polls in Post Component**:
```jsx
import PollDisplay from './components/PollDisplay';
import { usePollByPost } from './hooks/usePolls';

const { poll, hasPoll } = usePollByPost(post.id);

{hasPoll && <PollDisplay poll={poll} />}
```

### Backend Integration

When ready to add backend support:

1. **Create Poll Model** (MongoDB):
```javascript
const PollSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  question: { type: String, required: true, maxlength: 200 },
  options: [{
    text: { type: String, required: true },
    votes: { type: Number, default: 0 },
  }],
  allowVoteChange: { type: Boolean, default: true },
  endsAt: { type: Date },
  totalVotes: { type: Number, default: 0 },
  voters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
```

2. **Update PollContext**:
   - Replace localStorage calls with API calls
   - Use `pollsApi` from endpoints.js
   - Add error handling for network issues
   - Implement optimistic updates

3. **Implement Backend Routes**:
```javascript
// POST /api/polls
// GET /api/polls/:id
// POST /api/polls/:id/vote
// PUT /api/polls/:id/vote
// GET /api/polls/:id/results
// DELETE /api/polls/:id
```

4. **Add Vote Validation**:
   - Check user authentication
   - Verify poll is active
   - Validate vote change permissions
   - Prevent duplicate votes

## Best Practices

### Performance

1. **Lazy Loading**: Components use React.lazy() when possible
2. **Memoization**: Expensive calculations memoized
3. **Debouncing**: Character counters debounced
4. **Optimistic Updates**: UI updates before API response
5. **Progress Bar Animation**: CSS transitions for smooth animation

### UX Considerations

1. **Clear Feedback**: Toast notifications for all actions
2. **Loading States**: Skeleton loaders and spinners
3. **Visual Hierarchy**: Clear winning option display
4. **Status Indicators**: Badges for poll status
5. **Error Messages**: User-friendly error messages
6. **Confirmation**: No confirmation for voting (reversible if allowed)

### Data Management

1. **Validation**: Client-side validation before submission
2. **Sanitization**: Trim whitespace, remove empty options
3. **Uniqueness**: Prevent duplicate options
4. **Limits**: 2-6 options, 200 char question
5. **Expiration**: Automatic poll expiration handling

## Security Notes

### Current Implementation (localStorage)

- Data stored in browser localStorage
- Accessible to all scripts on same origin
- No server-side validation
- Vote manipulation possible (client-side only)

### Future Backend Implementation

1. **Authentication**: Require valid JWT for all operations
2. **Authorization**: Poll creators can delete their polls
3. **Vote Validation**: One vote per user, server-side tracking
4. **Rate Limiting**: Prevent poll spam
5. **Input Sanitization**: Sanitize all user inputs
6. **XSS Prevention**: Escape poll questions and options

## Troubleshooting

### Poll Not Appearing

- Check if PollProvider wraps app
- Verify poll was created successfully
- Check postId matches
- Check browser console for errors

### Vote Not Submitting

- Verify poll is active (not expired)
- Check if vote change is allowed
- Ensure poll exists
- Check localStorage quota

### Results Not Updating

- Hard refresh the page
- Clear localStorage and try again
- Check if poll state is synchronized
- Verify calculations in pollHelpers

### Progress Bars Not Animated

- Check CSS transitions are enabled
- Verify percentage calculations
- Ensure showResults is true
- Check browser compatibility

## Future Enhancements

### Planned Features

1. **Multiple Choice Polls**: Allow selecting multiple options
2. **Image Options**: Add images to poll options
3. **GIF Support**: Animated GIF options
4. **Poll Templates**: Pre-defined poll types (Yes/No, Rating, etc.)
5. **Anonymous Voting**: Hide voter identities
6. **Poll Analytics**: View votes over time chart
7. **Poll Scheduling**: Schedule poll start/end times
8. **Poll Reminders**: Notify users before poll ends
9. **Poll Categories**: Tag polls with categories
10. **Poll Search**: Search polls by keywords

### Backend Features

1. **Real-time Updates**: WebSocket for live results
2. **Vote History**: View user's voting history
3. **Poll Reports**: Report inappropriate polls
4. **Poll Trending**: Show trending polls
5. **Poll Recommendations**: Suggest polls to users
6. **Poll API**: Public API for third-party integrations
7. **Poll Embed**: Embed polls on external sites
8. **Poll Export**: Export to various formats (CSV, PDF)

## Related Issues

- Issue #250: API Integration (base infrastructure)
- Issue #259: Notifications System (notification patterns)
- Issue #308: Collections System (storage patterns)
- Issue #309: Content Moderation (admin patterns)

## Resources

- [date-fns Documentation](https://date-fns.org/)
- [React Context API](https://react.dev/reference/react/useContext)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)

---

**Implementation Status**: ✅ Complete  
**Branch**: `feature/polls-system`  
**Points**: 10 (L3)  
**Issue**: #342  
**Last Updated**: January 2026
