import './LoadingSkeleton.css';

const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-header"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
          <div className="skeleton-footer"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
