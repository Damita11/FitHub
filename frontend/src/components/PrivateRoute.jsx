import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const PrivateRoute = ({ children, requireRole = null }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== requireRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
