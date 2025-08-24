import { useState, useEffect } from 'react';
import { validateToken, clearAuthData } from '@/utils/token.util';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (!token || !userData) {
                setIsAuthenticated(false);
                setUser(null);
                return;
            }

            // Parse user data first to check if it's valid
            let parsedUser;
            try {
                parsedUser = JSON.parse(userData);
                if (!parsedUser || !parsedUser.email) {
                    throw new Error('Invalid user data');
                }
            } catch (parseError) {
                console.error('Invalid user data in localStorage:', parseError);
                clearAuthData();
                setIsAuthenticated(false);
                setUser(null);
                return;
            }

            // Validate token with server
            const isTokenValid = await validateToken();

            if (!isTokenValid) {
                setIsAuthenticated(false);
                setUser(null);
                return;
            }

            // If we reach here, both token and user data are valid
            setIsAuthenticated(true);
            setUser(parsedUser);
        } catch (error) {
            console.error('Auth check error:', error);
            clearAuthData();
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        clearAuthData();
        setIsAuthenticated(false);
        setUser(null);
    };

    // Check auth on mount and when localStorage changes
    useEffect(() => {
        checkAuth();

        // Listen for storage changes (in case token is updated in another tab)
        const handleStorageChange = (e) => {
            if (e.key === 'token' || e.key === 'user') {
                checkAuth();
            }
        };

        // Listen for custom login success event
        const handleLoginSuccess = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('loginSuccess', handleLoginSuccess);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('loginSuccess', handleLoginSuccess);
        };
    }, []);

    return {
        isAuthenticated,
        user,
        isLoading,
        checkAuth,
        logout
    };
}; 