import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { isAuthenticated, getUser, logout } from '../utils/auth';
import './TrainerProfile.css';

const TrainerProfile = () => {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTrainerProfile();
  }, [trainerId]);

  const fetchTrainerProfile = async () => {
    try {
      const response = await api.get(`/users/trainer/${trainerId}`);
      setTrainer(response.data.trainer);
      setFollowing(response.data.trainer.isFollowing);
    } catch (error) {
      console.error('Error fetching trainer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setProcessing(true);
    try {
      if (following) {
        await api.delete(`/follows/${trainerId}`);
        setFollowing(false);
      } else {
        await api.post(`/follows/${trainerId}`);
        setFollowing(true);
      }
      fetchTrainerProfile(); // Refresh to update follower count
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading trainer profile...</div>;
  }

  if (!trainer) {
    return (
      <div className="error-container">
        <p>Trainer not found</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  const currentUser = getUser();
  const isOwnProfile = currentUser?.role === 'TRAINER' && currentUser?.trainerProfile?.id === trainerId;

  return (
    <div className="trainer-profile-page">
      <header className="profile-header">
        <div className="header-content">
          <Link to="/" className="back-link">← Back</Link>
          {isAuthenticated() && (
            <div className="header-actions">
              {!isOwnProfile && (
                <Link to="/feed" className="btn btn-secondary">My Feed</Link>
              )}
              {isOwnProfile && (
                <Link to="/trainer/dashboard" className="btn btn-secondary">Dashboard</Link>
              )}
              <button onClick={handleLogout} className="btn btn-outline">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="profile-content">
        <div className="profile-card">
          <div className="profile-info">
            <h1>{trainer.name}</h1>
            <p className="email">{trainer.email}</p>
            {trainer.bio && <p className="bio">{trainer.bio}</p>}
            <div className="profile-meta">
              {trainer.certification && (
                <div className="meta-item">
                  <span className="label">Certification:</span>
                  <span className="value">{trainer.certification}</span>
                </div>
              )}
              {trainer.specialization && (
                <div className="meta-item">
                  <span className="label">Specialization:</span>
                  <span className="value">{trainer.specialization}</span>
                </div>
              )}
            </div>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-value">{trainer.stats.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{trainer.stats.plans}</span>
                <span className="stat-label">Plans</span>
              </div>
            </div>
            {isAuthenticated() && !isOwnProfile && (
              <button
                onClick={handleFollow}
                className={`btn ${following ? 'btn-secondary' : 'btn-primary'}`}
                disabled={processing}
              >
                {processing
                  ? 'Processing...'
                  : following
                  ? 'Unfollow'
                  : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="plans-section">
          <h2>Fitness Plans ({trainer.plans.length})</h2>
          {trainer.plans.length === 0 ? (
            <p className="no-plans">This trainer hasn't created any plans yet.</p>
          ) : (
            <div className="plans-grid">
              {trainer.plans.map((plan) => (
                <div key={plan.id} className="plan-card">
                  <h3>{plan.title}</h3>
                  <div className="plan-details">
                    <span className="price">${plan.price}</span>
                    <span className="duration">{plan.duration} days</span>
                  </div>
                  <p className="subscribers">{plan._count.subscriptions} subscribers</p>
                  <Link to={`/plans/${plan.id}`} className="btn btn-outline">
                    View Plan
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainerProfile;
