import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                navigate('/');
            }
            setIsChecking(false);
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading || isChecking) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect to home
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};