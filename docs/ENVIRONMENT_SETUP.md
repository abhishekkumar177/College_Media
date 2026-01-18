# Frontend Environment Setup Guide

This guide provides comprehensive instructions for setting up the College Media frontend application in various environments, from local development to production deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Docker Development Setup](#docker-development-setup)
- [Production Deployment Setup](#production-deployment-setup)
- [Testing Environment Setup](#testing-environment-setup)
- [CI/CD Pipeline Setup](#cicd-pipeline-setup)
- [Troubleshooting](#troubleshooting)
- [Environment Variables](#environment-variables)

## Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Memory**: Minimum 8GB RAM, Recommended 16GB+
- **Storage**: 10GB free space
- **Network**: Stable internet connection

### Required Software

#### Node.js and npm
```bash
# Check current version
node --version
npm --version

# Install Node.js 18+ (if not installed)
# Windows: Download from https://nodejs.org/
# macOS: brew install node
# Ubuntu: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
#         sudo apt-get install -y nodejs
```

#### Git
```bash
# Check installation
git --version

# Configure Git (replace with your details)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### MongoDB
```bash
# Local installation (optional for development)
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Or use MongoDB Atlas (cloud) - recommended for production
```

#### Redis (Optional)
```bash
# For caching and session management
# Windows: Download from https://redis.io/download
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server
```

### Development Tools

- **Code Editor**: VS Code, WebStorm, or similar
- **Terminal**: PowerShell (Windows), Terminal (macOS), or Bash (Linux)
- **Browser**: Chrome, Firefox, or Edge with developer tools

## Local Development Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Ewocs/College_Media.git
cd College_Media

# Verify clone
ls -la
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables (see Environment Variables section below)
# Use VS Code or your preferred editor
code .env.local
```

### 4. Database Setup

#### Option A: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (free tier available)
3. Create database user and whitelist IP
4. Get connection string and update `.env.local`

#### Option B: Local MongoDB

```bash
# Start MongoDB service
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod

# Verify connection
mongosh --eval "db.runCommand('ping')"
```

### 5. Redis Setup (Optional)

```bash
# Start Redis service
# Windows: redis-server.exe
# macOS: brew services start redis
# Ubuntu: sudo systemctl start redis-server

# Verify connection
redis-cli ping
```

### 6. Database Initialization

```bash
# Run database migrations/seeding (if available)
npm run db:migrate
npm run db:seed

# Or create initial data manually
npm run setup
```

### 7. Start Development Servers

```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend development server
npm run dev

# Verify applications are running
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

### 8. Verify Setup

```bash
# Run tests to ensure everything works
npm test

# Check linting
npm run lint

# Build application
npm run build
```

## Docker Development Setup

### Prerequisites

```bash
# Install Docker
# Windows/macOS: Download Docker Desktop
# Ubuntu: sudo apt-get install docker.io docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Quick Start with Docker Compose

```bash
# Clone repository
git clone https://github.com/Ewocs/College_Media.git
cd College_Media

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### Manual Docker Setup

#### Build Frontend Image

```bash
cd frontend

# Build Docker image
docker build -t college-media-frontend .

# Run container
docker run -p 3000:80 --env-file ../.env college-media-frontend
```

#### Build Backend Image

```bash
cd backend

# Build Docker image
docker build -t college-media-backend .

# Run container
docker run -p 5000:5000 --env-file ../.env college-media-backend
```

#### Run Database Containers

```bash
# MongoDB
docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:6.0

# Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### Docker Development Workflow

```bash
# View running containers
docker ps

# View logs
docker logs college-media-backend
docker logs college-media-frontend

# Stop containers
docker-compose down

# Rebuild after code changes
docker-compose up --build

# Clean up
docker system prune -a
```

## Production Deployment Setup

### 1. Server Requirements

- **VPS/Cloud Instance**: AWS EC2, DigitalOcean Droplet, etc.
- **Minimum Specs**: 2 vCPU, 4GB RAM, 20GB SSD
- **Operating System**: Ubuntu 20.04 LTS or similar

### 2. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git ufw

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### 3. Application Deployment

```bash
# Clone repository
git clone https://github.com/Ewocs/College_Media.git
cd College_Media

# Install dependencies
npm ci --production=false

# Build application
npm run build

# Configure environment
sudo cp .env.example .env.production
sudo nano .env.production  # Edit with production values
```

### 4. Database Setup

```bash
# For MongoDB Atlas, update connection string in .env.production
# For self-hosted MongoDB:
sudo apt install -y mongodb

# Configure MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 5. Process Management with PM2

```bash
# Start backend
pm2 start ecosystem.config.js --env production

# Start frontend (static files served by Nginx)
# Configure Nginx to serve built files

# Save PM2 configuration
pm2 save
pm2 startup
```

### 6. Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/college-media

# Add configuration:
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/college-media /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Configure automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 8. Monitoring Setup

```bash
# Install monitoring tools
sudo npm install -g pm2-logrotate
pm2 install pm2-logrotate

# Set up log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Testing Environment Setup

### Local Testing Environment

```bash
# Create test environment file
cp .env.example .env.test

# Modify for testing
# Use test database
# Disable external services
# Use test email service

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### CI/CD Testing

```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run CI tests
npm run test:ci

# Run E2E tests
npm run test:e2e
```

### Test Database Setup

```bash
# Use MongoDB Memory Server for tests
npm install --save-dev mongodb-memory-server

# Configure test database
# Tests will use in-memory database
```

## CI/CD Pipeline Setup

### GitHub Actions Setup

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run tests
      run: npm test -- --coverage

    - name: Build application
      run: npm run build

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'

    steps:
    - name: Deploy to staging
      # Add deployment steps

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - name: Deploy to production
      # Add deployment steps
```

### Automated Deployment

```bash
# Example deployment script
#!/bin/bash

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Run tests
npm test

# Build application
npm run build

# Restart services
pm2 restart ecosystem.config.js

# Health check
curl -f http://localhost:5000/health || exit 1

echo "Deployment successful!"
```

## Environment Variables

### Required Variables

```env
# Application
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/college_media_dev

# Authentication
JWT_SECRET=your-super-secret-jwt-key
ACCESS_TOKEN_SECRET=your-access-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# Email Service
RESEND_API_KEY=your-resend-api-key

# AWS Services
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Security
ALLOWED_ORIGINS=http://localhost:3000
```

### Environment-Specific Variables

#### Development
```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

#### Production
```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn
```

#### Testing
```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/college_media_test
EMAIL_SERVICE=mock
```

## Troubleshooting

### Common Setup Issues

#### Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solutions**:
```bash
# Find process using port
lsof -i :3000
kill -9 <PID>

# Or change port in .env
PORT=3001
```

#### Database Connection Failed

**Error**: `MongoServerError: Authentication failed`

**Solutions**:
1. Verify connection string in `.env`
2. Check MongoDB service is running
3. Validate credentials
4. Check network connectivity
5. Review MongoDB user permissions

#### Build Errors

**Error**: `Module not found` or `Cannot resolve dependency`

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force

# Check Node.js version
node --version
```

#### Permission Errors

**Error**: `EACCES: permission denied`

**Solutions**:
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm for Node.js management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Memory Issues

**Error**: `JavaScript heap out of memory`

**Solutions**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or add to package.json scripts
"build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
```

#### Docker Issues

**Error**: `docker: command not found`

**Solutions**:
```bash
# Install Docker
# Ubuntu:
sudo apt-get update
sudo apt-get install docker.io

# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

#### SSL Certificate Issues

**Error**: `SSL certificate problem`

**Solutions**:
1. Check certificate validity
2. Verify certificate chain
3. Update CA certificates
4. Use HTTP for development

### Getting Help

If you encounter issues not covered here:

1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Search existing [GitHub Issues](https://github.com/Ewocs/College_Media/issues)
3. Review the [Architecture Documentation](./ARCHITECTURE.md)
4. Create a new issue with:
   - Environment details
   - Error messages
   - Steps to reproduce
   - Configuration files (without secrets)

### Performance Tuning

#### Database Optimization

```javascript
// Add indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ author: 1, createdAt: -1 });
```

#### Application Optimization

```bash
# Enable gzip compression
# Configure in Nginx or Express middleware

# Set up caching
# Use Redis for session storage
# Implement CDN for static assets

# Monitor performance
npm install -g clinic
clinic doctor -- node server.js
```

This environment setup guide provides everything needed to get the College Media platform running in any environment. Follow the appropriate section based on your deployment needs.