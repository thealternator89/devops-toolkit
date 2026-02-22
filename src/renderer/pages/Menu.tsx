import React from 'react';
import { Link } from 'react-router-dom';

const Menu: React.FC = () => {
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div></div>
        <Link to="/settings" className="btn btn-outline-secondary">
          <i className="fas fa-cog me-2"></i>
          Settings
        </Link>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column">
              <h5 className="card-title text-primary">
                <i className="fas fa-pen-to-square me-2"></i>
                Test Case Writer
              </h5>
              <p className="card-text text-muted">
                Create and manage test cases for your features.
              </p>
              <div className="mt-auto">
                <Link to="/test-case-writer" className="btn btn-outline-primary w-100">
                  Open Tool
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Placeholder for future tools */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100 border-dashed bg-light">
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-muted">
              <i className="fas fa-plus-circle fa-2x mb-2"></i>
              <p className="card-text">More tools coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
