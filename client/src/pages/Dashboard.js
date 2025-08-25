import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/Header';
import TemplateManager from '../components/TemplateManager';

function Dashboard() {
  const navigate = useNavigate();
  return (
      <div>
        <h1>Welcome to the Dashboard of Report Generator </h1>
        <LogoutButton />
        <TemplateManager />
        <button onClick={() => navigate('/generate')}>Generate Report</button>
      </div>
  );
}

export default Dashboard;