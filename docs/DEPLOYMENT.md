# Frontend Deployment Guide

This guide provides comprehensive instructions for deploying the College Media frontend application to various hosting platforms and environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [Docker Deployment](#docker-deployment)
- [AWS Deployment](#aws-deployment)
- [Azure Deployment](#azure-deployment)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- **Domain Name**: Registered domain for production
- **SSL Certificate**: For HTTPS (most platforms provide this)
- **Monitoring**: Application monitoring service (optional)

### Required Accounts

- [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
- [AWS Account](https://aws.amazon.com) (optional for S3 hosting)
- [Azure Account](https://azure.microsoft.com) (alternative to AWS)

## Environment Configuration

### Environment Variables

Create environment files for different stages:

#### Production (.env.production)
```env
# Application
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college_media_prod

# Authentication
JWT_SECRET=your-production-jwt-secret
ACCESS_TOKEN_SECRET=your-production-access-secret
REFRESH_TOKEN_SECRET=your-production-refresh-secret

# Email Service
RESEND_API_KEY=your-production-resend-key

# AWS Services
AWS_ACCESS_KEY_ID=your-production-aws-key
AWS_SECRET_ACCESS_KEY=your-production-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-production-s3-bucket

# Redis (if using Redis Cloud or similar)
REDIS_URL=redis://username:password@your-redis-host:port

# Security
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Staging (.env.staging)
```env
# Similar to production but with staging URLs and databases
NODE_ENV=staging
CLIENT_URL=https://staging.yourdomain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college_media_staging
```

### Environment Variable Management

- **Vercel**: Set in project settings > Environment Variables
- **Netlify**: Set in site settings > Environment variables
- **Docker**: Use `.env` file or docker-compose environment
- **AWS/Azure**: Use their respective secret management services

## Vercel Deployment

### Frontend Deployment

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

2. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Set different values for production and preview deployments

4. **Domain Configuration**
   - Go to project settings > Domains
   - Add your custom domain
   - Configure DNS records as instructed

5. **Deploy**
   - Push to main branch or create deployment manually
   - Vercel will automatically build and deploy



## Netlify Deployment

### Frontend Deployment

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

3. **Environment Variables**
   - Go to Site settings > Environment variables
   - Add all required variables

4. **Domain Setup**
   - Go to Site settings > Domain management
   - Add custom domain
   - Configure DNS



## Docker Deployment

### Dockerfile (Frontend)

```dockerfile
# Multi-stage build for React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
```

### Running Docker Deployment

```bash
# Build and run with docker-compose
docker-compose up --build

# Or run individually
docker build -t college-media-frontend ./frontend
docker run -p 3000:80 college-media-frontend
```

## AWS Deployment

### EC2 + Docker Deployment

1. **Launch EC2 Instance**
   - Choose Amazon Linux 2 or Ubuntu
   - t3.medium or larger for production
   - Configure security groups (ports 22, 80, 443, 5000)

2. **Install Docker**
   ```bash
   # Update system
   sudo yum update -y  # Amazon Linux
   # or
   sudo apt update && sudo apt upgrade -y  # Ubuntu

   # Install Docker
   sudo amazon-linux-extras install docker  # Amazon Linux
   # or
   sudo apt install docker.io  # Ubuntu

   # Start Docker
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-repo/college-media.git
   cd college-media

   # Run with docker-compose
   sudo docker-compose up -d
   ```

4. **Configure Load Balancer**
   - Create Application Load Balancer
   - Configure target groups for frontend (port 3000) and backend (port 5000)
   - Set up SSL certificate with ACM

### ECS Fargate Deployment

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name college-media-frontend
   aws ecr create-repository --repository-name college-media-backend
   ```

2. **Build and Push Images**
   ```bash
   # Get login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

   # Build and tag images
   docker build -t college-media-frontend ./frontend
   docker build -t college-media-backend ./backend

   # Tag for ECR
   docker tag college-media-frontend:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/college-media-frontend:latest
   docker tag college-media-backend:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/college-media-backend:latest

   # Push images
   docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/college-media-frontend:latest
   docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/college-media-backend:latest
   ```

3. **Create ECS Cluster**
   - Use Fargate launch type
   - Create task definitions for frontend and backend
   - Set up services with load balancers

## Azure Deployment

### App Service Deployment

1. **Create App Service**
   - Go to Azure Portal > App Services
   - Create Web App for frontend (Node.js runtime)
   - Create API App for backend (Node.js runtime)

2. **Configure Deployment**
   - Connect to GitHub repository
   - Set deployment branch
   - Configure build settings

3. **Environment Variables**
   - Set in App Service > Configuration > Application settings

4. **Database Setup**
   - Use Azure Cosmos DB (MongoDB API) or Azure Database for MongoDB

### Container Instances

1. **Create Container Registry**
   ```bash
   az acr create --resource-group your-rg --name youracr --sku Basic
   ```

2. **Build and Push Images**
   ```bash
   # Login to ACR
   az acr login --name youracr

   # Build and tag images
   docker build -t youracr.azurecr.io/college-media-frontend ./frontend
   docker build -t youracr.azurecr.io/college-media-backend ./backend

   # Push images
   docker push youracr.azurecr.io/college-media-frontend
   docker push youracr.azurecr.io/college-media-backend
   ```

3. **Deploy to Container Instances**
   ```bash
   az container create \
     --resource-group your-rg \
     --name college-media-frontend \
     --image youracr.azurecr.io/college-media-frontend \
     --dns-name-label college-media-frontend \
     --ports 80
   ```



## Monitoring and Logging

### Application Monitoring

#### Vercel/Netlify Analytics
- Built-in performance monitoring
- Real-time error tracking
- User analytics

#### External Monitoring (Recommended)

**Sentry for Error Tracking**
```bash
npm install @sentry/react @sentry/tracing
```

```javascript
// Frontend error tracking
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});
```



### Logging Setup

Frontend applications typically use browser developer tools and external monitoring services for logging. For production deployments:

- **Vercel/Netlify**: Built-in logging in deployment dashboards
- **Browser Console**: Use `console.log()`, `console.warn()`, `console.error()`
- **External Services**: Sentry, LogRocket, or similar for error tracking

#### Log Aggregation

**Vercel Analytics**
- Real-time log streaming
- Error tracking and alerting
- Performance metrics

**Netlify Logs**
- Build logs and runtime logs
- Function logs (if using Netlify Functions)
- Access logs and error logs

## Troubleshooting

### Common Deployment Issues

#### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for missing environment variables during build

#### Runtime Errors
- Verify environment variables are set correctly
- Check database connectivity
- Validate API endpoints and CORS settings

#### Performance Issues
- Monitor resource usage (CPU, memory)
- Check database query performance
- Implement caching where appropriate

#### SSL/HTTPS Issues
- Verify certificate installation
- Check domain DNS configuration
- Ensure proper redirect rules

### Rollback Strategy

1. **Version Tagging**
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

2. **Quick Rollback**
   - Most platforms support instant rollback to previous deployment
   - Keep backup of database before major migrations

3. **Blue-Green Deployment**
   - Deploy to staging environment first
   - Test thoroughly before production deployment
   - Use feature flags for gradual rollouts

### Support and Resources

- **Platform Documentation**:
  - [Vercel Docs](https://vercel.com/docs)
  - [Netlify Docs](https://docs.netlify.com)
  - [Docker Docs](https://docs.docker.com)
  - [AWS Docs](https://docs.aws.amazon.com)
  - [Azure Docs](https://docs.microsoft.com/azure)

- **Community Support**:
  - [GitHub Issues](https://github.com/Ewocs/College_Media/issues)
  - [Stack Overflow](https://stackoverflow.com/questions/tagged/college-media)

- **Monitoring Tools**:
  - [Sentry](https://sentry.io)
  - [DataDog](https://datadoghq.com)
  - [New Relic](https://newrelic.com)

This deployment guide covers the most common deployment scenarios. For specific requirements or custom deployments, please refer to the platform-specific documentation or create an issue for additional guidance.