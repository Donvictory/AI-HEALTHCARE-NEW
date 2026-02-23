# Authentication Implementation Documentation

This document outlines the end-to-end authentication flow and security implementation for the AI-Healthcare project.

## 1. Overview

The system uses **JWT (JSON Web Tokens)** for authentication, leveraging **HTTP-Only Cookies** for secure storage and a **Silent Refresh** mechanism to maintain sessions without compromising security.

### Key Components:

- **Backend**: Express.js with Mongoose, JWT, and `cookie-parser`.
- **Frontend**: React (Vite), Axios, React Query, and `react-router-dom`.
- **Storage**: `httpOnly` cookies for tokens, non-`httpOnly` cookies as client-side hints.

---

## 2. Token Strategy

The system utilizes two tokens:

1.  **Access Token**: Short-lived (e.g., 1 hour). Used for all API requests.
2.  **Refresh Token**: Long-lived (e.g., 7 days). Used solely to request a new Access Token when the old one expires.

### Security Implementation:

- **HTTP-Only**: Both tokens are stored in cookies with the `httpOnly: true` flag. This prevents Cross-Site Scripting (XSS) attacks from stealing tokens.
- **SameSite**: Set to `Lax` or `Strict` to mitigate Cross-Site Request Forgery (CSRF).
- **Secure**: Set to `true` in production to ensure tokens are only sent over HTTPS.

---

## 3. Backend Implementation

### Middleware: `protect`

Located in `server/src/middlewares/auth.middleware.ts`, this middleware guards protected routes.

```typescript
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Get token from header (Bearer) or cookies
  let token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) return next(new AppError("You are not logged in!", 401));

  // 2. Verify token
  const decoded = jwt.verify(token, appConfig.jwt.accessSecret) as {
    id: string;
  };

  // 3. Check if user still exists
  const currentUser = await UserModel.findById(decoded.id);
  if (!currentUser) return next(new AppError("User no longer exists.", 401));

  // 4. Grant access
  req.user = currentUser;
  next();
};
```

### Auth Endpoints

- **POST `/users/register`**: Hashes password, creates user, and sets cookies.
- **POST `/users/login`**: Validates credentials, sets tokens in cookies.
- **POST `/users/refresh-token`**: Reads the `refreshToken` cookie, verifies it, and issues a new `accessToken` cookie.
- **POST `/users/logout`**: Clears all auth-related cookies.

---

## 4. Frontend Implementation

### Client-Side State Detection

Because the JWTs are `httpOnly` (not readable by JavaScript), we use a "hint" cookie:

- **`is_logged_in`**: A simple non-httpOnly cookie set to `true`.
- **Check**: `isAuthenticated()` in `client/src/lib/storage.js` simply returns `getCookie("is_logged_in") === "true"`.

### API Client (Axios)

Located in `client/src/lib/api-client.js`. It handles automatic token refresh via response interceptors.

```javascript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Request new access token using the httpOnly Refresh Token
        await axios.post("/users/refresh-token", {}, { withCredentials: true });

        // Retry original request
        return apiClient(originalRequest);
      } catch (err) {
        // Refresh failed (session expired) -> logout
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);
```

---

## 5. Route Protection (Auth Guards)

### Global Layout Wrapper: `Layout.jsx`

The `Layout` component acts as the primary gatekeeper for the application.

1.  **Instant Guard**: Checks the `is_logged_in` hint cookie. If missing, redirects to `/login` immediately.
2.  **Data-Driven Guard**: Uses the `useMe()` hook (React Query) to fetch the actual user profile. If the API returns a 401 (or null user), it redirects to `/login`.
3.  **Loading State**: Shows a landing spinner while verifying the session to prevent "flashing" protected content.

```javascript
export function Layout() {
  const { data: user, isLoading } = useMe();
  const location = useLocation();

  const isPublicRoute = ["/", "/login", "/signup"].includes(location.pathname);

  useEffect(() => {
    if (!isAuthenticated() && !isPublicRoute) {
      navigate("/login");
    }
  }, [user, isLoading, isPublicRoute]);

  if (isLoading && !isPublicRoute) return <Loader />;

  return <Outlet />;
}
```

---

## 6. User Management

- **Getting User**: The `useMe` hook calls `/api/v1/users/me`.
- **Updating User**: The `updateMe` endpoint handles profile updates, ensuring restricted fields (like `role` or `password`) are filtered out.
- **Onboarding**: A specialized `onboard` method sets `isOnboarded: true` and updates the `is_onboarded` hint cookie, allowing the UI to transition from onboarding to the dashboard.

---

## 7. Security Best Practices

- **Password Hashing**: Uses `bcrypt` with a salt factor of 12.
- **Credential Validation**: Passwords are never returned in JSON responses (`select: false` in schema).
- **CSRF Protection**: Native cookie security policies + custom CORS validation.
- **Fast Failure**: `bufferCommands: false` in Mongoose ensures the server fails immediately if the DB is uninitialized, preventing hanging requests during auth.
