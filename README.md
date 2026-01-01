# College Media

![Project Status](https://img.shields.io/badge/Status-Development-green)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8)

A modern, responsive social media dashboard built with React and Vite. This application features a familiar interface with stories, a scrolling feed, suggested accounts, and real-time interaction simulations.

## 📱 Overview

InstaClone is a frontend application designed to replicate the core user experience of popular social media platforms. It features a clean, gradient-themed UI with a focus on visual media, user interactions, and responsive design.

## ✨ Key Features

* **Interactive Story Carousel**:
    * Auto-scrolling functionality.
    * Visual indicators for active stories.
    * User avatars with gradient borders.
* **Dynamic Feed**:
    * Post rendering with headers, media, and captions.
    * **Like Interaction**: Toggle heart animations with instant count updates.
    * Comment counters and "View all" placeholders.
* **Responsive Navigation**:
    * Top sticky navigation bar with search functionality.
    * Sidebar navigation for larger screens (Home, Explore, Reels, etc.).
* **Sidebar Widgets**:
    * **Suggested Accounts**: "Follow" functionality recommendations.
    * **Trending Hashtags**: visual tags for trending topics.
    * **Online Friends**: Quick-view status indicators.
* **Modern UI/UX**:
    * Glassmorphism effects and gradient backgrounds.
    * Smooth transitions and hover effects.
    * Fully responsive grid layout.

## 🛠️ Tech Stack

* **Framework**: [React](https://react.dev/) (v19)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Styling**: Tailwind CSS (Utility classes) & Custom CSS animations.
* **Icons**: SVG Icons (Heroicons style).
* **Linting**: ESLint.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/abhishekkumar177/college_media.git
    cd college_media
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

    *> **Note**: The project relies on Tailwind CSS classes. Ensure your environment is set up to process Tailwind utilities if you modify the styling.*

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open your browser**
    Navigate to `http://localhost:5173` to view the app.

## 📂 Project Structure

```text
src/
├── assets/          # Static assets (logos, images)
├── App.jsx          # Main application logic and layout
├── App.css          # Custom animations and scrollbar styles
├── index.css        # Global styles and resets
└── main.jsx         # Application entry point
public/          # Public assets
```

## 🎨 Customization

#### Modifying Data
The application currently uses mock data arrays located inside `src/App.jsx`. You can modify these arrays to change the content:
- `stories`: Update story avatars and usernames.
- `posts`: Change feed content, likes, and captions.
- `suggestedAccounts`: Update sidebar recommendations.

#### Styling
- **Tailwind**: Most styling is handled via utility classes in `App.jsx`.
- **Custom CSS**: specialized animations (like the like button bounce) are defined in `src/App.css`.

## 🔮 Future Improvements
- [ ] Backend integration for real authentication.
- [ ] Image upload functionality for creating new posts.
- [ ] Dark mode toggle.
- [ ] Real-time chat implementation in the Messages tab.

## 📄 License
This project is open source and available under the [MIT License](https://www.google.com/search?q=LICENSE).