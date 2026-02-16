# Authentication Flow Documentation

This document explains the end-to-end authentication flow, token management, and profile retrieval logic for the Manga Studio application.

## 1. Authentication Strategy

The system uses JWT (JSON Web Tokens) for secure communication:

- **Access Token**: Sent in the `Authorization: Bearer <token>` header. Used for all protected routes. Expires in 15 minutes.
- **Refresh Token**: Sent in the request body to the refresh endpoint. Used to obtain a new pair of tokens. Expires in 3 days.

## 2. Login & Token Acquisition

### Option A: Local Login (Username/Password)

- **Endpoint**: `POST /api/auth/login`
- **Payload**: `{"username": "...", "password": "..."}`
- **Response**:
  ```json
  {
    "accessToken": "eyJh...",
    "refreshToken": "eyJh...",
    "user": { ... }
  }
  ```

### Option B: Identity Login (Privy)

- **Endpoint**: `POST /api/auth/identity-login`
- **Payload**: `{"token": "privy-id-token"}`
- **Response**: Same as above.

## 3. Token Refresh Mechanism

When the `accessToken` expires, the frontend automatically uses the `refreshToken` to get a new set of tokens.

- **Endpoint**: `POST /api/auth/refresh`
- **Request Payload**:
  ```json
  {
    "refreshToken": "eyJh... (current refresh token)"
  }
  ```
- **Response (Success 200)**:
  ```json
  {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
  ```
- **Response (Failure 401)**: If the refresh token is also expired or invalid, the frontend clears all local auth state and redirects to the login page.

## 4. Retrieving User Profile

Once logged in, the frontend can retrieve full user information.

- **Endpoint**: `GET /api/auth/profile`
- **Header**: `Authorization: Bearer <accessToken>`

## 5. Frontend Interceptor Logic (Axios)

### Request Interceptor

For every request, the `ApiClient` checks if an `accessToken` exists in the `AuthStore`. If found, it adds the `Authorization: Bearer <token>` header.

### Response Interceptor (401 Handling)

The `ApiClient` implements a robust 401 handler:

1. If a 401 occurs and the request URL was **NOT** `/api/auth/refresh`:
   - It attempts to call `POST /api/auth/refresh` with the current `refreshToken`.
   - On success: Saves new tokens and retries the original request.
   - On failure (or if the refresh token is missing): Triggers a global logout.
2. If the request URL **WAS** `/api/auth/refresh`:
   - Triggers an immediate logout (session expired).

## 6. Web3 Session Synchronization

The `AuthProvider` monitors the Privy connection state. If a user connects their wallet but is not yet authenticated with the backend, it automatically triggers the `identityLogin` flow using the Privy ID token.
