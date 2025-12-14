import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { logout } from '../utils/auth';
import './UserFeed.css';

const UserFeed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const response = await api.get('/feed');
      setFeed(response.data.feed);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading your feed...</div>;
  }

  return (
    <div className="user-feed">
      <header className="feed-header">
        <h1>Your Personalized Feed</h1>
        <div className="header-actions">
          <Link to="/favorites" className="btn btn-secondary">⭐ Favorites</Link>
          <Link to="/" className="btn btn-secondary">Browse All Plans</Link>
          <button onClick={handleLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </header>

      <main className="feed-content">
        {feed.length === 0 ? (
          <div className="empty-feed">
            <h2>No plans in your feed yet</h2>
            <p>Start following trainers to see their plans here!</p>
            <Link to="/" className="btn btn-primary">Browse Plans</Link>
          </div>
        ) : (
          <>
            <div className="feed-stats">
              <p>
                Showing {feed.length} plan{feed.length !== 1 ? 's' : ''} from trainers you follow
              </p>
              <p>
                {feed.filter(item => item.isSubscribed).length} subscribed plan
                {feed.filter(item => item.isSubscribed).length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="feed-grid">
              {feed.map((item) => (
                <div key={item.id} className="feed-card">
                  <div className="card-header">
                    <h3>{item.title}</h3>
                    {item.isSubscribed && (
                      <span className="badge subscribed">Subscribed</span>
                    )}
                  </div>
                  <p className="trainer-name">by {item.trainer.name}</p>
                  <div className="plan-details">
                    <span className="price">${item.price}</span>
                    <span className="duration">{item.duration} days</span>
                  </div>
                  {item.isSubscribed ? (
                    <div className="description-preview">
                      {item.description}
                    </div>
                  ) : (
                    <p className="preview-text">Subscribe to view full plan details</p>
                  )}
                  <div className="card-actions">
                    <Link to={`/plans/${item.id}`} className="btn btn-outline">
                      View Details
                    </Link>
                    <Link
                      to={`/trainer/${item.trainer.id}`}
                      className="btn btn-secondary"
                    >
                      View Trainer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default UserFeed;
