import { useEffect, useState } from "react";
import { User, Calendar, Plus, X, Building } from 'lucide-react';
import SmartField from '../SmartField';

export default function ClientInformation({ data, updateData }) {
  const [age, setAge] = useState(data.age || "");
  const [ageInMonths, setAgeInMonths] = useState(data.ageInMonths || null);
   const [showSecondParent, setShowSecondParent] = useState(
    !!(data.parent2FirstName || data.parent2LastName)
  );

  // Auto-calculate age from DOB and evaluation date
  useEffect(() => {
    if (data.dob && data.evaluationDate) {
      const dobDate = new Date(data.dob);
      const evalDate = new Date(data.evaluationDate);
      if (!isNaN(dobDate) && !isNaN(evalDate)) {
        let months = (evalDate.getFullYear() - dobDate.getFullYear()) * 12;
        months += evalDate.getMonth() - dobDate.getMonth();
        let days = evalDate.getDate() - dobDate.getDate();
        if (days < 0) {
          months -= 1;
          const prevMonth = new Date(evalDate.getFullYear(), evalDate.getMonth(), 0);
          days += prevMonth.getDate();
        }
        const ageStr = `${months} months, ${days} days`;
        setAge(ageStr);
        setAgeInMonths(months);
        updateData({ ...data, age: ageStr, ageInMonths: months });
      }
    }
  }, [data.dob, data.evaluationDate]);



  return (
    <div className="step-form">
      <div className="form-section-group">
        {/* Essential Information */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <User size={18} />
            Client Information
          </h4>
          
          <div className="form-row-2">
          <div className="form-field">
            <label htmlFor="client-name">
              Child's Full Name
            </label>
            <div className="inline-number-group">
              <input
                id="client-first-name"
                type="text"
                value={data.firstName || ""}
                onChange={(e) => updateData({ ...data, firstName: e.target.value })}
                placeholder="First name"
                className="form-input"
              />
              <input
                id="client-last-name"
                type="text"
                value={data.lastName || ""}
                onChange={(e) => updateData({ ...data, lastName: e.target.value })}
                placeholder="Last name"
                className="form-input"
              />
            </div>
          </div>

            <div className="form-field">
              <label htmlFor="uci-nmber">
                UCI #
              </label>
              <input
                id="uci-number"
                type="number"
                value={data.uciNum || ""}
                onChange={(e) => updateData({ ...data, uciNum: e.target.value })}
                placeholder="1234567"
                className="form-input"
              />
            </div>
         </div>

         <div className="form-row-2">
          <div className="form-field">
            <label>Mother's Full Name</label>
            <div className="inline-number-group">
              <input
                type="text"
                value={data.parent1FirstName || ""}
                onChange={(e) => updateData({ ...data, motherFirstName: e.target.value })}
                placeholder="First name"
                className="form-input"
              />
              <input
                type="text"
                value={data.parent1LastName || ""}
                onChange={(e) => updateData({ ...data, motherLastName: e.target.value })}
                placeholder="Last name"
                className="form-input"
              />
            </div>
          </div>
          <div className="form-field">
             <label htmlFor="client-gender">
              Child's Gender
             </label>
            <select
              id="client-gender"
              value={data.gender || ""}
              onChange={(e) => updateData({ ...data, gender: e.target.value })}
              className="form-input"
            >
              <option value="">Select...</option>
              <option value="boy">Boy</option>
              <option value="girl">Girl</option>
              <option value="other">Other</option>
            </select>
           </div>
           </div>

          <div className="form-row-2-fixed">
          {showSecondParent && (
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Parent/Guardian 2</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowSecondParent(false);
                    updateData({ 
                      ...data, 
                      parent2FirstName: "", 
                      parent2LastName: "" 
                    });
                  }}
                  className="close-comments-button"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="inline-number-group">
                <input
                  type="text"
                  value={data.parent2FirstName || ""}
                  onChange={(e) => updateData({ ...data, parent2FirstName: e.target.value })}
                  placeholder="First name"
                  className="form-input"
                />
                <input
                  type="text"
                  value={data.parent2LastName || ""}
                  onChange={(e) => updateData({ ...data, parent2LastName: e.target.value })}
                  placeholder="Last name"
                  className="form-input"
                />
              </div>
            </div>
          )}
          </div>

          {!showSecondParent && (
            <button
              type="button"
              onClick={() => setShowSecondParent(true)}
              className="add-notes-button"
            >
              <Plus size={14} />
              Add second parent/guardian
            </button>
          )}
        </div>


        {/* Date & Age Information */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Calendar size={18} />
            Date & Age Information
          </h4>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="client-dob">
                Date of Birth <span className="required">*</span>
              </label>
              <input
                id="client-dob"
                type="date"
                value={data.dob || ""}
                onChange={(e) => updateData({ ...data, dob: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label htmlFor="client-eval-date">
                Evaluation Date <span className="required">*</span>
              </label>
              <input
                id="client-eval-date"
                type="date"
                value={data.evaluationDate || ""}
                onChange={(e) => updateData({ ...data, evaluationDate: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="client-age">
                Chronological Age <span className="helper-text">(Auto-calculated)</span>
              </label>
              <input
                id="client-age"
                type="text"
                value={age}
                className="form-input readonly"
                readOnly
              />
            </div>

            <div className="form-field">
              <label htmlFor="client-adjusted-age">
                Adjusted Age <span className="helper-text">(If premature, optional)</span>
              </label>
              <input
                id="client-adjusted-age"
                type="text"
                value={data.adjustedAge || ""}
                onChange={(e) => updateData({ ...data, adjustedAge: e.target.value })}
                placeholder="e.g., 10 months, 2 days"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Referral Information */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Building size={18} />
            Referral & Evaluation Details
          </h4>

          <div className="form-field">
            <SmartField
              label="Referring Organization"
              value={data.referringOrg || ""}
              onChange={(val) => updateData({ ...data, referringOrg: val })}
              placeholder="e.g., Eastern Los Angeles Regional Center (ELARC)"
              fieldName="referringOrg"
              category="clientInformation"
              clientAge={ageInMonths}
            />
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="client-eval-location">
                Evaluation Location <span className="required">*</span>
              </label>
              <select
                id="client-eval-location"
                value={data.evaluationLocation || ""}
                onChange={(e) => updateData({ ...data, evaluationLocation: e.target.value })}
                className="form-input"
              >
                <option value="">Select...</option>
                <option value="in_home">In child's home</option>
                <option value="in_person">In person (office)</option>
                <option value="other">Online</option>
              </select>
            </div>

            <div className="form-field">
              <SmartField
                label="Evaluation language"
                value={data.evaluationLanguage || ""}
                onChange={(val) => updateData({ ...data, evaluationLanguage: val })}
                placeholder="Language used during evaluation"
                fieldName="evaluationLanguage"
                category="clientInformation"
                clientAge={ageInMonths}
              />
            </div>
          </div>

          <div className="form-row-2">
          <div className="form-field">
            <label>Informants Present</label>
            <div className="checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={data.informants?.includes('mother')}
                  onChange={(e) => {
                    const current = data.informants || [];
                    updateData({
                      ...data,
                      informants: e.target.checked 
                        ? [...current, 'mother']
                        : current.filter(i => i !== 'mother')
                    });
                  }}
                />
                Mother
              </label>
              <label>
                <input 
                  type="checkbox"
                  checked={data.informants?.includes('father')}
                  onChange={(e) => {
                    const current = data.informants || [];
                    updateData({
                      ...data,
                      informants: e.target.checked 
                        ? [...current, 'father']
                        : current.filter(i => i !== 'father')
                    });
                  }}
                />
                Father
              </label>
              <label>
                <input 
                  type="checkbox"
                  checked={data.informants?.includes('grandparent')}
                  onChange={(e) => {
                    const current = data.informants || [];
                    updateData({
                      ...data,
                      informants: e.target.checked 
                        ? [...current, 'grandparent']
                        : current.filter(i => i !== 'grandparent')
                    });
                  }}
                />
                Grandparent
              </label>
               <label>
                <input 
                  type="checkbox"
                  checked={data.informants?.includes('guardian')}
                  onChange={(e) => {
                    const current = data.informants || [];
                    updateData({
                      ...data,
                      informants: e.target.checked 
                        ? [...current, 'guardian']
                        : current.filter(i => i !== 'guardian')
                    });
                  }}
                />
                Guardian
              </label>
            </div>
          </div>

          <div className="form-field">
            <SmartField
              label="Language(s) Spoken in Home"
              value={data.languagesHome || ""}
              onChange={(val) => updateData({ ...data, languagesHome: val })}
              placeholder="e.g., English, Spanish, etc."
              fieldName="languagesHome"
              category="clientInformation"
              clientAge={ageInMonths}
            />
          </div>
        </div>
      </div>
      </div>

      <div className="completion-indicator">
        <div className="completion-bar">
          <div 
            className="completion-fill" 
            style={{ 
              width: `${
                (Object.values(data).filter(v => v && v !== '' && v !== null && (!Array.isArray(v) || v.length > 0)).length / 10) * 100
              }%` 
            }}
          />
        </div>
        <p className="completion-text">
          {Object.values(data).filter(v => v && v !== '' && v !== null && (!Array.isArray(v) || v.length > 0)).length} of 10 key fields completed
        </p>
      </div>
    </div>
  );
}