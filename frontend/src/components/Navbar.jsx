import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser, logout } from '../utils/auth';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">FitPlanHub</span>
        </Link>
        <div className="navbar-links">
          {user?.role === 'USER' && (
            <>
              <Link to="/feed">My Feed</Link>
              <Link to="/favorites">Favorites</Link>
            </>
          )}
          {user?.role === 'TRAINER' && (
            <>
              <Link to="/trainer/dashboard">Dashboard</Link>
              <Link to="/trainer/stats">Statistics</Link>
            </>
          )}
          <Link to="/">Browse Plans</Link>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
