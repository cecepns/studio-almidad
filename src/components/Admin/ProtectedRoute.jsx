import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Loading from '../Common/Loading';
import { authAPI } from '../../utils/api';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      await authAPI.verifyToken();
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('admin_token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;