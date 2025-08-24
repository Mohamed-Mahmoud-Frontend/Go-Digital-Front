const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Validates the current token by making a request to the token details endpoint
 * @returns {Promise<boolean>} Returns true if token is valid, false otherwise
 */
export const validateToken = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        return false;
    }

    try {
        // Get current language from i18n
        const currentLanguage = localStorage.getItem('i18nextLng') || 'en';
        
        const response = await fetch(`${API_BASE_URL}/token/details`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept-Language': currentLanguage
            }
        });

        const data = await response.json();

        // Check if token is expired or invalid
        if (!response.ok || data.tokenExpiredOrInvalid) {
            // Only clear auth data if token is actually invalid
            if (data.tokenExpiredOrInvalid ||
                (response.status === 401 && data.error === "Invalid or expired token")) {
                clearAuthData();
            }
            return false;
        }

        return true;
    } catch (error) {
        console.error('Token validation error:', error);
        // Don't clear auth data on network errors, only on actual token invalidation
        // This prevents clearing auth data when the server is down
        return false;
    }
};

/**
 * Handles API responses and checks for token expiration
 * @param {Response} response - The fetch response object
 * @param {Object} data - The parsed response data
 * @returns {boolean} Returns true if token is valid, false if expired/invalid
 */
export const handleApiResponse = (response, data) => {
    // Check if token is expired or invalid
    if (data.tokenExpiredOrInvalid ||
        (response.status === 401 && data.error === "Invalid or expired token")) {
        clearAuthData();
        return false;
    }
    return true;
};

/**
 * Clears all authentication data from localStorage
 */
export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Gets the current token from localStorage
 * @returns {string|null} The token or null if not found
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Checks if user is authenticated (has valid token)
 * @returns {Promise<boolean>} Returns true if authenticated, false otherwise
 */
export const isAuthenticated = async () => {
    return await validateToken();
}; 