# Advanced Syllabus Component Documentation

## Overview

The `AdvancedSyllabus` component creates an interactive course syllabus view with scroll-triggered animations. It features sticky section headers, animated progress connectors, and smooth text reveal animations as users scroll through course content.

## Features

### 1. **Sticky Section Headers**
- Module titles stick to the top as the user scrolls through lessons
- Smooth transitions between modules
- Active state indicator showing the current module in view
- Responsive positioning on mobile devices

### 2. **Visual Progress Connectors**
- SVG-based vertical progress line that animates with scroll position
- Gradient coloring (blue to purple) for visual appeal
- Dynamically sized based on total course content
- Smooth path drawing animation using GSAP ScrollTrigger

### 3. **Text Reveal Animations**
- Individual character-by-character reveal animations for lesson descriptions
- Based on ScrollFloat.jsx animation logic
- Triggered when lessons enter the viewport
- Uses GSAP with staggered timing for smooth reveal effect

### 4. **Lesson Content Structure**
- Lesson numbers with gradient backgrounds
- Lesson titles and descriptions
- Topic badges with hover effects
- Responsive layout for all screen sizes

## Component Props

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `courseMaterial` | Array | `[]` | Array of module objects containing course structure |

### Course Material Structure

Each module object should have:

```javascript
{
  title: "Module Title",           // String: Module name (displayed in sticky header)
  subtitle: "Module Subtitle",     // String: Brief description of the module
  lessons: [
    {
      title: "Lesson Title",       // String: Lesson name
      description: "Lesson text",  // String: Full lesson description (animated)
      topics: ["Topic1", "Topic2"] // Array: Related topics/tags
    }
  ]
}
```

## Usage Example

```jsx
import AdvancedSyllabus from '../components/AdvancedSyllabus';

const MyCoursePage = () => {
  const courseMaterial = [
    {
      title: 'Module 1: Fundamentals',
      subtitle: 'Master the basics',
      lessons: [
        {
          title: 'Introduction',
          description: 'Learn the foundational concepts...',
          topics: ['Basics', 'Theory']
        },
        {
          title: 'Setup',
          description: 'Configure your environment...',
          topics: ['Setup', 'Installation']
        }
      ]
    }
  ];

  return <AdvancedSyllabus courseMaterial={courseMaterial} />;
};

export default MyCoursePage;
```

## Technical Implementation

### Dependencies
- **React** 18.3.1+
- **GSAP** 3.x (with ScrollTrigger plugin)
- **CSS3** with Flexbox and Grid

### Key Technologies Used

1. **GSAP ScrollTrigger**
   - Monitors scroll position for progress line animation
   - Triggers text reveal animations when lessons enter viewport
   - Manages sticky header transformations

2. **SVG Path Animation**
   - Uses stroke-dasharray and stroke-dashoffset properties
   - Animates based on scroll progress from 0% to 100%
   - Includes gradient coloring for visual appeal

3. **React Hooks**
   - `useRef`: Manages DOM element references for animations
   - `useEffect`: Initializes GSAP animations and cleanup
   - `useState`: Tracks active module for UI updates

## File Structure

```
src/
├── components/
│   ├── AdvancedSyllabus.jsx          # Main component
│   └── AdvancedSyllabus.css          # Styles
└── pages/
    └── AdvancedSyllabusPage.jsx      # Demo page
```

## Demo Page

A complete demo page is available at: `src/pages/AdvancedSyllabusPage.jsx`

This page includes:
- Three sample modules
- Multiple lessons per module
- Various topic tags
- Full responsive layout testing

## Integration with Existing Code

The component integrates seamlessly with:
- Existing GSAP setup (ScrollFloat.jsx uses same pattern)
- Current Tailwind CSS configuration
- React Router for page navigation
- Responsive design system
