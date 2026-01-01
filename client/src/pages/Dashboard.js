import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import Header from '../components/Header';
import { 
  FileText, Upload, Plus, Edit2, Trash2, X, 
  CheckCircle, AlertCircle, ChevronDown, FolderOpen, Download
} from 'lucide-react';
import './dashboard.css';

function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { accessToken } = useContext(AuthContext);

  // Fetch templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports (mock for now - replace with real API)
  const fetchReports = async () => {
    // TODO: Replace with actual API call
    // For now, using mock data from sessionStorage
    const mockReports = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key.startsWith('reportData_')) {
        const data = JSON.parse(sessionStorage.getItem(key));
        const match = key.match(/reportData_(\d+)_(.*)/);
        if (match) {
          mockReports.push({
            id: key,
            name: match[2],
            templateId: match[1],
            clientName: data.clientInformation?.name || 'Unnamed',
            lastModified: new Date().toISOString(), // You'd get this from backend
            status: 'draft' // or 'complete'
          });
        }
      }
    }
    setReports(mockReports.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)));
  };

  useEffect(() => {
    fetchTemplates();
    fetchReports();
  }, []);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome Back!</h2>
          <p>Create new evaluation reports or manage your templates</p>
        </div>

        {/* Quick Stats (Optional - can be populated later) */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon reports">
              <FileText size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Reports</span>
              <span className="stat-value">—</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon templates">
              <FolderOpen size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Templates</span>
              <span className="stat-value">{templates.length}</span>
            </div>
          </div>
        </div>

        {/* New Report Button */}
        <div className="action-section">
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="new-report-btn"
            disabled={templates.length === 0}
          >
            <Plus size={20} />
            Create New Report
          </button>
          {templates.length === 0 && (
            <p className="helper-text">Upload a template first to create reports</p>
          )}
        </div>

        {/* Two Column Grid */}
        <div className="dashboard-grid">
          {/* Left Column - Recent Reports */}
          <div className="dashboard-column">
            {reports.length > 0 && (
              <div className="reports-section">
                <h3 className="section-title">Recent Reports</h3>
                <div className="reports-list">
                  {reports.map((report, index) => (
                    <div key={report.id} className="report-item">
                      <div className="report-info">
                        <div className="report-icon">
                          <FileText size={18} />
                        </div>
                        <div className="report-details">
                          <h5>
                            {report.name}
                            {index === 0 && <span className="most-recent-badge">Latest</span>}
                          </h5>
                          <p>Client: {report.clientName}</p>
                          <span className="report-date">
                            {new Date(report.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="report-actions">
                        <button 
                          onClick={() => navigate('/generate', { 
                            state: { 
                              reportName: report.name, 
                              selectedTemplateId: report.templateId 
                            } 
                          })}
                          className="report-action-btn edit"
                          title="Continue editing"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this report draft?')) {
                              sessionStorage.removeItem(report.id);
                              sessionStorage.removeItem(report.id.replace('reportData', 'reportStep'));
                              fetchReports();
                            }
                          }}
                          className="report-action-btn delete"
                          title="Delete report"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Templates */}
          <div className="dashboard-column">
            <TemplateManager 
              templates={templates} 
              fetchTemplates={fetchTemplates}
              token={accessToken}
            />
          </div>
        </div>
      </div>

      {/* New Report Modal */}
      {isModalOpen && (
        <NewReportModal
          templates={templates}
          onClose={() => setIsModalOpen(false)}
          navigate={navigate}
        />
      )}
    </div>
  );
}

// Template Manager Component
function TemplateManager({ templates, fetchTemplates, token }) {
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadMessageType, setUploadMessageType] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleUpload = async () => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append("template", uploadFile);
    formData.append("description", uploadDescription);

    try {
      const res = await fetch('/api/templates/upload', {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();
      setUploadMessage(`Successfully uploaded: ${data.name}`);
      setUploadMessageType('success');
      setUploadFile(null);
      setUploadDescription("");
      fetchTemplates();
    } catch (err) {
      setUploadMessage("Upload failed: " + err.message);
      setUploadMessageType('error');
    }
  };

  const startEdit = (template) => {
    setEditingId(template.id);
    setEditName(template.name);
    setEditDescription(template.description || '');
  };

  const saveEdit = async (id) => {
    try {
      let name = editName.trim();
      if (name === '' || name === '.docx') name = 'default';
      if (!name.toLowerCase().endsWith('.docx')) name += '.docx';

      const res = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description: editDescription }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update');
      }
      setEditingId(null);
      fetchTemplates();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete');
      }
      fetchTemplates();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="template-section">
      <h3 className="section-title">Template Management</h3>

      {/* Upload Section */}
      <div className="template-upload-card">
        <div className="upload-header">
          <Upload size={20} />
          <span>Upload New Template</span>
        </div>
        
        <input 
          type="file" 
          accept=".docx" 
          onChange={(e) => setUploadFile(e.target.files[0])}
          className="file-input"
          id="template-upload"
        />
        <label htmlFor="template-upload" className="file-input-label">
          {uploadFile ? uploadFile.name : 'Choose .docx file'}
        </label>

        {uploadFile && (
          <>
            <textarea
              placeholder="Description (optional)"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              rows={2}
              className="template-description-input"
            />
            <button onClick={handleUpload} className="upload-btn">
              <Upload size={18} />
              Upload Template
            </button>
          </>
        )}

        {uploadMessage && (
          <div className={`upload-message ${uploadMessageType}`}>
            {uploadMessageType === 'success' ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {uploadMessage}
          </div>
        )}
      </div>

      {/* Template List */}
      <div className="template-list">
        <h4 className="list-title">Your Templates ({templates.length})</h4>
        
        {templates.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={48} />
            <p>No templates yet</p>
            <span>Upload your first .docx template to get started</span>
          </div>
        ) : (
          <div className="template-items">
            {templates.map(template => (
              <div key={template.id} className="template-item">
                {editingId === template.id ? (
                  <div className="template-edit-mode">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Template name"
                      className="edit-input"
                    />
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="edit-textarea"
                    />
                    <div className="edit-actions">
                      <button onClick={() => saveEdit(template.id)} className="save-btn">
                        <CheckCircle size={16} />
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="cancel-btn">
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="template-info">
                      <div className="template-icon">
                        <FileText size={20} />
                      </div>
                      <div className="template-details">
                        <h5>{template.name}</h5>
                        {template.description && <p>{template.description}</p>}
                      </div>
                    </div>
                    <div className="template-actions">
                      <button onClick={() => startEdit(template)} className="edit-btn">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteTemplate(template.id)} className="delete-btn">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// New Report Modal Component
function NewReportModal({ templates, onClose, navigate }) {
  const [reportName, setReportName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reportName || !selectedTemplateId) {
      setError("Please enter a report name and select a template");
      return;
    }
    onClose();
    navigate("/generate", { state: { reportName, selectedTemplateId } });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close">
          <X size={20} />
        </button>
        
        <h2 className="modal-title">Create New Report</h2>
        
        {error && (
          <div className="modal-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="modal-field">
          <label>Report Name</label>
          <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Enter patient/report name"
          />
        </div>

        <div className="modal-field">
          <label>Select Template</label>
          <div className="select-wrapper">
            <select
              value={selectedTemplateId || ""}
              onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
            >
              <option value="">-- Choose a template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="select-icon" />
          </div>
        </div>

        <button onClick={handleSubmit} className="modal-submit-btn">
          <Plus size={20} />
          Create Report
        </button>
      </div>
    </div>
  );
}

export default Dashboard;