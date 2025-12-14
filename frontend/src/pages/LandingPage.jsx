import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import SearchBar from '../components/SearchBar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PlanComparison from '../components/PlanComparison';
import './LandingPage.css';

const LandingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [searchQuery]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      let response;
      if (searchQuery) {
        response = await api.get(`/search/plans?q=${encodeURIComponent(searchQuery)}`);
      } else {
        response = await api.get('/plans');
      }
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    if (term) {
      window.location.href = `/?search=${encodeURIComponent(term)}`;
    } else {
      window.location.href = '/';
    }
  };

  const togglePlanSelection = (planId) => {
    setSelectedPlans(prev => {
      if (prev.includes(planId)) {
        return prev.filter(id => id !== planId);
      } else if (prev.length < 3) {
        return [...prev, planId];
      }
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedPlans.length >= 2) {
      setShowComparison(true);
    }
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-content">
          <h1 className="logo-text">
            <span className="gradient-text">FitPlanHub</span>
          </h1>
          <p className="tagline">Your journey to fitness starts here</p>
          <SearchBar onSearch={handleSearch} />
          <div className="header-actions">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
        <div className="header-decoration">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </header>

      <main className="plans-section">
        <div className="section-header">
          <h2>
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Available Fitness Plans'}
          </h2>
          <div className="header-actions-group">
            {selectedPlans.length >= 2 && (
              <button onClick={handleCompare} className="btn btn-compare">
                Compare ({selectedPlans.length})
              </button>
            )}
            {searchQuery && (
              <button onClick={() => window.location.href = '/'} className="clear-search">
                Clear Search
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <LoadingSkeleton count={6} />
        ) : plans.length === 0 ? (
          <div className="no-plans">
            <div className="empty-state">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <h3>No fitness plans found</h3>
              <p>{searchQuery ? 'Try a different search term' : 'Be the first to create a plan!'}</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="plans-grid">
              {plans.map((plan, index) => (
                <div 
                  key={plan.id} 
                  className={`plan-card ${selectedPlans.includes(plan.id) ? 'selected' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-top">
                    <div className="card-badge">{plan.subscriberCount} subscribers</div>
                    <button
                      onClick={() => togglePlanSelection(plan.id)}
                      className={`compare-checkbox ${selectedPlans.includes(plan.id) ? 'checked' : ''}`}
                      title="Select for comparison"
                    >
                      {selectedPlans.includes(plan.id) && '✓'}
                    </button>
                  </div>
                  <h3>{plan.title}</h3>
                  <p className="trainer-name">by {plan.trainerName}</p>
                  <div className="plan-details">
                    <span className="price">${plan.price}</span>
                    <span className="duration">{plan.duration} days</span>
                  </div>
                  <Link to={`/plans/${plan.id}`} className="btn btn-outline">
                    View Details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
            {showComparison && (
              <PlanComparison
                plans={plans.filter(p => selectedPlans.includes(p.id))}
                onClose={() => {
                  setShowComparison(false);
                  setSelectedPlans([]);
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;
