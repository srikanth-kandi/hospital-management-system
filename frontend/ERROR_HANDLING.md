# Frontend Error Handling System

This document explains the centralized error handling system implemented for the Hospital Management System frontend.

## Overview

The error handling system provides consistent error message extraction and display across all API calls. It automatically checks for error keys in JSON responses from the backend and falls back to appropriate default messages.

## Features

### 1. Centralized Error Handling (`frontend/src/utils/errorHandler.ts`)

The system includes several utility functions:

- **`getErrorMessage(error, defaultMessage)`**: Extracts error messages from API responses
- **`handleApiError(error, defaultMessage, showToast)`**: Handles errors and shows toast messages
- **`createToastErrorHandler(defaultMessage)`**: Creates reusable error handlers

### 2. Error Message Priority

The system checks for error messages in the following order:

1. `error.response.data.error` - Primary error field
2. `error.response.data.message` - Alternative message field
3. `error.response.data.detail` - Detail field
4. `error.response.data.errors[0]` - First error from array
5. HTTP status code specific messages
6. Network/timeout error messages
7. Default fallback message

### 3. HTTP Status Code Handling

The system provides user-friendly messages for common HTTP status codes:

- **400**: Bad request. Please check your input and try again.
- **401**: Unauthorized. Please log in again.
- **403**: Access denied. You don't have permission to perform this action.
- **404**: Resource not found.
- **409**: Conflict. This resource already exists.
- **422**: Validation error. Please check your input.
- **429**: Too many requests. Please try again later.
- **500**: Server error. Please try again later.
- **502**: Bad gateway. Please try again later.
- **503**: Service unavailable. Please try again later.

### 4. Network Error Handling

- **Network Error**: Network error. Please check your connection and try again.
- **Timeout Error**: Request timed out. Please try again.

## Usage Examples

### Basic Usage in Components

```typescript
import { getErrorMessage } from '../utils/errorHandler';

try {
  await apiCall();
} catch (error: any) {
  toast.error(getErrorMessage(error, 'Default error message'));
}
```

### API Service Integration

All API calls in `frontend/src/services/api.ts` now use the centralized error handling:

```typescript
// Before
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/users/login', data).then(res => res.data),
};

// After
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiCall(api.post('/users/login', data), 'Failed to login. Please check your credentials.'),
};
```

### Backend Error Response Examples

The system handles various backend error response formats:

```json
// Format 1: Simple error
{
  "error": "User not found"
}

// Format 2: Message field
{
  "message": "Invalid credentials"
}

// Format 3: Detail field
{
  "detail": "Validation failed"
}

// Format 4: Errors array
{
  "errors": ["Email is required", "Password is too short"]
}
```

## Implementation Details

### 1. API Interceptor Enhancement

The axios response interceptor now enhances error objects with formatted messages:

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Enhance error object with formatted message
    error.formattedMessage = getErrorMessage(error, 'An error occurred');
    
    return Promise.reject(error);
  }
);
```

### 2. Helper Function

A helper function `apiCall` wraps all API calls with consistent error handling:

```typescript
const apiCall = async <T>(
  apiPromise: Promise<{ data: T }>,
  defaultErrorMessage: string = 'An error occurred'
): Promise<T> => {
  try {
    const response = await apiPromise;
    return response.data;
  } catch (error: any) {
    const message = error.formattedMessage || getErrorMessage(error, defaultErrorMessage);
    throw new Error(message);
  }
};
```

## Benefits

1. **Consistency**: All error messages follow the same format and priority
2. **User-Friendly**: Clear, actionable error messages
3. **Maintainable**: Centralized error handling logic
4. **Robust**: Handles various error response formats
5. **Fallback**: Always provides a meaningful message even if backend doesn't return one

## Migration Guide

### For Existing Components

1. Import the error handler:
   ```typescript
   import { getErrorMessage } from '../utils/errorHandler';
   ```

2. Replace existing error handling:
   ```typescript
   // Before
   toast.error(error.response?.data?.error || 'Default message');
   
   // After
   toast.error(getErrorMessage(error, 'Default message'));
   ```

### For New Components

Use the centralized error handling from the start:

```typescript
import { getErrorMessage } from '../utils/errorHandler';

try {
  await someApiCall();
} catch (error: any) {
  toast.error(getErrorMessage(error, 'Operation failed'));
}
```

## Testing

The error handling system can be tested by:

1. **Network Errors**: Disconnect internet and make API calls
2. **Server Errors**: Stop the backend server and make API calls
3. **Validation Errors**: Submit invalid data to forms
4. **Authentication Errors**: Use expired/invalid tokens

All scenarios should display appropriate, user-friendly error messages. 