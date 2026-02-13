// Role-based access middleware
export function requireRole(role) {
  return function (req, res, next) {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: true, code: 'UNAUTHORIZED', message: 'User not authenticated' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: true, code: 'FORBIDDEN', message: `Requires ${role} role` });
    }
    next();
  };
}

// For multiple roles
export function requireRoles(roles) {
  return function (req, res, next) {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: true, code: 'UNAUTHORIZED', message: 'User not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: true, code: 'FORBIDDEN', message: `Requires one of: ${roles.join(', ')}` });
    }
    next();
  };
}
