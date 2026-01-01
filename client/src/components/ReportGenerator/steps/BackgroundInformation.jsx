import { useState } from 'react';
import { Pill, Activity, Users, FileText, GraduationCap, Home } from 'lucide-react';
import SmartField from '../SmartField';

export default function BackgroundInformation({ data, updateData, clientInformation }) {
  const [form, setForm] = useState(() => {
    if (data && Object.keys(data).length > 0) {
      return data;
    }
    return {
      allergies: '',
      currentMedications: '',
      medicalHistory: '',
      familyHistory: '',
      developmentalConcerns: '',
      previousTherapies: '',
      educationalBackground: '',
      livingArrangement: '',
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
        {/* Medical Information */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Pill size={18} />
            Medical Information
          </h4>

          <SmartField
            label="Allergies"
            value={form.allergies}
            onChange={(val) => handleChange('allergies', val)}
            placeholder="List any allergies"
            fieldName="allergies"
            category="backgroundInformation"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Current Medications"
            value={form.currentMedications}
            onChange={(val) => handleChange('currentMedications', val)}
            placeholder="List current medications"
            fieldName="currentMedications"
            category="backgroundInformation"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Medical History"
            value={form.medicalHistory}
            onChange={(val) => handleChange('medicalHistory', val)}
            placeholder="Describe relevant medical history"
            fieldName="medicalHistory"
            category="backgroundInformation"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
            relatedFields={{
              allergies: form.allergies,
              currentMedications: form.currentMedications,
            }}
          />
        </div>

        {/* Family & Developmental */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Users size={18} />
            Family & Developmental Background
          </h4>

          <SmartField
            label="Family History"
            value={form.familyHistory}
            onChange={(val) => handleChange('familyHistory', val)}
            placeholder="Relevant family medical/developmental history"
            fieldName="familyHistory"
            category="backgroundInformation"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Developmental Concerns"
            value={form.developmentalConcerns}
            onChange={(val) => handleChange('developmentalConcerns', val)}
            placeholder="Parent's primary concerns about development"
            fieldName="developmentalConcerns"
            category="backgroundInformation"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Living Arrangement"
            value={form.livingArrangement}
            onChange={(val) => handleChange('livingArrangement', val)}
            placeholder="Describe living situation and family structure"
            fieldName="livingArrangement"
            category="backgroundInformation"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />
        </div>

        {/* Therapy & Education */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Activity size={18} />
            Therapy & Education History
          </h4>

          <SmartField
            label="Previous/Current Therapies"
            value={form.previousTherapies}
            onChange={(val) => handleChange('previousTherapies', val)}
            placeholder="List any previous or current therapies (PT, OT, ST, etc.)"
            fieldName="previousTherapies"
            category="backgroundInformation"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Educational Background"
            value={form.educationalBackground}
            onChange={(val) => handleChange('educationalBackground', val)}
            placeholder="Current educational setting, daycare, preschool, etc."
            fieldName="educationalBackground"
            category="backgroundInformation"
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