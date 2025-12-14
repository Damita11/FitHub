import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/api';
import { logout } from '../utils/auth';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      showToast('Failed to load favorites', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (planId) => {
    try {
      await api.delete(`/favorites/${planId}`);
      setFavorites(favorites.filter(fav => fav.planId !== planId));
      showToast('Removed from favorites', 'info');
    } catch (error) {
      showToast('Failed to remove favorite', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <h1>My Favorites</h1>
        <div className="header-actions">
          <Link to="/feed" className="btn btn-secondary">My Feed</Link>
          <button onClick={handleLogout} className="btn btn-outline">Logout</button>
        </div>
      </header>

      <main className="favorites-content">
        {favorites.length === 0 ? (
          <div className="empty-favorites">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2>No favorites yet</h2>
            <p>Start exploring plans and add them to your favorites!</p>
            <Link to="/" className="btn btn-primary">Browse Plans</Link>
          </div>
        ) : (
          <>
            <div className="favorites-stats">
              <p>{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="favorites-grid">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="favorite-card">
                  <button
                    onClick={() => handleRemoveFavorite(favorite.plan.id)}
                    className="remove-favorite"
                    title="Remove from favorites"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                  <h3>{favorite.plan.title}</h3>
                  <p className="trainer-name">by {favorite.plan.trainer.user.name}</p>
                  <div className="plan-details">
                    <span className="price">${favorite.plan.price}</span>
                    <span className="duration">{favorite.plan.duration} days</span>
                  </div>
                  <Link to={`/plans/${favorite.plan.id}`} className="btn btn-outline">
                    View Plan
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
