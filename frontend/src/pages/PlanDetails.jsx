import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../config/api';
import { isAuthenticated, getUser } from '../utils/auth';
import { useToast } from '../context/ToastContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ProgressTracker from '../components/ProgressTracker';
import './PlanDetails.css';

const PlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [plan, setPlan] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const response = await api.get(`/plans/${id}`);
      setPlan(response.data.plan);
      // Explicitly check for true value to ensure proper access control
      setHasAccess(response.data.hasAccess === true);
      
      // Check if plan is favorited
      if (isAuthenticated()) {
        try {
          const favResponse = await api.get(`/favorites/check/${id}`);
          setIsFavorited(favResponse.data.isFavorited);
        } catch (err) {
          // Favorites not available, ignore
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching plan');
      showToast('Failed to load plan details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const user = getUser();
    if (user?.role === 'TRAINER') {
      showToast('Trainers cannot subscribe to plans', 'warning');
      return;
    }

    setSubscribing(true);
    setError('');

    try {
      const response = await api.post(`/subscriptions/${id}`);
      showToast('Successfully subscribed! You now have full access.', 'success');
      setHasAccess(true);
      setError('');
      // Refresh plan data after a short delay to ensure DB is updated
      setTimeout(() => {
        fetchPlan();
      }, 800);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error subscribing to plan';
      
      // If user already has subscription, grant access immediately
      if (errorMsg.includes('already have an active subscription')) {
        setHasAccess(true);
        setError('');
        showToast('You already have access to this plan', 'info');
        // Refresh plan data to get full plan details
        setTimeout(() => {
          fetchPlan();
        }, 300);
      } else {
        setError(errorMsg);
        showToast(errorMsg, 'error');
      }
    } finally {
      setSubscribing(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        await api.delete(`/favorites/${id}`);
        setIsFavorited(false);
        showToast('Removed from favorites', 'info');
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorited(true);
        showToast('Added to favorites', 'success');
      }
    } catch (err) {
      showToast('Failed to update favorites', 'error');
    }
  };

  if (loading) {
    return (
      <div className="plan-details-page">
        <div className="plan-details-container">
          <LoadingSkeleton count={1} />
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  const user = getUser();
  const isTrainer = user?.role === 'TRAINER';

  return (
    <div className="plan-details-page">
      <div className="plan-details-container">
        <Link to="/" className="back-link">← Back to Plans</Link>

        <div className="plan-header">
          <div className="header-top">
            <h1>{plan.title}</h1>
            {isAuthenticated() && (
              <button
                onClick={handleFavorite}
                className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            )}
          </div>
          <p className="trainer-info">
            by{' '}
            <Link to={`/trainer/${plan.trainerId}`} className="trainer-link">
              {plan.trainerName || plan.trainer?.user?.name}
            </Link>
          </p>
        </div>

        <div className="plan-info">
          <div className="info-item">
            <span className="label">Price:</span>
            <span className="value price">${plan.price}</span>
          </div>
          <div className="info-item">
            <span className="label">Duration:</span>
            <span className="value">{plan.duration} days</span>
          </div>
        </div>

        {hasAccess ? (
          <div className="plan-content">
            <h2>Plan Description</h2>
            <div className="description">
              {plan.description || 'No description available.'}
            </div>
            {!isTrainer && <ProgressTracker planId={id} />}
            {isTrainer && plan.trainerId && (
              <div className="trainer-actions">
                <Link to="/trainer/dashboard" className="btn btn-secondary">
                  Manage Plans
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="plan-preview">
            <div className="preview-message">
              <h2>🔒 Full Access Required</h2>
              <p>Subscribe to this plan to view the complete description and access all features.</p>
              {isAuthenticated() ? (
                <button
                  onClick={handleSubscribe}
                  className="btn btn-primary"
                  disabled={subscribing}
                >
                  {subscribing ? 'Processing...' : `Subscribe for $${plan.price}`}
                </button>
              ) : (
                <div>
                  <p>Please login to subscribe</p>
                  <Link to="/login" className="btn btn-primary">
                    Login to Subscribe
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {error && !hasAccess && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default PlanDetails;
