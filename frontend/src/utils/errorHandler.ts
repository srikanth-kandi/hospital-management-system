/**
 * Utility functions for handling API errors consistently across the application
 */

export interface ApiError {
  error?: string;
  message?: string;
  detail?: string;
  errors?: string[];
}

/**
 * Extracts error message from API error response
 * @param error - The error object from axios or fetch
 * @param defaultMessage - Default message to show if no error message is found
 * @returns The error message to display
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'An error occurred'): string => {
  // Check if it's an axios error with response data
  if (error?.response?.data) {
    const errorData = error.response.data as ApiError;
    
    // Check for different possible error message fields
    if (errorData.error) {
      return errorData.error;
    }
    
    if (errorData.message) {
      return errorData.message;
    }
    
    if (errorData.detail) {
      return errorData.detail;
    }
    
    // Check if there's an errors array
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      return errorData.errors[0];
    }
  }
  
  // Check if it's a network error
  if (error?.message && error.message.includes('Network Error')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Check if it's a timeout error
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // Check for HTTP status codes
  if (error?.response?.status) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return 'Bad request. Please check your input and try again.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. This resource already exists.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Bad gateway. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return `Error ${status}. Please try again.`;
    }
  }
  
  // Fallback to default message
  return defaultMessage;
};

/**
 * Handles API errors and shows appropriate toast messages
 * @param error - The error object from axios or fetch
 * @param defaultMessage - Default message to show if no error message is found
 * @param showToast - Function to show toast (from react-hot-toast)
 * @returns The error message that was displayed
 */
export const handleApiError = (
  error: any, 
  defaultMessage: string = 'An error occurred',
  showToast?: (message: string) => void
): string => {
  const message = getErrorMessage(error, defaultMessage);
  
  if (showToast) {
    showToast(message);
  }
  
  return message;
};

/**
 * Creates a toast error handler for use with react-hot-toast
 * @param defaultMessage - Default message to show if no error message is found
 * @returns A function that can be used with toast.error
 */
export const createToastErrorHandler = (defaultMessage: string = 'An error occurred') => {
  return (error: any) => {
    const message = getErrorMessage(error, defaultMessage);
    return message;
  };
}; 