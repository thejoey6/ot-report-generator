import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { FileText, LogOut, ArrowLeft } from 'lucide-react';
import './header.css';

export default function Header() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isOnReportGenerator = location.pathname === '/generate';

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-icon-small">
            <FileText />
          </div>
          <h1 className="header-title">OT Report Generator</h1>
        </div>
        
        <div className="header-actions">
          {isOnReportGenerator && (
            <button onClick={handleBackToDashboard} className="back-to-dashboard-btn">
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
          )}
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}