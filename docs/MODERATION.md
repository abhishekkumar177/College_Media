# Content Moderation System Documentation

## Overview
The Content Moderation System provides a comprehensive solution for managing user-reported content and enforcing community guidelines. It includes user-facing report functionality and an admin dashboard for reviewing and actioning reports.

**Issue**: #309  
**Feature Branch**: `feature/content-moderation`

## Features Implemented

### User Features
- **Report Content**: Report inappropriate posts, comments, or profiles
- **Anonymous Reporting**: Reporter identity is hidden from content creators
- **Multiple Report Reasons**: Spam, harassment, violence, hate speech, misinformation, nudity, copyright, other
- **Additional Details**: Optional text field for context
- **Report Confirmation**: Toast notification upon successful submission
- **Appeal System**: Users can contest moderation actions

### Admin Features
- **Moderation Dashboard**: Centralized view of all reports
- **Report Filtering**: Filter by status, content type, reason, and sort options
- **Bulk Actions**: Process multiple reports simultaneously
- **Report Details**: View full context including content preview and history
- **Action Capabilities**: Dismiss, warn user, hide content, suspend user, ban user
- **Action History**: Track all actions taken on each report
- **Statistics Dashboard**: View report trends and metrics
- **Auto-Flag System**: Content is automatically hidden after 5 reports

## File Structure

```
frontend/src/
├── components/
│   ├── ReportButton.jsx          # Trigger button in post/comment menus
│   ├── ReportModal.jsx            # Report submission form
│   └── Post.jsx                   # Updated with report button
├── context/
│   └── ModerationContext.jsx      # Global moderation state
├── hooks/
│   └── useModeration.js           # Custom hooks for moderation
├── pages/
│   └── admin/
│       ├── ModerationDashboard.jsx  # Admin report queue
│       └── ReportDetail.jsx          # Single report review
├── utils/
│   └── reportReasons.js           # Constants and utilities
└── api/
    └── endpoints.js               # API endpoints (updated)
```

## Components

### ReportButton
Location: `frontend/src/components/ReportButton.jsx`

**Props:**
- `contentType` (string): Type of content ('post', 'comment', 'profile', 'message')
- `contentId` (string): ID of the content being reported
- `contentOwnerId` (string): ID of the content owner
- `onReportSubmitted` (function): Callback after successful submission

**Usage:**
```jsx
<ReportButton
  contentType="post"
  contentId={post.id}
  contentOwnerId={post.user.id}
  onReportSubmitted={() => console.log('Reported')}
/>
```

### ReportModal
Location: `frontend/src/components/ReportModal.jsx`

**Props:**
- `contentType` (string): Type of content
- `contentId` (string): ID of content
- `contentOwnerId` (string): ID of owner
- `onClose` (function): Callback to close modal
- `onSuccess` (function): Callback on successful submission

**Features:**
- Radio button selection for report reasons
- Icon and description for each reason
- Optional additional details textarea (500 char limit)
- Anonymous reporting notice
- Loading state during submission
- Error handling

### ModerationDashboard
Location: `frontend/src/pages/admin/ModerationDashboard.jsx`

**Features:**
- Statistics cards (total, pending, resolved, auto-flagged)
- Filter panel (status, content type, reason, sort)
- Bulk selection and actions
- Reports table with key information
- Pagination with "Load More"
- Refresh functionality

### ReportDetail
Location: `frontend/src/pages/admin/ReportDetail.jsx`

**URL**: `/admin/moderation/reports/:reportId`

**Features:**
- Detailed report information
- Content preview
- Action buttons with confirmation
- Action notes field
- Content owner information
- Action history timeline
- Link to original content

## Context & Hooks

### ModerationContext
Location: `frontend/src/context/ModerationContext.jsx`

**State:**
- `reports`: Array of report objects
- `loading`: Loading state
- `filters`: Current filter settings
- `pagination`: Pagination state
- `statistics`: Report statistics

**Actions:**
- `submitReport(reportData)`: Submit new report
- `fetchReports(page, resetList)`: Fetch reports with filters
- `fetchReportDetails(reportId)`: Get single report
- `takeAction(reportId, action, notes)`: Take moderation action
- `bulkAction(reportIds, action, notes)`: Bulk action on reports
- `dismissReport(reportId, reason)`: Dismiss report
- `submitAppeal(reportId, appealData)`: Submit appeal
- `fetchStatistics()`: Get report statistics
- `updateFilters(newFilters)`: Update filter settings
- `resetFilters()`: Reset to default filters
- `checkAutoFlag(reportCount)`: Check if auto-flag threshold reached

### Custom Hooks

**useModeration**: Main hook for accessing context
```javascript
const { reports, loading, submitReport, takeAction } = useModeration();
```

**useReportSubmission**: Simplified report submission
```javascript
const { submit, isSubmitting, error } = useReportSubmission();
```

**useModerationActions**: Admin actions
```javascript
const { performAction, performBulkAction, dismiss, isProcessing } = useModerationActions();
```

**useReports**: Reports with filtering
```javascript
const { reports, loading, filters, loadMore, refresh, applyFilters } = useReports();
```

**useModerationStats**: Statistics
```javascript
const { statistics, loading, refreshStats } = useModerationStats();
```

**useReportDetails**: Single report details
```javascript
const { report, loading, error, loadDetails } = useReportDetails(reportId);
```

## Constants & Utilities

### Report Reasons
Location: `frontend/src/utils/reportReasons.js`

