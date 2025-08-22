import React, { useState, useEffect } from 'react';
import TemplateUpload from './TemplateUpload';
import TemplateList from './TemplateList';

function TemplateManager() {
  const [templates, setTemplates] = useState([]);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/templates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div>
      <TemplateUpload onUploadComplete={fetchTemplates} />
      <TemplateList templates={templates} onRefresh={fetchTemplates} />
    </div>
  );
}

export default TemplateManager;