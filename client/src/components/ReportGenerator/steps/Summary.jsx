import { useState } from 'react';
import { FileText, Target, Lightbulb, AlertCircle } from 'lucide-react';
import SmartField from '../SmartField';

export default function Summary({ data, updateData, clientInformation }) {
  const [form, setForm] = useState(() => {
    if (data && Object.keys(data).length > 0) {
      return data;
    }
    return {
      overallImpression: '',
      strengths: '',
      areasOfConcern: '',
      recommendations: '',
      followUpPlan: '',
      additionalNotes: '',
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
        {/* Overall Impression */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <FileText size={18} />
            Overall Clinical Impression
          </h4>

          <SmartField
            label="Overall Impression"
            value={form.overallImpression}
            onChange={(val) => handleChange('overallImpression', val)}
            placeholder="Summarize the overall clinical impression of the client"
            fieldName="overallImpression"
            category="summary"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />
        </div>

        {/* Strengths & Concerns */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Target size={18} />
            Strengths & Areas of Concern
          </h4>

          <SmartField
            label="Identified Strengths"
            value={form.strengths}
            onChange={(val) => handleChange('strengths', val)}
            placeholder="List the client's strengths and positive observations"
            fieldName="strengths"
            category="summary"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label={
              <>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Areas of Concern
              </>
            }
            value={form.areasOfConcern}
            onChange={(val) => handleChange('areasOfConcern', val)}
            placeholder="List areas that need attention or intervention"
            fieldName="areasOfConcern"
            category="summary"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />
        </div>

        {/* Recommendations */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Lightbulb size={18} />
            Recommendations & Follow-Up
          </h4>

          <SmartField
            label="Recommendations"
            value={form.recommendations}
            onChange={(val) => handleChange('recommendations', val)}
            placeholder="Provide detailed recommendations for therapy, interventions, and next steps"
            fieldName="recommendations"
            category="summary"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Follow-Up Plan"
            value={form.followUpPlan}
            onChange={(val) => handleChange('followUpPlan', val)}
            placeholder="Describe the follow-up plan and timeline"
            fieldName="followUpPlan"
            category="summary"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Additional Notes"
            value={form.additionalNotes}
            onChange={(val) => handleChange('additionalNotes', val)}
            placeholder="Any additional notes or information"
            fieldName="additionalNotes"
            category="summary"
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