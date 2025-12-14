import { useState } from 'react';
import { Link } from 'react-router-dom';
import './PlanComparison.css';

const PlanComparison = ({ plans, onClose }) => {
  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="comparison-overlay" onClick={onClose}>
      <div className="comparison-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comparison-header">
          <h2>Compare Plans</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="comparison-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                {plans.map(plan => (
                  <th key={plan.id}>
                    <div className="plan-header-cell">
                      <h3>{plan.title}</h3>
                      <p>by {plan.trainerName}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Price</td>
                {plans.map(plan => (
                  <td key={plan.id} className="price-cell">${plan.price}</td>
                ))}
              </tr>
              <tr>
                <td>Duration</td>
                {plans.map(plan => (
                  <td key={plan.id}>{plan.duration} days</td>
                ))}
              </tr>
              <tr>
                <td>Subscribers</td>
                {plans.map(plan => (
                  <td key={plan.id}>{plan.subscriberCount || 0}</td>
                ))}
              </tr>
              <tr>
                <td>Actions</td>
                {plans.map(plan => (
                  <td key={plan.id}>
                    <Link to={`/plans/${plan.id}`} className="btn btn-primary">
                      View Details
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlanComparison;
