import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './pages/Menu';
import TestCaseWriter from './pages/TestCaseWriter';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <div className="titlebar shadow-sm">
        <span className="titlebar-content">
          <i className="fas fa-tools me-2 text-primary"></i>
          DevOps Toolkit
        </span>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/test-case-writer" element={<TestCaseWriter />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
