import React, { useState, useEffect, useContext } from 'react';
import TemplateUpload from './TemplateUpload';
import TemplateList from './TemplateList';
import { AuthContext } from '../AuthContext';

function TemplateManager({templates, fetchTemplates}) {
const { accessToken, fetchAccessToken } = useContext(AuthContext);

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div>
      <TemplateUpload onUploadComplete={fetchTemplates} token={accessToken} />
      <TemplateList templates={templates} onRefresh={fetchTemplates} token={accessToken} />
    </div>
  );
}

export default TemplateManager;