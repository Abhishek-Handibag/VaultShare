import {
    setLoading,
    setAuthenticated,
    setNotAuthenticated,
    setError,
    setOtpRequired
} from '../store/authSlice';
import { createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:8000';

// Add authorization header helper
const getAuthHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };

    // Get access token from cookie
    const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

    if (accessToken) {
        headers['Authorization'] = `Bearer ${decodeURIComponent(accessToken)}`;
    }

    // Add CSRF token for non-GET requests
    const csrfToken = getCSRFToken();
    if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
    }

    return headers;
};

// Add this helper function to get CSRF token
const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

const defaultOptions = {
    credentials: 'include',  // This is important for cookies
    headers: getAuthHeaders(),
};

export const register = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register/`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(userData),
    });
    return response.json();
};

export const login = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login/`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(credentials),
    });
    return response.json();
};

export const verifyOtp = async (data) => {
    const response = await fetch(`${API_BASE_URL}/verify-otp/`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
};

export const forgotPassword = async (data) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password/`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
};

export const resetPassword = async (data) => {
    const response = await fetch(`${API_BASE_URL}/reset-password/`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
};

export const verifyAuth = async () => {
    const response = await fetch(`${API_BASE_URL}/verify-auth/`, {
        ...defaultOptions,
        method: 'GET',
    });
    return response.json();
};

export const logout = async () => {
    const response = await fetch(`${API_BASE_URL}/logout/`, {
        ...defaultOptions,
        method: 'POST',
    });
    return response.json();
};

// Update uploadFile function to include Authorization header
export const uploadFile = async (formData) => {
    const headers = {};
    // Get access token from cookie
    const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

    if (accessToken) {
        headers['Authorization'] = `Bearer ${decodeURIComponent(accessToken)}`;
    }

    // Add CSRF token
    const csrfToken = getCSRFToken();
    if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${API_BASE_URL}/upload-file/`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData,
    });
    return response.json();
};

export const downloadFile = async (fileId, password) => {
    const response = await fetch(`${API_BASE_URL}/download-file/${fileId}/?password=${password}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
    });
    return response;
};

export const listFiles = async () => {
    const headers = {};
    const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

    if (accessToken) {
        headers['Authorization'] = `Bearer ${decodeURIComponent(accessToken)}`;
    }

    const response = await fetch(`${API_BASE_URL}/list-files/`, {
        method: 'GET',
        credentials: 'include',
        headers
    });

    if (!response.ok) {
        throw new Error('Failed to fetch files');
    }

    return response.json();
};

export const shareFile = async (fileId, email, permission) => {
    const response = await fetch(`${API_BASE_URL}/share-file/${fileId}/`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, permission })
    });
    return response.json();
};

export const createShareLink = async (fileId, expiryHours) => {
    const response = await fetch(`${API_BASE_URL}/create-share-link/${fileId}/`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ expiry_hours: expiryHours })
    });
    return response.json();
};

export const listSharedFiles = async () => {
    const response = await fetch(`${API_BASE_URL}/shared-files/`, {
        method: 'GET',
        credentials: 'include',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch shared files');
    }

    return response.json();
};

export const getSharedFile = async (token, password = '') => {
    const response = await fetch(`${API_BASE_URL}/shared/${token}/${password ? `?password=${password}` : ''}`, {
        credentials: 'include',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch file');
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json();
    }
    return response;
};

export const deleteFile = async (fileId) => {
    const response = await fetch(`${API_BASE_URL}/delete-file/${fileId}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const revokeFileAccess = async (fileId, email) => {
    const response = await fetch(`${API_BASE_URL}/revoke-access/${fileId}/`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email })
    });

    if (!response.ok) {
        throw new Error('Failed to revoke access');
    }

    return response.json();
};

export const expireShareLink = async (token) => {
    const response = await fetch(`${API_BASE_URL}/expire-link/${token}/`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to expire link');
    }

    return response.json();
};

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (credentials, { dispatch }) => {
        dispatch(setLoading());
        try {
            const response = await login(credentials);
            if (response.message === 'OTP sent to email') {
                dispatch(setOtpRequired());
            } else if (response.error) {
                dispatch(setError(response.error));
            }
            return response;
        } catch (error) {
            dispatch(setError('Network error occurred'));
            throw error;
        }
    }
);

export const verifyOtpThunk = createAsyncThunk(
    'auth/verifyOtp',
    async (data, { dispatch }) => {
        dispatch(setLoading());
        try {
            const response = await verifyOtp(data);
            if (response.message === 'Login successful' || response.user) {
                // If we have a user object, use it, otherwise create a basic user object
                const user = response.user || { email: data.email };
                dispatch(setAuthenticated(user));
                return { success: true, user };
            } else {
                dispatch(setError(response.error || 'OTP verification failed'));
                return { success: false, error: response.error };
            }
        } catch (error) {
            dispatch(setError('Network error occurred'));
            throw error;
        }
    }
);

export const logoutThunk = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch }) => {
        try {
            await logout();
            dispatch(setNotAuthenticated());
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }
);