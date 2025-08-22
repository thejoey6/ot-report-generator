import React from 'react';
import LogoutButton from '../components/Header';
import TemplateManager from '../components/TemplateManager';
import TemplateUploader from '../components/TemplateUpload';
import TemplateList from '../components/TemplateList';

function Dashboard() {
  return (
      <div>
        <h1>Welcome to the Dashboard of Report Generator </h1>
        <LogoutButton />
        <TemplateManager />
      </div>
  );
}

export default Dashboard;