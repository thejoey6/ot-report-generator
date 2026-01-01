import { useState } from 'react';
import { Utensils, AlertCircle, Eye, Ear, Hand } from 'lucide-react';
import SmartField from '../SmartField';

export default function FeedingAndSensory({ data, updateData, clientInformation }) {
  const [form, setForm] = useState(() => {
    if (data && Object.keys(data).length > 0) {
      return data;
    }
    return {
      feedingHistory: '',
      currentDiet: '',
      feedingConcerns: '',
      oralMotorSkills: '',
      texturePreferences: '',
      visualSensory: '',
      auditorySensory: '',
      tactileSensory: '',
      vestibularProprioceptive: '',
      sensorySeekingAvoiding: '',
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
        {/* Feeding */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Utensils size={18} />
            Feeding History & Skills
          </h4>

          <SmartField
            label="Feeding History"
            value={form.feedingHistory}
            onChange={(val) => handleChange('feedingHistory', val)}
            placeholder="Breastfeeding, bottle feeding, introduction of solids"
            fieldName="feedingHistory"
            category="feedingAndSensory"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Current Diet"
            value={form.currentDiet}
            onChange={(val) => handleChange('currentDiet', val)}
            placeholder="Current foods, eating patterns, preferences"
            fieldName="currentDiet"
            category="feedingAndSensory"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Feeding Concerns"
            value={form.feedingConcerns}
            onChange={(val) => handleChange('feedingConcerns', val)}
            placeholder="Picky eating, refusal, difficulties, etc."
            fieldName="feedingConcerns"
            category="feedingAndSensory"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Oral Motor Skills"
            value={form.oralMotorSkills}
            onChange={(val) => handleChange('oralMotorSkills', val)}
            placeholder="Chewing, swallowing, drooling, tongue movement"
            fieldName="oralMotorSkills"
            category="feedingAndSensory"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Texture Preferences/Aversions"
            value={form.texturePreferences}
            onChange={(val) => handleChange('texturePreferences', val)}
            placeholder="Preferred and avoided food textures"
            fieldName="texturePreferences"
            category="feedingAndSensory"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />
        </div>

        {/* Sensory Processing */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Eye size={18} />
            Sensory Processing
          </h4>

          <SmartField
            label="Visual Sensory"
            value={form.visualSensory}
            onChange={(val) => handleChange('visualSensory', val)}
            placeholder="Responses to visual input, brightness, patterns"
            fieldName="visualSensory"
            category="feedingAndSensory"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Auditory Sensory"
            value={form.auditorySensory}
            onChange={(val) => handleChange('auditorySensory', val)}
            placeholder="Responses to sounds, noise sensitivity"
            fieldName="auditorySensory"
            category="feedingAndSensory"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Tactile Sensory"
            value={form.tactileSensory}
            onChange={(val) => handleChange('tactileSensory', val)}
            placeholder="Responses to touch, textures, clothing"
            fieldName="tactileSensory"
            category="feedingAndSensory"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Vestibular & Proprioceptive"
            value={form.vestibularProprioceptive}
            onChange={(val) => handleChange('vestibularProprioceptive', val)}
            placeholder="Responses to movement, body awareness, balance"
            fieldName="vestibularProprioceptive"
            category="feedingAndSensory"
            type="textarea"
            clientAge={clientInformation?.ageInMonths}
          />

          <SmartField
            label="Sensory Seeking/Avoiding Behaviors"
            value={form.sensorySeekingAvoiding}
            onChange={(val) => handleChange('sensorySeekingAvoiding', val)}
            placeholder="Patterns of seeking or avoiding sensory input"
            fieldName="sensorySeekingAvoiding"
            category="feedingAndSensory"
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