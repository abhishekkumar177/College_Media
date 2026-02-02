# 🎓 College Media

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/React-19+-blue?style=for-the-badge&logo=react" alt="React Version" />
  <img src="https://img.shields.io/badge/MongoDB-7+-green?style=for-the-badge&logo=mongodb" alt="MongoDB Version" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/PRs-Welcome-orange?style=for-the-badge" alt="PRs Welcome" />
  <img src="https://visitor-badge.laobi.icu/badge?page_id=abhishekkumar177.College_Media&style=for-the-badge" alt="Visitor Count" />
</div>


<div align="center">
  <h3>🌟 A full-stack social media platform built for college students</h3>
  <p>Connect, share posts, and engage with your community using our MERN stack application with AI chatbot integration</p>
</div>

---

## 📋 Table of Contents

- [🎓 College Media](#-college-media)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [🏗️ Architecture](#️-architecture)
    - [🏛️ Architecture Components](#️-architecture-components)
    - [🔄 Data Flow](#-data-flow)
    - [🛡️ Security Architecture](#️-security-architecture)
  - [🤖 Chatbot](#-chatbot)
  - [🚀 Quick Start](#-quick-start)
    - [Prerequisites](#prerequisites)
    - [⚡ Quick Setup (Recommended)](#-quick-setup-recommended)
  - [📖 API Documentation](#-api-documentation)
    - [🔐 Authentication Endpoints](#-authentication-endpoints)
    - [📝 Posts Endpoints](#-posts-endpoints)
  - [🔧 Environment Variables](#-environment-variables)
    - [Required Variables](#required-variables)
    - [Optional Variables (Email)](#optional-variables-email)
  - [🌐 Deployment](#-deployment)
    - [Recommended Platforms](#recommended-platforms)
    - [Production Checklist](#production-checklist)
  - [📁 Project Structure](#-project-structure)
  - [🤝 Contributing](#-contributing)
    - [📋 How to Contribute](#-how-to-contribute)
    - [📖 Contribution Guidelines](#-contribution-guidelines)
  - [📄 License](#-license)

---

## ✨ Features

<div align="center">
  <table>
    <tr>
      <td align="center">
        <h4>🔐 Authentication</h4>
        <p>Secure JWT-based user registration and login</p>
      </td>
      <td align="center">
        <h4>📝 Posts & Media</h4>
        <p>Create and share posts with text and images</p>
      </td>
      <td align="center">
        <h4>❤️ Interactions</h4>
        <p>Like and engage with community posts</p>
      </td>
    </tr>
    <tr>
      <td align="center">
        <h4>🤖 AI Chatbot</h4>
        <p>Intelligent assistant for platform guidance</p>
      </td>
      <td align="center">
        <h4>📱 Responsive</h4>
        <p>Beautiful UI with Material-UI & Tailwind CSS</p>
      </td>
      <td align="center">
        <h4>🔒 Security</h4>
        <p>Protected API endpoints with middleware</p>
      </td>
    </tr>
  </table>
</div>

---

## 🛠️ Tech Stack

<div align="center">
  <h3>Frontend</h3>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=mui&logoColor=white" alt="Material-UI" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />

  <h3>Backend</h3>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white" alt="Mongoose" />

  <h3>Security & Tools</h3>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/bcryptjs-000000?style=for-the-badge" alt="bcryptjs" />
  <img src="https://img.shields.io/badge/CORS-000000?style=for-the-badge" alt="CORS" />
</div>

---

## 🏗️ Architecture

<div align="center">
  <h3>System Architecture Overview</h3>
</div>

```mermaid
graph TB
    %% User Layer
    subgraph "👥 Users"
        U[College Students]
    end

    %% Frontend Layer
    subgraph "🎨 Frontend Layer"
        subgraph "React Application"
            A[App.jsx<br/>Main Component]
            N[Navbar.jsx<br/>Navigation]
            H[Hero.jsx<br/>Landing Page]
            HP[Home.jsx<br/>Dashboard]
            L[Login.jsx<br/>Authentication]
            S[Signup.jsx<br/>Registration]
            P[Profile.jsx<br/>User Profile]
        end

        subgraph "UI Components"
            F[Features.jsx<br/>Feature Showcase]
            T[Team.jsx<br/>Team Section]
            FT[Footer.jsx<br/>Site Footer]
            CTA[CTA.jsx<br/>Call to Action]
            AB[About.jsx<br/>About Section]
        end

        subgraph "Social Features"
            SF[SocialFeed.jsx<br/>Post Feed]
            PC[PostCard.jsx<br/>Individual Posts]
        end

        subgraph "🤖 Chatbot System"
            CW[ChatbotWidget.jsx<br/>Chat Interface]
            CB[ChatBody.jsx<br/>Chat Messages]
            CH[ChatHeader.jsx<br/>Chat Header]
            CI[ChatInput.jsx<br/>Message Input]
            CS[chat.service.js<br/>Chat Logic]
        end

        subgraph "🔄 State Management"
            AC[AuthContext.jsx<br/>User Auth State]
            CC[ChatContext.jsx<br/>Chat State]
            UC[useChat.js<br/>Chat Hooks]
            UCB[useChatbot.js<br/>Chatbot Hooks]
        end
    end

    %% API Layer
    subgraph "🔧 Backend API Layer"
        subgraph "Express Server"
            ES[server.js<br/>Main Server]
            AM[authMiddleware.js<br/>JWT Auth]
        end

        subgraph "API Routes"
            AR[auth.js<br/>Auth Routes<br/>POST /register<br/>POST /login]
            PR[posts.js<br/>Post Routes<br/>GET /posts<br/>POST /posts<br/>PUT /posts/:id/like]
        end

        subgraph "Business Logic"
            SE[sendEmail.js<br/>Email Service]
        end
    end

    %% Data Layer
    subgraph "🗄️ Data Layer"
        subgraph "MongoDB Database"
            UM[User Model<br/>User.js]
            PM[Post Model<br/>Post.js]
        end
    end

    %% External Services
    subgraph "🌐 External Services"
        MG[MongoDB Atlas<br/>Cloud Database]
        EM[Email Service<br/>SMTP Provider]
    end

    %% Connections
    U --> A
    A --> N
    A --> H
    A --> HP
    A --> L
    A --> S
    A --> P

    HP --> SF
    SF --> PC

    A --> CW
    CW --> CB
    CW --> CH
    CW --> CI
    CI --> CS

    AC --> A
    CC --> CW
    UC --> CC
    UCB --> CW

    A --> AR
    A --> PR
    AR --> AM
    PR --> AM
    AM --> ES

    ES --> UM
    ES --> PM
    ES --> SE

    UM --> MG
    PM --> MG
    SE --> EM

    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef user fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class U user
    class A,H,HP,L,S,P,N,F,T,FT,CTA,AB,SF,PC,CW,CB,CH,CI,CS,AC,CC,UC,UCB frontend
    class ES,AM,AR,PR,SE backend
    class UM,PM database
    class MG,EM external
```

### 🏛️ Architecture Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React + Vite | User interface and client-side logic |
| **Backend** | Node.js + Express | API server and business logic |
| **Database** | MongoDB + Mongoose | Data storage and retrieval |
| **Authentication** | JWT + bcryptjs | Secure user authentication |
| **Chatbot** | Client-side Service | AI-powered user assistance |
| **Email Service** | SMTP | User notifications and welcome emails |

### 🔄 Data Flow

1. **User Registration/Login** → Frontend → Auth API → JWT Token → Database
2. **Post Creation** → Frontend → Posts API → Database → Real-time Update
3. **Chatbot Interaction** → Frontend Service → Predefined Responses
4. **Email Notifications** → Backend → SMTP Service → User Email

### 🛡️ Security Architecture

- **JWT Authentication** for API protection
- **Password Hashing** with bcryptjs
- **CORS Configuration** for cross-origin requests
- **Input Validation** and sanitization
- **Environment Variables** for sensitive data

---

## 🤖 Chatbot

<div align="center">
  <img src="https://via.placeholder.com/600x300/4F46E5/FFFFFF?text=AI+Chatbot+Demo" alt="Chatbot Demo" width="600" />
</div>

The application includes a built-in AI-powered chatbot that provides:
- 📚 Platform feature explanations
- ❓ Help with common queries
- 🎯 Guided user assistance
- 💬 Interactive conversations

*Implemented as a client-side service with predefined intelligent responses*

---

## 🚀 Quick Start

### Prerequisites

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js" alt="Node.js" /><br/>
        <a href="https://nodejs.org/">Download Node.js</a>
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/MongoDB-7+-47A248?style=flat&logo=mongodb" alt="MongoDB" /><br/>
        <a href="https://www.mongodb.com/atlas">MongoDB Atlas</a><br/>
        <a href="https://www.mongodb.com/try/download/community">Local MongoDB</a>
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white" alt="Git" /><br/>
        <a href="https://git-scm.com/">Download Git</a>
      </td>
    </tr>
  </table>
</div>

### ⚡ Quick Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ewocs/College_Media.git
   cd College_Media
   ```

2. **Environment Setup**
   ```bash
   # Copy environment template
   cp backend/.env.example backend/.env
   ```

3. **Configure Environment**
   ```env
   MONGODB_URI=mongodb://localhost:27017/college-media
   # OR for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/college-media
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   # Optional: Email configuration for welcome emails
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

4. **Install & Run**
   ```bash
   # Backend
   cd backend
   npm install
   npm run dev

   # Frontend (in new terminal)
   cd ../frontend
   npm install
   npm run dev
   ```

5. **🎉 Access the application**
   - 🌐 Frontend: [http://localhost:5173](http://localhost:5173)
   - 🔧 Backend API: [http://localhost:5000](http://localhost:5000)

---

## 📖 API Documentation

### 🔐 Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login user |

### 📝 Posts Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts` | Get all posts |
| `POST` | `/api/posts` | Create a new post *(auth required)* |
| `PUT` | `/api/posts/:id/like` | Like/unlike a post *(auth required)* |

📋 **Detailed API docs:** [backend/API.md](backend/API.md)

---

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `PORT` | Backend server port | ❌ *(defaults to 5000)* |
| `NODE_ENV` | Environment mode | ❌ *(defaults to development)* |

### Optional Variables (Email)

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAIL_HOST` | SMTP server host | ❌ |
| `EMAIL_PORT` | SMTP server port | ❌ |
| `EMAIL_USER` | SMTP username | ❌ |
| `EMAIL_PASS` | SMTP password | ❌ |
| `EMAIL_FROM` | Sender email | ❌ |

> 🔒 **Security Notes:**
> - Never commit `.env` to version control
> - Use strong, unique `JWT_SECRET` values
> - For production, use secure credential management

---

## 🌐 Deployment

### Recommended Platforms

<div align="center">
  <table>
    <tr>
      <td align="center">
        <h4>🎨 Frontend</h4>
        <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /><br/>
        <a href="https://vercel.com">Vercel</a>
      </td>
      <td align="center">
        <h4>⚙️ Backend</h4>
        <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render" /><br/>
        <a href="https://render.com">Render</a>
      </td>
      <td align="center">
        <h4>🗄️ Database</h4>
        <img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas" /><br/>
        <a href="https://www.mongodb.com/atlas">MongoDB Atlas</a>
      </td>
    </tr>
  </table>
</div>

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Configure MongoDB Atlas security
- [ ] Test all endpoints locally
- [ ] Configure CORS for production domain

📚 **Detailed deployment guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📁 Project Structure

```
college-media/
├── 🎯 backend/
│   ├── 📄 API.md
│   ├── 📦 package.json
│   ├── 🚀 server.js
│   ├── 🛡️ middleware/
│   │   └── 🔐 authMiddleware.js
│   ├── 📊 models/
│   │   ├── 👤 User.js
│   │   └── 📝 Post.js
│   ├── 🛣️ routes/
│   │   ├── 🔐 auth.js
│   │   └── 📝 posts.js
│   └── 🛠️ utils/
│       └── 📧 sendEmail.js
├── 🎨 frontend/
│   ├── ⚙️ eslint.config.js
│   ├── 🌐 index.html
│   ├── 📦 package.json
│   ├── ⚙️ postcss.config.js
│   ├── 🎨 tailwind.config.js
│   ├── ⚙️ vite.config.js
│   ├── 📁 public/
│   └── 📁 src/
│       ├── ⚛️ App.jsx
│       ├── 🎨 index.css
│       ├── 🚀 main.jsx
│       ├── 📁 assets/
│       ├── 🧩 components/
│       │   ├── ℹ️ About.jsx
│       │   ├── 📞 CTA.jsx
│       │   ├── ✨ Features.jsx
│       │   ├── 🦶 Footer.jsx
│       │   ├── 🦸 Hero.jsx
│       │   ├── 🧭 Navbar.jsx
│       │   ├── 👥 Team.jsx
│       │   └── 🤖 chatbot/
│       │       ├── 💬 chat.service.js
│       │       ├── 💬 ChatBody.jsx
│       │       ├── 🤖 ChatbotWidget.jsx
│       │       ├── 🗣️ ChatHeader.jsx
│       │       └── 💬 ChatInput.jsx
│       ├── 🔄 context/
│       │   ├── 🔐 AuthContext.jsx
│       │   ├── 💬 ChatContext.jsx
│       │   └── 💬 useChat.js
│       ├── 🪝 hooks/
│       │   └── 🤖 useChatbot.js
│       ├── 📄 pages/
│       │   ├── 🏠 Home.jsx
│       │   ├── 🔑 Login.jsx
│       │   ├── 👤 Profile.jsx
│       │   └── 🔐 Signup.jsx
│       └── 🎨 styles/
│           ├── 💬 chatbot.css
│           └── 🎨 main.css
├── 📚 .github/
│   └── 📋 ISSUE_TEMPLATE/
│       └── 📖 documentation-improvement.yml
├── 🚫 .gitignore
└── 📖 README.md
```

---

## 🤝 Contributing

<div align="center">
  <img src="https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge" alt="Contributions Welcome" />
</div>

We love your input! We want to make contributing to this project as easy and transparent as possible.

### 📋 How to Contribute

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **Push** to the branch (`git push origin feature/AmazingFeature`)
5. 🔄 **Open** a Pull Request

### 📖 Contribution Guidelines

- 📚 Check our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines
- 🐛 Report bugs using GitHub issues
- 💡 Suggest features and improvements
- 📝 Follow our code style guidelines in [CODE_STYLE.md](CODE_STYLE.md)


> 🚨 **ECWoC’26 Contribution Rules**:  
> All contributions must follow the guidelines specified in [CONTRIBUTING.md](CONTRIBUTING.md), including issue labeling, PR deadlines, and code standards. Contributors will be acknowledged in the README and event dashboard.
> 

## 📄 License

<div align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License" />
</div>

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h3>🎉 Happy Coding! 🎉</h3>
  <p>Made with ❤️ for college students worldwide</p>
  <img src="https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge" alt="Made with Love" />
</div>
