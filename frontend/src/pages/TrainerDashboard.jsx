import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { logout } from '../utils/auth';
import './TrainerDashboard.css';

const TrainerDashboard = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans/trainer/my-plans');
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingPlan) {
        await api.put(`/plans/${editingPlan.id}`, formData);
      } else {
        await api.post('/plans', formData);
      }
      setShowForm(false);
      setEditingPlan(null);
      setFormData({ title: '', description: '', price: '', duration: '' });
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      price: plan.price.toString(),
      duration: plan.duration.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      await api.delete(`/plans/${planId}`);
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting plan');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="trainer-dashboard">
      <header className="dashboard-header">
        <h1>Trainer Dashboard</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/trainer/stats')} className="btn btn-secondary">
            📊 Statistics
          </button>
          <button onClick={() => navigate('/feed')} className="btn btn-secondary">
            View Feed
          </button>
          <button onClick={handleLogout} className="btn btn-outline">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-actions">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingPlan(null);
              setFormData({ title: '', description: '', price: '', duration: '' });
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : '+ Create New Plan'}
          </button>
        </div>

        {showForm && (
          <div className="plan-form-card">
            <h2>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Fat Loss Beginner Plan"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describe your fitness plan..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Duration (days)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="30"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </form>
          </div>
        )}

        <div className="plans-section">
          <h2>My Plans ({plans.length})</h2>
          {plans.length === 0 ? (
            <p className="no-plans">You haven't created any plans yet.</p>
          ) : (
            <div className="plans-grid">
              {plans.map((plan) => (
                <div key={plan.id} className="plan-card">
                  <h3>{plan.title}</h3>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-details">
                    <span className="price">${plan.price}</span>
                    <span className="duration">{plan.duration} days</span>
                  </div>
                  <p className="subscribers">{plan._count.subscriptions} subscribers</p>
                  <div className="plan-actions">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainerDashboard;
