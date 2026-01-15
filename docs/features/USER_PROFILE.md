# 👤 User Profile & Editing

## Overview
The Profile system allows users to manage their personal identity, including privacy settings, bio, and profile assets. Editing is handled via a modal interface for a seamless user experience.

## Features

### Profile Management
- **Profile Picture**: Upload JPG/PNG/GIF (Max 5MB) with client-side preview.
- **Personal Details**: Name, Username (unique), Bio (500 chars), Website, Location.
- **Privacy Controls**:
    - **Private Account**: Toggle visibility to followers only.
    - **Activity Status**: Show/hide "Online" status.

### Edit Profile Modal
- **Optimistic UI**: Interface updates immediately upon save.
- **Change Detection**: "Save" button is disabled until form data is modified.
- **Validation**:
    - **Client-side**: Real-time checks for email format and username length.
    - **Server-side**: Uniqueness checks for Username and Email.

## Technical Implementation

### Frontend
- **Component**: `EditProfileModal.jsx` inside `Settings.jsx`.
- **State**: Synchronized via `AuthContext`.
- **API Integration**:
    - `GET /api/account/profile`: Pre-fills the form.
    - `PUT /api/account/profile`: Submits changes.

### Validation Rules
- **Username**: 3-30 chars, alphanumeric.
- **Bio**: Max 500 characters.
- **File Upload**: Validates MIME type and size before generic FormData submission.