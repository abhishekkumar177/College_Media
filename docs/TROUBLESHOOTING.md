# Troubleshooting Guide

This guide provides solutions to common issues encountered during development, testing, and deployment of the College Media platform.

## Table of Contents

- [Build Errors](#build-errors)
- [Runtime Errors](#runtime-errors)
- [Database Connection Issues](#database-connection-issues)
- [Authentication Problems](#authentication-problems)
- [Performance Issues](#performance-issues)
- [Testing Failures](#testing-failures)
- [Deployment Problems](#deployment-problems)
- [Common Commands](#common-commands)

## Build Errors

### Terser Not Found Error

**Error Message:**
```
[vite:terser] terser not found. Since Vite v3, terser has become an optional dependency. You need to install it.
```

**Solution:**
1. Install terser as a dev dependency:
   ```bash
   npm install --save-dev terser
   ```
2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```
3. Rebuild the project:
   ```bash
   npm run build
   ```

### Module Not Found Errors

**Error Message:**
```
Cannot resolve module 'package-name'
```

**Solutions:**
1. Check if the package is listed in `package.json` dependencies
2. Install missing dependencies:
   ```bash
   npm install
   ```
3. Verify Node.js version compatibility in `package.json`
4. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
5. Check for typos in import statements

### TypeScript Compilation Errors

**Error Message:**
```
Property 'X' does not exist on type 'Y'
```

**Solutions:**
1. Check TypeScript configuration in `tsconfig.json`
2. Verify type definitions are installed
3. Update type definitions:
   ```bash
   npm install --save-dev @types/package-name
   ```
4. Check for missing interface properties

### ESLint Errors

**Error Message:**
```
error: 'variable' is defined but never used
```

**Solutions:**
1. Fix the linting errors by removing unused variables or adding eslint-disable comments
2. Run linting with fix option:
   ```bash
   npm run lint -- --fix
   ```
3. Update ESLint configuration if needed

## Runtime Errors

### Authentication Issues

#### Users Cannot Log In

**Symptoms:**
- Login requests return 401 Unauthorized
- JWT token not generated

**Solutions:**
1. Verify JWT_SECRET environment variable is set:
   ```bash
   echo $JWT_SECRET
   ```
2. Check token expiration settings in `token.util.js`
3. Validate user credentials exist in database
4. Check CORS configuration in `server.js`
5. Verify bcrypt salt rounds match between registration and login

#### Invalid Token Errors

**Error Message:**
```
JsonWebTokenError: invalid signature
```

**Solutions:**
1. Ensure ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are set
2. Check if secrets match between token generation and verification
3. Verify token hasn't been tampered with
4. Check token expiration

### Database Connection Errors

#### Cannot Connect to MongoDB

**Error Message:**
```
MongoServerError: Authentication failed
```

**Solutions:**
1. Verify connection string format in `.env`:
   ```
   MONGODB_URI=mongodb://username:password@host:port/database
   ```
2. Check MongoDB server status:
   ```bash
   # For local MongoDB
   brew services list | grep mongodb
   # Or check process
   ps aux | grep mongod
   ```
3. Validate credentials in connection string
4. Check network connectivity:
   ```bash
   ping your-mongodb-host
   ```
5. Review firewall settings and security groups

#### Connection Timeout

**Error Message:**
```
MongoTimeoutError: Server selection timed out
```

**Solutions:**
1. Increase connection timeout in `config/db.js`
2. Check network latency to database server
3. Verify database server is accepting connections
4. Check for VPN or proxy interference

### API Endpoint Errors

#### 404 Not Found

**Symptoms:**
- API endpoints return 404
- Routes not being registered

**Solutions:**
1. Check route registration in `server.js`
2. Verify route paths match in frontend requests
3. Check for middleware interfering with routes
4. Verify server is running on correct port

#### 500 Internal Server Error

**Symptoms:**
- Unexpected server errors
- Application crashes

**Solutions:**
1. Check server logs for error details
2. Verify environment variables are set
3. Check database connectivity
4. Validate input data types
5. Review error handling middleware

## Authentication Problems

### Password Reset Issues

**Symptoms:**
- Password reset emails not sent
- Reset tokens invalid

**Solutions:**
1. Verify email service configuration (Resend API key)
2. Check email templates exist
3. Validate reset token generation and hashing
4. Check token expiration time (10 minutes default)
5. Verify frontend reset URL matches backend routes

### Session Management Issues

**Symptoms:**
- Users logged out unexpectedly
- Multiple session conflicts

**Solutions:**
1. Check refresh token storage and validation
2. Verify token rotation on refresh
3. Check for concurrent session limits
4. Validate cookie settings (httpOnly, secure, sameSite)

## Performance Issues

### Slow API Responses

**Symptoms:**
- API calls taking >2 seconds
- High server CPU usage

**Solutions:**
1. Check database query performance:
   ```javascript
   // Add .explain() to mongoose queries
   User.find({}).explain('executionStats')
   ```
2. Verify Redis cache is working
3. Check for N+1 query problems
4. Optimize database indexes
5. Implement pagination for large datasets

### Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Application crashes with out of memory

**Solutions:**
1. Use memory profiling tools:
   ```bash
   npm install -g clinic
   clinic heapprofiler -- node server.js
   ```
2. Check for circular references in code
3. Verify proper cleanup of event listeners
4. Monitor garbage collection

### High CPU Usage

**Symptoms:**
- Server CPU consistently >80%

**Solutions:**
1. Profile application performance:
   ```bash
   npm install -g 0x
   0x server.js
   ```
2. Check for infinite loops
3. Optimize synchronous operations
4. Implement worker threads for CPU-intensive tasks

## Testing Failures

### Jest Test Timeouts

**Error Message:**
```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**Solutions:**
1. Increase timeout in test:
   ```javascript
   test('should do something', async () => {
     // ... test code
   }, 10000);
   ```
2. Check for hanging promises
3. Verify database connections are closed in tests
4. Mock external services properly

### Database Test Connection Issues

**Symptoms:**
- Tests fail with database connection errors

**Solutions:**
1. Use test database configuration
2. Ensure test database is clean before each test:
   ```javascript
   beforeEach(async () => {
     await User.deleteMany({});
   });
   ```
3. Check MongoDB Memory Server configuration
4. Verify test environment variables

### Component Test Failures

**Symptoms:**
- React component tests failing

**Solutions:**
1. Check React Testing Library setup
2. Verify component props and state
3. Mock external dependencies
4. Update snapshots if needed:
   ```bash
   npm run test -- --updateSnapshot
   ```

## Deployment Problems

### Environment Variable Issues

**Symptoms:**
- Application fails to start in production

**Solutions:**
1. Verify all required environment variables are set
2. Check variable naming (case-sensitive)
3. Validate variable values format
4. Use `.env.example` as reference

### Port Binding Issues

**Error Message:**
```
EADDRINUSE: address already in use
```

**Solutions:**
1. Kill process using the port:
   ```bash
   # Find process
   lsof -i :3000
   # Kill process
   kill -9 <PID>
   ```
2. Change port in environment variables
3. Check for multiple instances running

### SSL/HTTPS Issues

**Symptoms:**
- HTTPS not working in production

**Solutions:**
1. Verify SSL certificate installation
2. Check certificate validity dates
3. Validate certificate chain
4. Ensure proper redirect from HTTP to HTTPS

### Static File Serving Issues

**Symptoms:**
- Images/CSS/JS not loading

**Solutions:**
1. Check static file paths in `vite.config.js`
2. Verify build output directory
3. Check file permissions
4. Validate CDN configuration if used

## Common Commands

### Development
```bash
# Start development server
npm run dev

# Start backend server
npm run server

# Run linting
npm run lint

# Run tests
npm run test

# Build for production
npm run build
```

### Debugging
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# List installed packages
npm list

# Check environment variables
printenv | grep NODE_ENV

# View process information
ps aux | grep node
```

### Database
```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/college_media"

# Check database size
db.stats()

# List collections
show collections

# View users
db.users.find().limit(5)
```

### Logs
```bash
# View application logs
tail -f logs/app.log

# Search for errors
grep "ERROR" logs/app.log

# View recent logs
tail -n 100 logs/app.log
```

## Getting Help

If you encounter an issue not covered in this guide:

1. Check the [GitHub Issues](https://github.com/Ewocs/College_Media/issues) for similar problems
2. Review the [API Documentation](./API_REFERENCE.md)
3. Check the [Architecture Documentation](./ARCHITECTURE.md)
4. Create a new issue with:
   - Error messages
   - Steps to reproduce
   - Environment details
   - Relevant code snippets

## Contributing

When adding new troubleshooting solutions:

1. Follow the existing format
2. Include error messages, symptoms, and step-by-step solutions
3. Add relevant code examples
4. Test solutions before documenting
5. Update this guide when fixing issues