import { useState } from 'react';
import { Eye, Users, Smile, Activity, MessageSquare } from 'lucide-react';
import SmartField from '../SmartField';

export default function ClinicalObservations({ data, updateData, clientInformation }) {
  const [form, setForm] = useState(() => {
    if (data && Object.keys(data).length > 0) {
      return data;
    }
    return {
      appearance: '',
      behavior: '',
      mood: '',
      attention: '',
      eyeContact: '',
      socialInteraction: '',
      communication: '',
      motorSkills: '',
      playSkills: '',
      sensoryResponses: '',
      otherObservations: '',
    };
  });

  const handleChange = (key, value) => {
    const newForm = { ...form, [key]: value };
    setForm(newForm);
    updateData(newForm);
  };

  return (
    <div className="step-form">
      <div className="form-section-group">
        {/* Physical & Behavioral */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Eye size={18} />
            Physical Appearance & Behavior
          </h4>

          <SmartField
            label="Appearance"
            value={form.appearance}
            onChange={(val) => handleChange('appearance', val)}
            placeholder="Describe physical appearance, grooming, dress"
            fieldName="appearance"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Behavior During Evaluation"
            value={form.behavior}
            onChange={(val) => handleChange('behavior', val)}
            placeholder="Describe behavior, cooperation, activity level"
            fieldName="behavior"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Mood & Affect"
            value={form.mood}
            onChange={(val) => handleChange('mood', val)}
            placeholder="Describe emotional state and affect"
            fieldName="mood"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />
        </div>

        {/* Attention & Interaction */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Users size={18} />
            Attention & Social Interaction
          </h4>

          <SmartField
            label="Attention & Focus"
            value={form.attention}
            onChange={(val) => handleChange('attention', val)}
            placeholder="Describe attention span, distractibility, focus"
            fieldName="attention"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Eye Contact"
            value={form.eyeContact}
            onChange={(val) => handleChange('eyeContact', val)}
            placeholder="Quality and frequency of eye contact"
            fieldName="eyeContact"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Social Interaction"
            value={form.socialInteraction}
            onChange={(val) => handleChange('socialInteraction', val)}
            placeholder="Describe social engagement, joint attention, reciprocity"
            fieldName="socialInteraction"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />
        </div>

        {/* Communication & Skills */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <MessageSquare size={18} />
            Communication & Developmental Skills
          </h4>

          <SmartField
            label="Communication Skills"
            value={form.communication}
            onChange={(val) => handleChange('communication', val)}
            placeholder="Verbal and non-verbal communication observed"
            fieldName="communication"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Motor Skills"
            value={form.motorSkills}
            onChange={(val) => handleChange('motorSkills', val)}
            placeholder="Gross and fine motor skills observed"
            fieldName="motorSkills"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Play Skills"
            value={form.playSkills}
            onChange={(val) => handleChange('playSkills', val)}
            placeholder="Types of play, imaginative play, toy use"
            fieldName="playSkills"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />
        </div>

        {/* Sensory & Additional */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Activity size={18} />
            Sensory & Additional Observations
          </h4>

          <SmartField
            label="Sensory Responses"
            value={form.sensoryResponses}
            onChange={(val) => handleChange('sensoryResponses', val)}
            placeholder="Responses to sensory input (auditory, visual, tactile, etc.)"
            fieldName="sensoryResponses"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Other Observations"
            value={form.otherObservations}
            onChange={(val) => handleChange('otherObservations', val)}
            placeholder="Any additional relevant observations"
            fieldName="otherObservations"
            category="clinicalObservations"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />
        </div>
      </div>

      {/* Completion Indicator */}
      <div className="completion-indicator">
        <div className="completion-bar">
          <div 
            className="completion-fill" 
            style={{ 
              width: `${
                (Object.values(form).filter(v => v && v !== '').length / Object.keys(form).length) * 100
              }%` 
            }}
          />
        </div>
        <p className="completion-text">
          {Object.values(form).filter(v => v && v !== '').length} of {Object.keys(form).length} fields completed
        </p>
      </div>
    </div>
  );
}