import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { logout } from '../utils/auth';
import './StatsDashboard.css';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/trainer');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="error">Error loading statistics</div>;
  }

  return (
    <div className="stats-dashboard">
      <header className="dashboard-header">
        <h1>Statistics Dashboard</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/trainer/dashboard')} className="btn btn-secondary">
            Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </header>

      <main className="stats-content">
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p className="stat-value">${stats.stats.totalRevenue}</p>
            </div>
          </div>

          <div className="stat-card subscribers">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Subscribers</h3>
              <p className="stat-value">{stats.stats.totalSubscribers}</p>
              <p className="stat-subtext">{stats.stats.activeSubscriptions} active</p>
            </div>
          </div>

          <div className="stat-card plans">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>Total Plans</h3>
              <p className="stat-value">{stats.stats.totalPlans}</p>
            </div>
          </div>

          <div className="stat-card followers">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>Followers</h3>
              <p className="stat-value">{stats.stats.followers}</p>
            </div>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-card">
            <h2>Monthly Revenue</h2>
            <div className="revenue-chart">
              {stats.monthlyRevenue.map((month, index) => {
                const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill" 
                      style={{ height: `${height}%` }}
                      title={`$${month.revenue}`}
                    ></div>
                    <span className="bar-label">{month.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chart-card">
            <h2>Top Performing Plans</h2>
            <div className="top-plans">
              {stats.topPlans.length === 0 ? (
                <p className="no-data">No plans yet</p>
              ) : (
                stats.topPlans.map((plan, index) => (
                  <div key={plan.id} className="plan-item">
                    <div className="plan-rank">#{index + 1}</div>
                    <div className="plan-details">
                      <h4>{plan.title}</h4>
                      <p>{plan.subscribers} subscribers • ${plan.revenue.toFixed(2)} revenue</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StatsDashboard;
