# 🎓 Alumni Connect System

## Overview
The Alumni Connect system bridges the gap between current students and alumni, facilitating mentorship, networking, and career guidance.

## Core Features

### 1. Connection Management
- **Send Requests**: Students can send connection requests with a personalized note.
- **Status Tracking**: Requests track `pending`, `accepted`, or `rejected` states.
- **Withdrawal**: Ability to withdraw a pending request before it is accepted.

### 2. Profile Viewing
- **Alumni Profiles**: Detailed views including graduation year, current company, role, and industry.
- **Privacy Awareness**: Contact details are hidden until a connection is established.

### 3. Search & Discovery
- **Filters**: Search alumni by:
    - Name
    - Company / Organization
    - Graduation Year
    - Department/Major
- **Pagination**: Efficient loading of results for large alumni bases.

## Technical Implementation
- **API**: `/api/alumni/connect`
- **Database**: `AlumniConnection` model links `studentId` and `alumniId`.