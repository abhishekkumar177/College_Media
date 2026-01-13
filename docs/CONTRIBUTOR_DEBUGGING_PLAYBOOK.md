# Contributor Debugging Playbook

> A developer-first guide for troubleshooting common issues in College Media

This playbook documents common development issues, debugging workflows, and troubleshooting steps to help new and existing contributors quickly identify and fix problems while working on the project.

## Table of Contents

1. [Environment Setup Issues](#environment-setup-issues)
2. [Dependency & Version Conflicts](#dependency--version-conflicts)
3. [Frontend Debugging Checklist](#frontend-debugging-checklist)
4. [Backend Debugging Checklist](#backend-debugging-checklist)
5. [API & Network Error Diagnosis](#api--network-error-diagnosis)
6. [Logging Locations & Tips](#logging-locations--tips)
7. [Common Mistakes by New Contributors](#common-mistakes-by-new-contributors)
8. [When to Open an Issue vs Fix Locally](#when-to-open-an-issue-vs-fix-locally)

---

## Environment Setup Issues

### Problem: `npm install` fails with permission errors

**Causes:**
- Incorrect Node.js/npm installation
- Global npm packages installed with `sudo`
- Node version mismatch

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Check Node version (should be v14+ or as specified in .nvmrc)
node --version
npm --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Problem: Port already in use (3000, 5000, etc.)

**Causes:**
- Previous process still running
- Another application using the same port

**Solution (Linux/Mac):**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

**Solution (Windows):**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problem: `.env.local` file not recognized

**Causes:**
- File not created in correct location
- Environment variables not loaded

**Solution:**
- Create `.env.local` in project root
- Verify it contains required variables
- Restart development server after changes
- Check `gitignore` - `.env.local` should be ignored

---

## Dependency & Version Conflicts

### Problem: Different package versions breaking builds

**Solution:**
```bash
# Use exact versions from package-lock.json
npm ci  # instead of npm install

# Check for deprecated packages
npm audit

# Update specific package
npm update <package-name>
```

### Problem: React/Vue version mismatches

**Causes:**
- Multiple versions installed
- Incompatible peer dependencies

**Solution:**
```bash
# View dependency tree
npm ls <package-name>

# Remove duplicates
rm node_modules package-lock.json
npm install
```

---

## Frontend Debugging Checklist

- [ ] Check browser console (F12 → Console tab)
- [ ] Look for red errors or yellow warnings
- [ ] Check Network tab for failed API requests (4xx, 5xx status)
- [ ] Verify component state using React DevTools extension
- [ ] Check CSS - use browser Inspector (F12 → Elements)
- [ ] Clear browser cache: Ctrl+Shift+Delete
- [ ] Try incognito/private mode to exclude extensions
- [ ] Check if issue is in specific browser only

### Common Frontend Issues

**Blank page or white screen:**
- Check browser console for JS errors
- Verify public/index.html exists
- Check if build completed successfully

**Styling not applied:**
- CSS file not imported
- CSS specificity issues
- Browser caching - hard refresh (Ctrl+Shift+R)

**API calls failing:**
- Check Network tab in DevTools
- Verify CORS headers
- Check if backend is running
- Verify API endpoint URL is correct

---

## Backend Debugging Checklist

- [ ] Check server logs/console output
- [ ] Verify database connection
- [ ] Check database migrations ran
- [ ] Verify API endpoint exists
- [ ] Test endpoint using Postman/curl
- [ ] Check request/response format
- [ ] Look for SQL errors in logs
- [ ] Verify authentication tokens

### Common Backend Issues

**"Cannot find module" errors:**
```bash
# Verify module exists
ls node_modules/<module-name>

# Reinstall dependencies
npm install

# Check import path spelling
```

**Database connection fails:**
- Verify database is running
- Check connection string in `.env`
- Verify username/password
- Check if database name exists

**Port already in use:**
- See Environment Setup Issues section

---

## API & Network Error Diagnosis

### HTTP Status Codes

| Code | Meaning | Common Cause |
|------|---------|---------------|
| 400  | Bad Request | Invalid request format or missing fields |
| 401  | Unauthorized | Missing or invalid authentication token |
| 403  | Forbidden | User lacks required permissions |
| 404  | Not Found | API endpoint doesn't exist |
| 500  | Server Error | Backend error - check server logs |
| 503  | Service Unavailable | Backend is down or overloaded |

### Debugging Network Issues

**Using browser DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Reproduce the request
4. Click on request → View headers, payload, response

**Using curl:**
```bash
curl -v https://api.example.com/endpoint
```

**Using Postman:**
- Create request with method, URL, headers, body
- Check response status and body

---

## Logging Locations & Tips

### Frontend Logs

**Browser Console:**
- Press F12 → Console tab
- Errors appear in red
- Add logs using `console.log()`, `console.error()`

**Browser Network Tab:**
- Shows all API requests/responses
- Status codes, headers, timing information

### Backend Logs

**Check console output where server is running:**
```bash
# Will show errors, warnings, debug info
```

**Add logging to code:**
```javascript
console.log('Debug info:', variable);
console.error('Error occurred:', error);
```

**Log files:**
- Check `logs/` directory if configured
- Check database logs

---

## Common Mistakes by New Contributors

1. **Not reading CONTRIBUTING.md** - Start here for contribution guidelines

2. **Modifying .env file** - Use .env.local instead; .env should not be committed

3. **Committing node_modules** - Should be in .gitignore

4. **Not running migrations** - New features may need database changes

5. **Hardcoding values** - Use environment variables instead

6. **Ignoring linting errors** - Code quality matters; fix before submitting PR

7. **Not testing locally** - Always test changes before pushing

8. **Opening PR without assigning issue** - Always get assigned to issue first

---

## When to Open an Issue vs Fix Locally

### Open an Issue When:
- Bug cannot be reproduced locally
- Requires discussion/decision from maintainers
- Affects core architecture
- Needs input from multiple team members
- Unclear if it's a bug or feature request

### Fix Locally When:
- Clear reproduction steps
- Single component/file affected
- You understand the root cause
- Fix doesn't impact other features
- You're assigned to the issue

---

## Getting Help

1. **Check this playbook first** - Many issues are documented here
2. **Search existing issues** - Your problem might already be solved
3. **Check PR comments** - Look for discussions about your issue
4. **Ask in discussions** - Use GitHub Discussions for questions
5. **Open an issue** - If truly stuck, provide reproduction steps

---

## Contributing to This Playbook

Found a bug that's not documented? Found a solution?  
Please open a PR or issue to help other contributors!

Or even add something new to this !! 

**Last Updated:** January 2026
