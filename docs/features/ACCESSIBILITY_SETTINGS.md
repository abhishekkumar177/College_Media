# ♿ Accessibility: Font Size Settings

## Overview
To improve readability for all users, the application supports global font size adjustments. This preference persists across sessions.

## Features
- **3 Levels**:
    - **Small**: Default interface size.
    - **Medium**: 110% scale.
    - **Large**: 125% scale for maximum readability.
- **Live Preview**: Users see the effect immediately in the settings modal before applying.

## Implementation
- **Context**: Managed via `ThemeContext` or `UIContext`.
- **CSS Variables**: The root `html` font-size or specific utility classes are updated based on the selection.
- **Storage**: Preference is saved in `localStorage` under `user_preferences`.