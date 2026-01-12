# 🎨 Error Message Examples - Visual Guide

## Issue #349: API Error Handling Enhancement

This document shows examples of all error messages and notifications users will see.

---

## 📱 Toast Notifications

### 1. Network Error
```
┌─────────────────────────────────────────────┐
│ 🔌 No internet connection.                  │
│    Please check your network.               │
│                                             │
│ Background: #FEE2E2 (Light Red)             │
│ Text: #991B1B (Dark Red)                    │
│ Duration: 4 seconds                         │
└─────────────────────────────────────────────┘
```

### 2. Authentication Error (401)
```
┌─────────────────────────────────────────────┐
│ 🔐 Please login to continue.                │
│                                             │
│ Background: Default Error Red               │
│ Text: White                                 │
│ Duration: 4 seconds                         │
│ Action: Auto-logout triggered               │
└─────────────────────────────────────────────┘
```

### 3. Validation Error (400)
```
┌─────────────────────────────────────────────┐
│ ⚠️  Please check your input and try again.  │
│                                             │
│ Background: #FEF3C7 (Light Yellow)          │
│ Text: #92400E (Dark Yellow)                 │
│ Duration: 4 seconds                         │
└─────────────────────────────────────────────┘
```

### 4. Rate Limit Error (429)
```
┌─────────────────────────────────────────────┐
│ 🚦 Too many requests. Try again in 30s.     │
│                                             │
│ Background: Default Error Red               │
│ Text: White                                 │
│ Duration: 6 seconds (longer)                │
└─────────────────────────────────────────────┘
```

### 5. Server Error (500)
```
┌─────────────────────────────────────────────┐
│ 🔧 Server error. Our team has been          │
│    notified.                                │
│                                             │
│ Background: Default Error Red               │
│ Text: White                                 │
│ Duration: 4 seconds                         │
└─────────────────────────────────────────────┘
```

### 6. Retry Notification (During Retry)
```
┌─────────────────────────────────────────────┐
│ 🔄 Retrying... (1/3)                        │
│                                             │
│ Background: #DBEAFE (Light Blue)            │
│ Text: #1E40AF (Dark Blue)                   │
│ Duration: 2 seconds                         │
│ Type: Loading indicator                     │
└─────────────────────────────────────────────┘
```

### 7. Connection Restored (After Retry Success)
```
┌─────────────────────────────────────────────┐
│ ✅ Connection restored!                     │
│                                             │
│ Background: Default Success Green           │
│ Text: White                                 │
│ Duration: 2 seconds                         │
└─────────────────────────────────────────────┘
```

### 8. Offline Notification (Persistent)
```
┌─────────────────────────────────────────────┐
│ 📡 You are offline. Please check your       │
│    internet connection.                     │
│                                             │
│ Background: #FEE2E2 (Light Red)             │
│ Text: #991B1B (Dark Red)                    │
│ Duration: Infinity (until dismissed)        │
│ Position: Bottom Center                     │
└─────────────────────────────────────────────┘
```

### 9. Back Online Notification
```
┌─────────────────────────────────────────────┐
│ ✅ Back online!                             │
│                                             │
│ Background: Default Success Green           │
│ Text: White                                 │
│ Duration: 2 seconds                         │
│ Position: Bottom Center                     │
└─────────────────────────────────────────────┘
```

---

## 🚨 Offline Banner (Top of Page)

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  📡  No Internet Connection  •  Some features may not work    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Background: #DC2626 (Red)
Text: White
Position: Fixed top, full width
Z-index: 50 (above most content)
```

---

## 🎯 Error Boundary UI

### API Error Detected (Retryable)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   🔴  Oops! Something went wrong                            │
│   We apologize for the inconvenience. Our team has been     │
│   notified.                                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   What can you do?                                          │
│   • Try refreshing the page                                 │
│   • Go back to the home page                                │
│   • Clear your browser cache and cookies                    │
│   • Try again in a few minutes                              │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 📶 Connection Issue Detected                        │   │
│   │                                                     │   │
│   │ This appears to be a temporary connection issue.   │   │
│   │ Retrying may resolve the problem.                  │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌──────────────┐  ┌──────────────┐                        │
│   │ 🔄 Try Again │  │  🏠 Go Home  │                        │
│   └──────────────┘  └──────────────┘                        │
│                                                             │
│   Error ID: ABC123XYZ • Occurrence: 1                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Error Message Mapping

### Complete HTTP Status Code Messages

| Code | Icon | Message | Retryable |
|------|------|---------|-----------|
| 400 | ⚠️ | Invalid request. Please check your input. | ❌ |
| 401 | 🔐 | Session expired. Please login again. | ❌ |
| 403 | 🚫 | You don't have permission to perform this action. | ❌ |
| 404 | 🔍 | The requested resource was not found. | ❌ |
| 408 | ⏱️ | Request timeout. Please try again. | ✅ |
| 409 | ⚡ | This action conflicts with existing data. | ❌ |
| 422 | ⚠️ | Unable to process your request. Please check the data. | ❌ |
| 429 | 🚦 | Too many requests. Please slow down. | ✅ |
| 500 | 🔧 | Server error. Our team has been notified. | ✅ |
| 502 | 🔄 | Service temporarily unavailable. Retrying... | ✅ |
| 503 | 🛠️ | Service under maintenance. Please try again later. | ✅ |
| 504 | ⏱️ | Gateway timeout. Please try again. | ✅ |

---

## 🎬 User Flow Examples

### Scenario 1: Network Failure with Retry

```
1. User clicks "Create Post"
   ↓
