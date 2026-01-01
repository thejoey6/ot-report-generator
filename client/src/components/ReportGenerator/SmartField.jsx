import React, { useState, useEffect, useRef, useContext } from 'react';
import { Sparkles, Check, Edit2, Trash2, Star, X, TrendingUp } from 'lucide-react';
import { AuthContext } from '../../AuthContext';
import { useConfirmDialog } from "../../hooks/useConfirmDialogue";
import './smartField.css';

export default function SmartField({
  label,
  value,
  onChange,
  placeholder,
  fieldName,
  category,
  clientAge,
  relatedFields = {},
  type = 'text',
  required = false,
  className = '',
  rows = 4,
}) {
  const { accessToken: token, user } = useContext(AuthContext);
  
  const userId = user?.userId;
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const [showModal, setShowModal] = useState(false);
  const [modalSuggestions, setModalSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('frequent');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [smartPicks, setSmartPicks] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  
  const { confirm, ConfirmDialog } = useConfirmDialog();
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch suggestions on mount, when key dependencies change
  useEffect(() => {
    if (userId && fieldName && category) {
      fetchSuggestions();
    } else {
      console.warn(`[SmartField ${fieldName}] Cannot fetch - missing:`, { userId, fieldName, category });
      setIsLoadingSuggestions(false);
    }
  }, [userId, fieldName, category, clientAge]);

  // Recalculate smart picks when relatedFields change
  useEffect(() => {
    if (allSuggestions.length > 0) {
      calculateSmartPicks(allSuggestions);
    }
  }, [JSON.stringify(relatedFields)]);

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    
    try {
      const params = new URLSearchParams({
        category,
        fieldName,
        ageMonths: clientAge || '',
        context: JSON.stringify(relatedFields),
      });

      const response = await fetch(`/api/suggestions/intelligent?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        const suggestions = (data.suggestions || []).map(s => ({
          ...s,
          isPinned: !!s.isPinned,
          usageCount: s.usageCount || 0,
          contextScore: s.contextScore || 0,
        }));
        
        setAllSuggestions(suggestions);
        
        if (suggestions.length > 0) {
          calculateSmartPicks(suggestions);
        } else {
          setSmartPicks([]);
        }
      } else {
        console.error(`[SmartField ${fieldName}]  API error:`, response.status, await response.text());
      }
    } catch (error) {
      console.error(`[SmartField ${fieldName}]  Fetch failed:`, error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const calculateSmartPicks = (suggestions) => {
    
    if (suggestions.length === 0) {
      setSmartPicks([]);
      return;
    }

    const pinned = suggestions.filter(s => s.isPinned).slice(0, 3);
    
    const contextual = suggestions
      .filter(s => !s.isPinned && s.contextScore && s.contextScore > 0.7)
      .sort((a, b) => b.contextScore - a.contextScore);
    console.log(`[SmartField ${fieldName}] Found ${contextual.length} contextual`);
    
    const contextualTexts = new Set(contextual.map(s => s.text));
    const mostUsed = suggestions
      .filter(s => !s.isPinned && !contextualTexts.has(s.text))
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    
    const maxPicks = rows <= 3 ? 3 : rows <= 5 ? 4 : 5;
    
    const picks = [...pinned];
    
    for (const suggestion of contextual) {
      if (picks.length >= maxPicks) break;
      picks.push(suggestion);
    }
    
    for (const suggestion of mostUsed) {
      if (picks.length >= maxPicks) break;
      picks.push(suggestion);
    }
    
    setSmartPicks(picks);
  };

  useEffect(() => {
    if (!value || value.trim() === '') {
      setFilteredSuggestions(allSuggestions.slice(0, 8));
    } else {
      const filtered = allSuggestions
        .filter(s => s.text.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setFilteredSuggestions(filtered);
    }
  }, [value, allSuggestions]);

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredSuggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = async (suggestion) => {
    onChange(suggestion.text);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const openModal = async () => {
    setShowModal(true);
    await fetchModalSuggestions('frequent');
  };

  const fetchModalSuggestions = async (tab) => {
    try {
      const params = new URLSearchParams({
        category,
        fieldName,
        ageMonths: clientAge || '',
        tab,
        context: JSON.stringify(relatedFields),
      });

      const response = await fetch(`/api/suggestions/intelligent?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setModalSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch modal suggestions:', error);
    }
  };

  const startEdit = (suggestion) => {
    setEditingId(suggestion.id);
    setEditText(suggestion.text);
  };

  const saveEdit = async (suggestionId) => {
    try {
      const response = await fetch(`/api/suggestions/${suggestionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editText }),
      });

      if (response.ok) {
        setEditingId(null);
        await fetchModalSuggestions(activeTab);
        await fetchSuggestions();
      }
    } catch (error) {
      console.error('Failed to edit suggestion:', error);
    }
  };

  const deleteSuggestion = async (suggestionId) => {
    const ok = await confirm("Delete this suggestion?");
    if (!ok) return;

    try {
      const response = await fetch(`/api/suggestions/${suggestionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setAllSuggestions((prev) => {
          const updated = prev.filter((s) => s.id !== suggestionId);
          calculateSmartPicks(updated);
          return updated;
        });
        
        if (modalSuggestions) {
          setModalSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
        }

        await fetchSuggestions();
        if (activeTab) await fetchModalSuggestions(activeTab);
      } else {
        console.error('Failed to delete suggestion:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting suggestion:', error);
    }
  };

  const togglePin = async (suggestionId) => {
    if (!suggestionId) return;

    try {
      const response = await fetch(`/api/suggestions/${suggestionId}/pin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchModalSuggestions(activeTab);
        await fetchSuggestions();
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderInput = () => {
    const commonProps = {
      ref: inputRef,
      value: value || '',
      onChange: (e) => onChange(e.target.value),
      onFocus: () => setShowDropdown(true),
      onKeyDown: handleKeyDown,
      placeholder,
      className: `smart-input ${className}`,
      required,
    };

    if (type === 'textarea') {
      return <textarea {...commonProps} rows={rows} />;
    }

    return <input {...commonProps} type="text" />;
  };

  const getPinnedCount = () => allSuggestions.filter(s => s.isPinned).length;

  return (
    <>
      <div className="smart-field-wrapper">
        <label className="smart-field-label">
          {label}
          {required && <span className="required">*</span>}
          
          <button
            type="button"
            onClick={openModal}
            className="suggestion-trigger-btn"
            title="View all suggestions & manage"
          >
            <Sparkles size={14} />
          </button>
          
          {allSuggestions.length > 0 && (
            <span className="suggestions-indicator">
              {allSuggestions.length} available
            </span>
          )}
        </label>

        <div className="smart-input-container">
          {renderInput()}

          {showDropdown && filteredSuggestions.length > 0 && (
            <div ref={dropdownRef} className="inline-suggestions-dropdown">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id || index}
                  className={`inline-suggestion-item ${
                    index === selectedIndex ? 'selected' : ''
                  } ${value === suggestion.text ? 'active' : ''}`}
                  onClick={() => handleSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="suggestion-content">
                    {suggestion.isPinned && <Star size={14} className="pin-icon" />}
                    <span className="suggestion-text">{suggestion.text}</span>
                  </div>
                  {suggestion.usageCount > 0 && (
                    <span className="usage-badge">{suggestion.usageCount}×</span>
                  )}
                  {value === suggestion.text && <Check size={16} className="check-icon" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Changed to 1000 for temporary solution.... change*/}
        {smartPicks.length > 1000 && (
          <div className="smart-picks-container">
            <div className="smart-picks-header">
              <TrendingUp size={12} />
              <span className="smart-picks-label">Smart picks</span>
              {getPinnedCount() > 0 && (
                <span className="pinned-count">{getPinnedCount()} pinned</span>
              )}
            </div>
            <div className="smart-picks-grid">
              {smartPicks.map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className={`smart-pick-btn ${value === suggestion.text ? 'active' : ''} ${
                    suggestion.contextScore > 0.7 ? 'contextual' : ''
                  }`}
                  title={suggestion.text}
                >
                  {suggestion.isPinned && <Star size={10} className="pick-star" />}
                  <span className="pick-text">{suggestion.text}</span>
                  {suggestion.contextScore > 0.7 && !suggestion.isPinned && (
                    <span className="context-badge">🎯</span>
                  )}
                  {suggestion.usageCount > 0 && !suggestion.isPinned && (
                    <span className="pick-usage">{suggestion.usageCount}×</span>
                  )}
                  {value === suggestion.text && <Check size={10} className="pick-check" />}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {isLoadingSuggestions && userId && (
          <div className="smart-picks-loading">
            <Sparkles size={12} style={{ color: '#95D5B2' }} />
            <span>Loading suggestions...</span>
          </div>
        )}
        
        {!userId && (
          <div className="smart-picks-error">
            <span>⚠️ Not authenticated - suggestions unavailable</span>
          </div>
        )}
        
        {!isLoadingSuggestions && userId && allSuggestions.length === 0 && (
          <div className="smart-picks-empty">
            <span></span>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="suggestions-overlay" onClick={() => setShowModal(false)}>
          <div className="suggestions-panel" onClick={(e) => e.stopPropagation()}>
            <div className="suggestions-header">
              <div className="suggestions-title">
                <Sparkles size={20} />
                <h3>{label}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="suggestions-close">
                <X size={20} />
              </button>
            </div>

            <div className="suggestions-field-info">
              <span className="field-category">{category}</span>
            </div>

            <div className="suggestions-tabs">
              <button
                className={`suggestion-tab ${activeTab === 'frequent' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('frequent');
                  fetchModalSuggestions('frequent');
                }}
              >
                All Suggestions
              </button>
              <button
                className={`suggestion-tab ${activeTab === 'contextual' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('contextual');
                  fetchModalSuggestions('contextual');
                }}
              >
                Contextual
              </button>
              <button
                className={`suggestion-tab ${activeTab === 'pinned' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('pinned');
                  fetchModalSuggestions('pinned');
                }}
              >
                Pinned ({getPinnedCount()})
              </button>
            </div>

            <div className="suggestions-list">
              {activeTab === 'pinned' && getPinnedCount() === 0 && (
                <div className="suggestions-empty">
                  <Star size={32} opacity={0.3} />
                  <p>No pinned suggestions</p>
                  <span>Pin your favorites to always show them first (max 3 per field)</span>
                </div>
              )}
              
              {modalSuggestions.length > 0 ? (
                modalSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="suggestion-item-editable">
                    {editingId === suggestion.id ? (
                      <div className="suggestion-edit-mode">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="suggestion-edit-input"
                          autoFocus
                          rows={3}
                        />
                        <div className="suggestion-edit-actions">
                          <button onClick={() => saveEdit(suggestion.id)} className="save-edit-btn">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="cancel-edit-btn">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="suggestion-content-full">
                          <button
                            onClick={() => togglePin(suggestion.id)}
                            className={`pin-btn ${suggestion.isPinned ? 'pinned' : ''}`}
                            title={
                              suggestion.isPinned 
                                ? 'Unpin' 
                                : getPinnedCount() >= 3 
                                ? 'Max 3 pins - unpin another first' 
                                : 'Pin to smart picks'
                            }
                            disabled={!suggestion.isPinned && getPinnedCount() >= 3}
                          >
                            <Star size={16} />
                          </button>
                          <span
                            className="suggestion-text-full"
                            onClick={() => {
                              onChange(suggestion.text);
                              setShowModal(false);
                            }}
                          >
                            {suggestion.text}
                          </span>
                          <div className="suggestion-meta">
                            {suggestion.contextScore > 0.7 && (
                              <span className="context-badge-modal">🎯 Relevant</span>
                            )}
                            {suggestion.usageCount > 0 && (
                              <span className="usage-count">{suggestion.usageCount}×</span>
                            )}
                          </div>
                        </div>
                        <div className="suggestion-actions">
                          <button
                            onClick={() => startEdit(suggestion)}
                            className="edit-suggestion-btn"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteSuggestion(suggestion.id)}
                            className="delete-suggestion-btn"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                activeTab !== 'pinned' && (
                  <div className="suggestions-empty">
                    <Sparkles size={32} opacity={0.3} />
                    <p>No suggestions yet</p>
                    <span>Suggestions appear after using them once</span>
                  </div>
                )
              )}
            </div>

            <div className="suggestions-footer">
              <div className="suggestions-footer-left">
              </div>
              <button
                className="suggestions-action-btn secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
          <ConfirmDialog />
        </div>
      )}
    </>
  );
}