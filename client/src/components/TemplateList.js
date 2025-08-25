import React, { useEffect, useState, useContext } from 'react';

function TemplateList({ templates, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState('');

  const startEdit = (template) => {
    setEditingId(template.id);
    setEditName(template.name);
    setEditDescription(template.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError('');
  };

const saveEdit = async (id) => {
  const token = localStorage.getItem('token');
  try {
    let name = editName.trim();
    if (name === '' || name === '.docx') {
        name = 'default';
    }
    if (!name.toLowerCase().endsWith('.docx')) {
      name += '.docx';
    }

    const res = await fetch(`http://localhost:4000/api/templates/${id}`, {
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
    onRefresh();
  } catch (err) {
    setError(err.message);
  }
};

  const deleteTemplate = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`http://localhost:4000/api/templates/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete');
      }
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
  <div>
    <h2>Your Templates</h2>
    {error && <p style={{ color: 'red' }}>{error}</p>}
    {templates.length === 0 && <p>No templates uploaded yet.</p>}
    <ul>
      {templates.map(template => (
        <li key={template.id} style={{ marginBottom: '1rem' }}>
          {editingId === template.id ? (
            <div>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Template name"
              />
              <br />
              <textarea
                rows={3}
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                style={{ width: '300px' }}
              />
              <br />
              <button onClick={() => {saveEdit(template.id);}} >
                Save
              </button>
              <button onClick={cancelEdit}>Cancel</button>
            </div>
          ) : (
            <>
              <strong>{template.name}</strong> – {template.description || ''}
              <br />
              <button onClick={() => startEdit(template)}>Edit</button>
              <button
                onClick={() => deleteTemplate(template.id)}
                style={{ marginLeft: '0.5rem' }}
              >
                Delete
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  </div>
);
}

export default TemplateList;