**Constants:**
- `REPORT_REASONS`: Reason value constants
- `REPORT_REASON_LABELS`: Display labels
- `REPORT_REASON_DESCRIPTIONS`: Descriptions for each reason
- `REPORT_REASON_ICONS`: Iconify icon names
- `REPORT_STATUSES`: Status constants (pending, reviewing, resolved, dismissed)
- `MODERATION_ACTIONS`: Available actions (dismiss, warn, hide, suspend, ban, restore)
- `REPORT_CONTENT_TYPES`: Content types (post, comment, profile, message)
- `AUTO_FLAG_THRESHOLD`: Number of reports before auto-hide (5)
- `SUSPENSION_DURATION_DAYS`: Suspension length (7 days)

**Helper Functions:**
- `getReportReasonOptions()`: Returns formatted options for dropdown
- `getModerationActionOptions()`: Returns action options with metadata
- `isValidReportReason(reason)`: Validates reason value
- `isValidContentType(type)`: Validates content type

## API Endpoints

### User Endpoints

**POST /api/reports**
Submit a new report
```javascript
{
  contentType: 'post',
  contentId: '123',
  contentOwnerId: '456',
  reason: 'spam',
  details: 'This looks like spam...'
}
```

**POST /api/appeals**
Submit an appeal
```javascript
{
  reportId: '789',
  reason: 'I believe this was a mistake...',
  additionalInfo: 'Context...'
}
```

### Admin Endpoints

**GET /admin/reports**
Get all reports (paginated, filtered)
```javascript
params: {
  page: 1,
  limit: 20,
  status: 'pending',
  contentType: 'post',
  reason: 'spam',
  sortBy: 'recent'
}
```

**GET /admin/reports/:id**
Get single report details

**PUT /admin/reports/:id/action**
Take action on report
```javascript
{
  action: 'hide_content',
  notes: 'Violates community guidelines'
}
```

**POST /admin/reports/bulk-action**
Bulk action on reports
```javascript
{
  reportIds: ['123', '456', '789'],
  action: 'dismiss',
  notes: 'No violation found'
}
```

**GET /admin/statistics/reports**
Get report statistics
```javascript
{
  total: 150,
  pending: 25,
  reviewing: 10,
  resolved: 100,
  dismissed: 15,
  autoFlagged: 5
}
```

## Routing

Routes added to `frontend/src/routes/AppRoutes.jsx`:

```javascript
<Route path="admin/moderation" element={<ModerationDashboard />} />
<Route path="admin/moderation/reports/:reportId" element={<ReportDetail />} />
```

## Integration Points

### Post Component
- Added more menu (3-dot menu) in header
- Integrated ReportButton in dropdown menu
- Click-outside handler to close menu

### App Providers
- Added `ModerationProvider` wrapping app

## Role-Based Access Control

Admin routes should be protected with authentication middleware:
- Check user role before allowing access to `/admin/*` routes
- Backend should validate admin status for admin endpoints
- Non-admin users attempting to access admin routes should be redirected

**Implementation Note**: Role checking not included in this implementation - should be added based on your authentication system.

## Auto-Flag System

Content is automatically flagged when:
- Report count reaches `AUTO_FLAG_THRESHOLD` (5)
- Content is hidden from public view
- Admin receives notification
- Original poster can appeal the auto-flag

## Best Practices

### For Users
1. Report only genuine violations
2. Provide context in additional details
3. One report per issue (multiple reports don't help)
4. Use appropriate reason category

### For Admins
1. Review content in original context
2. Document reasoning in action notes
3. Apply consistent moderation standards
4. Use warnings before stronger actions
5. Consider user history and intent

## Styling
- Uses Tailwind CSS for all components
- Dark mode support throughout
- Responsive design for mobile/tablet/desktop
- Consistent color scheme:
  - Blue for primary actions
  - Red for reports/warnings
  - Green for success/resolved
  - Yellow for pending/warnings
  - Gray for neutral/dismissed

## Dependencies
- React 18+
- react-router-dom (routing)
- @iconify/react (icons)
- react-hot-toast (notifications)
- date-fns (date formatting)
- Tailwind CSS (styling)

## Testing Checklist
- [ ] Submit report as regular user
- [ ] View reports in admin dashboard
- [ ] Filter reports by status/type/reason
- [ ] Take action on single report
- [ ] Perform bulk action on multiple reports
- [ ] View report details
- [ ] Submit appeal
- [ ] Auto-flag triggers at threshold
- [ ] Toast notifications appear correctly
- [ ] Dark mode works properly
- [ ] Mobile responsive design
- [ ] Role-based access control (if implemented)

## Future Enhancements
- Email notifications to content creators
- Appeal review workflow
- Machine learning for auto-detection
- Content quarantine before removal
- User reputation system
- Moderation audit log
- Export reports functionality
- Report templates for common issues
- Integration with external moderation services

## Troubleshooting

**Reports not loading**
- Check API endpoint configuration
- Verify authentication token
- Check browser console for errors

**Report submission fails**
- Ensure all required fields are provided
- Check network tab for API response
- Verify content IDs are valid

**Admin dashboard not accessible**
- Verify user has admin role
- Check route configuration
- Ensure ModerationProvider is wrapped correctly

## Support
For issues or questions:
1. Check GitHub issue #309
2. Review this documentation
3. Check browser console for errors
4. Contact maintainers

---

**Last Updated**: January 10, 2026  
**Version**: 1.0.0  
**Issue**: #309
