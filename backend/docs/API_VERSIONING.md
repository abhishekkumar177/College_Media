# API Versioning Policy

## Overview
The College Media API uses URL-based versioning to ensure backward compatibility while allowing for the evolution of the platform.

- **Current Version**: `v1`
- **Base URL**: `/api/v1`
- **Legacy URL**: `/api` (Deprecated)

## Versioning Strategy

### URI Versioning (Primary)
We use the URI to specify the API version. This is explicit and easy to see in logs and browser address bars.
```
GET /api/v1/users
GET /api/v2/users
```

### Response Headers
All API responses include the following headers:
- `X-API-Version`: The version of the API processing the request (e.g., `v1`).

## Deprecation Policy

When an API version or endpoint is scheduled for removal, we communicate this via standard HTTP headers:

1. **Deprecation Header**
   - `Deprecation: true` or `Deprecation: <date>`
   - Indicates that the endpoint is deprecated and users should migrate.

2. **Sunset Header**
   - `Sunset: <date>` (HTTP Date format)
   - Indicates the date when the endpoint will become unresponsive (410 Gone or 404 Not Found).

3. **Link Header**
   - `Link: <https://...>; rel="deprecation"`
   - Provides a URL to documentation regarding the deprecation.

### Legacy Routes (/api/*)
Direct calls to `/api/*` (without version prefix) map to `v1` but are considered **deprecated**.
- **Deprecation Date**: 2026-01-13
- **Sunset Date**: 2026-12-31

Please update your clients to use `/api/v1/*` or `/api/v2/*`.

## Version Negotiation (Future)
We may support `Accept-Version` header negotiation in future updates, but currently we strictly enforce URI versioning.
