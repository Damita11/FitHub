import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TrainerDashboard from './pages/TrainerDashboard';
import PlanDetails from './pages/PlanDetails';
import UserFeed from './pages/UserFeed';
import TrainerProfile from './pages/TrainerProfile';
import StatsDashboard from './pages/StatsDashboard';
import FavoritesPage from './pages/FavoritesPage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { ToastProvider } from './context/ToastContext';
import { isAuthenticated } from './utils/auth';
import './App.css';

function App() {

  return (
    <ToastProvider>
      <Router>
        <Navbar />
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/feed" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated() ? <Navigate to="/feed" replace /> : <Signup />}
        />
        <Route
          path="/trainer/dashboard"
          element={
            <PrivateRoute requireRole="TRAINER">
              <TrainerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainer/stats"
          element={
            <PrivateRoute requireRole="TRAINER">
              <StatsDashboard />
            </PrivateRoute>
          }
        />
        <Route path="/plans/:id" element={<PlanDetails />} />
        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <UserFeed />
            </PrivateRoute>
          }
        />
        <Route path="/trainer/:trainerId" element={<TrainerProfile />} />
        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <FavoritesPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
