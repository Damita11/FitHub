import { useState, useEffect } from 'react';
import api from '../config/api';
import { useToast } from '../context/ToastContext';
import './ProgressTracker.css';

const ProgressTracker = ({ planId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProgress();
  }, [planId]);

  const fetchProgress = async () => {
    try {
      const response = await api.get(`/progress/${planId}`);
      setProgress(response.data.progress);
    } catch (error) {
      // Progress might not exist yet
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (day, completed) => {
    try {
      await api.put(`/progress/${planId}`, { day, completed });
      await fetchProgress();
      showToast(completed ? 'Workout marked as completed! 🎉' : 'Workout marked as incomplete', 'success');
    } catch (error) {
      showToast('Failed to update progress', 'error');
    }
  };

  if (loading || !progress) {
    return null;
  }

  const completionPercentage = (progress.completedDays / progress.totalDays) * 100;

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <h3>Your Progress</h3>
        <div className="progress-percentage">{Math.round(completionPercentage)}%</div>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      <div className="progress-stats">
        <span>{progress.completedDays} of {progress.totalDays} days completed</span>
      </div>
      <div className="calendar-grid">
      {Array.from({ length: progress.totalDays }, (_, i) => {
        const day = i + 1;
        const dayStr = String(day);
        const isCompleted = (progress.completedDaysList || []).includes(dayStr);
        return (
          <button
            key={day}
            className={`calendar-day ${isCompleted ? 'completed' : ''}`}
            onClick={() => updateProgress(day, !isCompleted)}
            title={`Day ${day}`}
          >
            {day}
          </button>
        );
      })}
      </div>
    </div>
  );
};

export default ProgressTracker;
