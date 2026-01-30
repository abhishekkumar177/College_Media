# College Media API Documentation

This document provides comprehensive documentation for all REST API endpoints in the College Media backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Tokens can be provided in two ways:

1. **Cookie:** `token` (set automatically on login)
2. **Authorization Header:** `Authorization: Bearer <your_jwt_token>`

Include the token using one of the above methods for protected endpoints.

## Endpoints

### Authentication

#### Register User
- **Method:** POST
- **Path:** `/auth/register`
- **Description:** Register a new user account
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (Success - 201):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ecb74b24c72b8c8b4567",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```
- **Response (Error - 400):**
  ```json
  {
    "message": "User already exists"
  }
  ```

#### Login User
- **Method:** POST
- **Path:** `/auth/login`
- **Description:** Authenticate user and receive JWT token
- **Authentication:** Not required
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (Success - 200):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ecb74b24c72b8c8b4567",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```
- **Response (Error - 400):**
  ```json
  {
    "message": "Invalid credentials"
  }
  ```

#### Logout User
- **Method:** POST
- **Path:** `/auth/logout`
- **Description:** Logout user by clearing authentication cookie
- **Authentication:** Required (JWT token in cookie)
- **Request Body:** None
- **Response (Success - 200):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

#### Get User Profile
- **Method:** GET
- **Path:** `/auth/profile`
- **Description:** Get current user's profile information
- **Authentication:** Required (JWT token)
- **Request Body:** None
- **Response (Success - 200):**
  ```json
  {
    "success": true,
    "user": {
      "id": "60d5ecb74b24c72b8c8b4567",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

### Posts

#### Get All Posts
- **Method:** GET
- **Path:** `/posts`
- **Description:** Retrieve all posts sorted by creation date (newest first)
- **Authentication:** Not required
- **Request Body:** None
- **Response (Success - 200):**
  ```json
  [
    {
      "_id": "60d5ecb74b24c72b8c8b4567",
      "user": {
        "_id": "60d5ecb74b24c72b8c8b4568",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "content": "This is a sample post",
      "image": "https://example.com/image.jpg",
      "likes": ["60d5ecb74b24c72b8c8b4569"],
      "createdAt": "2023-06-25T10:30:00.000Z"
    }
  ]
  ```

#### Create Post
- **Method:** POST
- **Path:** `/posts`
- **Description:** Create a new post
- **Authentication:** Required (JWT token)
- **Request Body:**
  ```json
  {
    "content": "This is my new post",
    "image": "https://example.com/image.jpg"
  }
  ```
- **Response (Success - 201):**
  ```json
  {
    "_id": "60d5ecb74b24c72b8c8b4567",
    "user": {
      "_id": "60d5ecb74b24c72b8c8b4568",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "content": "This is my new post",
    "image": "https://example.com/image.jpg",
    "likes": [],
    "createdAt": "2023-06-25T10:30:00.000Z"
  }
  ```
- **Response (Error - 401):**
  ```json
  {
    "message": "No token provided"
  }
  ```

#### Like/Unlike Post
- **Method:** PUT
- **Path:** `/posts/:id/like`
- **Description:** Like or unlike a post. If user has already liked the post, it will be unliked.
- **Authentication:** Required (JWT token)
- **Request Body:** None
- **Response (Success - 200):**
  ```json
  {
    "_id": "60d5ecb74b24c72b8c8b4567",
    "user": "60d5ecb74b24c72b8c8b4568",
    "content": "This is a sample post",
    "image": "https://example.com/image.jpg",
    "likes": ["60d5ecb74b24c72b8c8b4569", "60d5ecb74b24c72b8c8b456a"],
    "createdAt": "2023-06-25T10:30:00.000Z"
  }
  ```
- **Response (Error - 401):**
  ```json
  {
    "message": "No token provided"
  }
  ```
- **Response (Error - 404):**
  ```json
  {
    "message": "Post not found"
  }
  ```

## Planned Endpoints

The following endpoints are planned for future implementation:

### Comments

#### Add Comment to Post
- **Method:** POST
- **Path:** `/posts/:id/comments`
- **Description:** Add a comment to a specific post
- **Authentication:** Required (JWT token)
- **Request Body:**
  ```json
  {
    "text": "This is my comment"
  }
  ```
- **Status:** Planned for future release

#### Get Comments for Post
- **Method:** GET
- **Path:** `/posts/:id/comments`
- **Description:** Get all comments for a specific post
- **Authentication:** Not required
- **Status:** Planned for future release

## Error Responses
All endpoints may return the following error responses:
- **400 Bad Request:**
  ```json
  {
    "message": "Validation error message"
  }
  ```
- **401 Unauthorized:**
  ```json
  {
    "message": "No token provided" | "Invalid token"
  }
  ```
- **404 Not Found:**
  ```json
  {
    "message": "Resource not found"
  }
  ```
- **500 Internal Server Error:**
  ```json
  {
    "message": "Internal server error message"
  }