2. Network disconnects
   ↓
3. Toast: "🔄 Retrying... (1/3)" (2s)
   ↓
4. Wait 1 second
   ↓
5. Toast: "🔄 Retrying... (2/3)" (2s)
   ↓
6. Wait 2 seconds
   ↓
7. Network reconnects
   ↓
8. Toast: "🔄 Retrying... (3/3)" (2s)
   ↓
9. Success!
   ↓
10. Toast: "✅ Connection restored!" (2s)
```

### Scenario 2: Going Offline

```
1. User browsing normally
   ↓
2. Internet disconnects
   ↓
3. Red banner appears at top: "📡 No Internet Connection"
   ↓
4. Toast (bottom center): "📡 You are offline..."
   ↓
5. User tries to load page
   ↓
6. Toast: "🔌 No internet connection. Please check your network."
   ↓
7. Internet reconnects
   ↓
8. Banner disappears
   ↓
9. Toast: "✅ Back online!" (2s)
```

### Scenario 3: Validation Error

```
1. User submits form with empty required field
   ↓
2. API returns 400 with validation errors
   ↓
3. Toast: "⚠️ Please check your input and try again."
   ↓
4. Form shows field-specific errors
   ↓
5. User corrects and resubmits
   ↓
6. Success!
```

---

## 🎨 Color Palette

### Toast Backgrounds
- **Error (Network)**: `#FEE2E2` (Light Red)
- **Error (Default)**: Default react-hot-toast red
- **Warning (Validation)**: `#FEF3C7` (Light Yellow)
- **Info (Retry)**: `#DBEAFE` (Light Blue)
- **Success**: Default react-hot-toast green

### Text Colors
- **Error Text**: `#991B1B` (Dark Red)
- **Warning Text**: `#92400E` (Dark Yellow/Brown)
- **Info Text**: `#1E40AF` (Dark Blue)
- **Success Text**: White

### Banner
- **Offline Banner**: `#DC2626` (Red 600)
- **Banner Text**: White

---

## ♿ Accessibility Features

### ARIA Labels
```html
<!-- Offline Banner -->
<div role="alert" aria-live="assertive" aria-atomic="true">
  No Internet Connection
</div>

<!-- Error Boundary -->
<button aria-label="Try again to reload the page">
  Try Again
</button>

<!-- Network Indicator -->
<div role="status" aria-live="polite">
  Connection status: Offline
</div>
```

### Keyboard Navigation
- All buttons are keyboard accessible
- Tab order is logical
- Enter/Space activates buttons
- Focus indicators visible

### Screen Reader Announcements
- Errors announced with `role="alert"`
- Status changes announced with `aria-live="polite"`
- Critical errors use `aria-live="assertive"`

---

## 📱 Responsive Behavior

### Mobile (< 640px)
- Toast notifications: Full width with padding
- Offline banner: Shorter text, icon only
- Error boundary: Stacked buttons

### Tablet (640px - 1024px)
- Toast notifications: Max width 400px
- Offline banner: Full message visible
- Error boundary: Side-by-side buttons

### Desktop (> 1024px)
- Toast notifications: Max width 400px, positioned right
- Offline banner: Full message with details
- Error boundary: Centered modal, max width 600px

---

## 🔔 Notification Positions

```
┌─────────────────────────────────────────┐
│ [Offline Banner - Top, Full Width]     │ ← Fixed position
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         [Main Content]                  │
│                                         │
│                                         │
│                                         │
│                 [Toast - Top Right] ←   │ ← Default position
│                                         │
│                                         │
│                                         │
│                                         │
│     [Offline Toast - Bottom Center] ←  │ ← Persistent offline
└─────────────────────────────────────────┘
```

---

## 🎯 Design Principles

1. **Clear & Concise**: Messages are short and actionable
2. **Friendly Tone**: No technical jargon
3. **Visual Hierarchy**: Icons + color coding
4. **Contextual**: Different styles for different error types
5. **Accessible**: ARIA labels, keyboard support, screen reader friendly
6. **Responsive**: Works on all screen sizes
7. **Non-Intrusive**: Toasts auto-dismiss, don't block content

---

**Visual Guide Complete!** 🎨

This guide shows exactly what users will see when errors occur, making it easy for designers and developers to understand the user experience.

---

**Contributor**: @SatyamPandey-07  
**Issue**: #349  
**ECWoC 2026**
