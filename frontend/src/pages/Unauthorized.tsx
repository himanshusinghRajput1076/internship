import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <h1>403</h1>
      <h2>Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <button className="btn-primary btn-sm" style={{ marginTop: '1rem', width: 'auto' }} onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;
