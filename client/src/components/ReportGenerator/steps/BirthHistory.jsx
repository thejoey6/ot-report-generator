import { useEffect, useState } from "react";
import { Hospital, User, Heart, FileText, Stethoscope, Plus, X } from 'lucide-react';
import SmartField from '../SmartField';

export default function BirthHistory({ data, updateData, clientInformation }) {
  const [form, setForm] = useState(() => {
    if (data && Object.keys(data).length > 0) {
      return data;
    }

    return {
      gestationalAge: "",
      gestationalWeeks: "",
      deliveryType: "",
      hospital: "",
      birthWeightLbs: "",
      birthWeightOz: "",
      birthLength: "",
      lengthNotRecalled: false,
      deliveryComments: "",
      showDeliveryComments: false,
      motherAge: "",
      gravida: "",
      para: "",
      prenatalComplications: [],
      maternalComments: "",
      showMaternalComments: false,
      nicuAdmitted: "",
      nicuDuration: "",
      nicuDurationUnit: "days",
      nicuInterventions: [],
      brainUltrasound: "",
      nicuComments: "",
      showNicuComments: false,
      pkuScreening: "",
      hearingScreening: "",
      dischargeDuration: "",
      dischargeDurationUnit: "days",
      screeningComments: "",
      showScreeningComments: false,
    };
  });

  const [generatedText, setGeneratedText] = useState("");

  const pronouns =
    clientInformation?.gender === "boy"
      ? { subj: "he", poss: "his", obj: "him", possAdj: "his" }
      : { subj: "she", poss: "her", obj: "her", possAdj: "her" };

  const handleChange = (key, value) => {
    const newForm = { ...form, [key]: value };
    setForm(newForm);
    updateData(newForm);
  };

  const handleCheckbox = (key, value) => {
    const current = form[key] || [];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleChange(key, newValue);
  };

  const capitalizeSentences = (text) => {
    return text.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, match =>
      match.toUpperCase()
    );
  };

  // Generate narrative preview
  useEffect(() => {
    const sentences = [];
    const name = clientInformation?.name || "[Child name]";
    const age = clientInformation?.age || "[age]";
    const adjustedAge = clientInformation?.adjustedAge;
    const gender = clientInformation?.gender === "boy" ? "boy" : "girl";

    // Opening sentence
    let opening = `${name} is a ${age} old little ${gender}`;
    if (adjustedAge && adjustedAge !== "N/A") {
      opening += ` (adjusted age ${adjustedAge})`;
    }
    
    if (form.gestationalAge === "premature" && form.gestationalWeeks) {
      opening += ` born at ${form.gestationalWeeks} weeks gestation`;
    } else if (form.gestationalAge === "full_term") {
      opening += ` with no known diagnosis. ${pronouns.subj} was born full term`;
    }
    
    if (form.deliveryType) {
      opening += ` via ${form.deliveryType}`;
    }
    
    if (form.hospital) {
      opening += ` at ${form.hospital}`;
    }
    opening += ".";
    sentences.push(opening);

    // Birth measurements
    if (form.birthWeightLbs || form.birthWeightOz) {
      const weightStr = `${pronouns.subj} weighed ${form.birthWeightLbs || "0"} pounds${form.birthWeightOz ? ", " + form.birthWeightOz + " ounces" : ""}.`;
      sentences.push(weightStr);
    }
    
    if (form.birthLength && !form.lengthNotRecalled) {
      sentences.push(`${pronouns.poss} length was ${form.birthLength} inches.`);
    } else {
      sentences.push(`${pronouns.poss} length was not recalled.`);
      if (form.birthLength) {
        handleChange("birthLength", "")
      }
    }

    if (form.deliveryComments) {
      sentences.push(form.deliveryComments);
    }

    // Maternal info
    if (form.motherAge && form.gravida && form.para) {
      sentences.push(`ms. [Mother surname] was a ${form.motherAge}-year-old G${form.gravida}P${form.para} female at the time of delivery.`);
    }

    // Prenatal complications
    if (form.prenatalComplications && form.prenatalComplications.length > 0 && !form.prenatalComplications.includes('none')) {
      const complications = form.prenatalComplications.join(", ");
      sentences.push(`prenatal complications included ${complications}.`);
    }

    if (form.maternalComments) {
      sentences.push(form.maternalComments);
    }

    // NICU
    if (form.nicuAdmitted === "yes") {
      let nicuSentence = `${name} was transferred to the NICU`;
      if (form.nicuInterventions && form.nicuInterventions.length > 0) {
        const interventions = form.nicuInterventions.join(", ");
        nicuSentence += ` where ${pronouns.possAdj} care included ${interventions}`;
      }
      if (form.brainUltrasound && form.brainUltrasound !== "not_performed") {
        nicuSentence += `, ultrasound of the brain with ${form.brainUltrasound === "normal" ? "normal results" : form.brainUltrasound}`;
      }
      nicuSentence += ".";
      sentences.push(nicuSentence);
    }

    if (form.nicuComments) {
      sentences.push(form.nicuComments);
    }

    // PKU screening
    if (form.pkuScreening) {
      let pkuText = "parents reported that ";
      if (form.pkuScreening === "passed") {
        pkuText += `${name} passed the newborn PKU screening.`;
      } else if (form.pkuScreening === "failed_then_passed") {
        pkuText += `${name} initially failed the newborn PKU screening, but then passed on the second attempt.`;
      }
      sentences.push(pkuText);
    }

    // Hearing screening
    if (form.hearingScreening) {
      const hearingMap = {
        passed: "passed",
        failed: "failed",
        not_completed: "did not complete"
      };
      sentences.push(`${pronouns.subj} ${hearingMap[form.hearingScreening] || form.hearingScreening} ${pronouns.possAdj} newborn hearing screening.`);
    }

    // Discharge
    if (form.dischargeDuration && form.dischargeDurationUnit) {
      sentences.push(`${pronouns.subj} was discharged home after ${form.dischargeDuration} ${form.dischargeDurationUnit}.`);
    }

    if (form.screeningComments) {
      sentences.push(form.screeningComments);
    }

    setGeneratedText(capitalizeSentences(sentences.join(" ")));
  }, [form, clientInformation]);


  return (
    <div className="step-form">
      <div className="form-section-group">
        {/* Delivery & Birth Details (COMBINED) */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Hospital size={18} />
            Delivery & Birth Details
          </h4>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="gestational-age">
                Gestational Age <span className="required">*</span>
              </label>
              <select
                id="gestational-age"
                value={form.gestationalAge}
                onChange={(e) => handleChange("gestationalAge", e.target.value)}
                className="form-input"
              >
                <option value="">Select...</option>
                <option value="full_term">Full term (37-42 weeks)</option>
                <option value="premature">Premature</option>
              </select>
            </div>

            {form.gestationalAge === "premature" && (
              <div className="form-field">
                <label htmlFor="gestational-weeks">
                  Weeks Gestation <span className="required">*</span>
                </label>
                <input
                  id="gestational-weeks"
                  type="number"
                  min="20"
                  max="36"
                  value={form.gestationalWeeks}
                  onChange={(e) => handleChange("gestationalWeeks", e.target.value)}
                  placeholder="e.g., 28"
                  className="form-input"
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="delivery-type">
                Delivery Type <span className="required">*</span>
              </label>
              <select
                id="delivery-type"
                value={form.deliveryType}
                onChange={(e) => handleChange("deliveryType", e.target.value)}
                className="form-input"
              >
                <option value="">Select...</option>
                <option value="vaginal delivery">Vaginal delivery</option>
                <option value="cesarean delivery">Cesarean delivery</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <SmartField
              label="Hospital/Location"
              value={form.hospital}
              onChange={(val) => handleChange("hospital", val)}
              placeholder="e.g., PIH Health Hospital"
              fieldName="hospital"
              category="birthHistory"
              clientAge={clientInformation?.ageInMonths}
            />
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>
                Birth Weight
              </label>
              <div className="inline-number-group">
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={form.birthWeightLbs}
                  onChange={(e) => handleChange("birthWeightLbs", e.target.value)}
                  placeholder="lbs"
                  className="form-input inline-number-input-small"
                />
                <span>pounds</span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={form.birthWeightOz}
                  onChange={(e) => handleChange("birthWeightOz", e.target.value)}
                  placeholder="oz"
                  className="form-input inline-number-input-small"
                />
                <span>ounces</span>
              </div>
            </div>

            <div className="form-field">
              <label>Birth Length</label>
              <div className="inline-number-group">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={form.birthLength}
                  onChange={(e) => handleChange("birthLength", e.target.value)}
                  placeholder="inches"
                  className="form-input inline-number-input-large"
                  disabled={form.lengthNotRecalled}
                />
                <label style={{ margin: 0, whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={form.lengthNotRecalled}
                    onChange={(e) => handleChange("lengthNotRecalled", e.target.checked)}
                  />
                  Not recalled
                </label>
              </div>
            </div>
          </div>

          {/* Add Comments Button */}
          {!form.showDeliveryComments && (
            <button
              type="button"
              onClick={() => handleChange("showDeliveryComments", true)}
              className="add-notes-button"
            >
              <Plus size={14} />
              Add notes
            </button>
          )}

          {form.showDeliveryComments && (
            <div className="form-field comments-field-wrapper">
              <div className="comments-field-header">
                <label htmlFor="delivery-comments">Additional Notes</label>
                <button
                  type="button"
                  onClick={() => {
                    handleChange("deliveryComments", "");
                    handleChange("showDeliveryComments", false);
                  }}
                  className="close-comments-button"
                >
                  <X size={16} />
                </button>
              </div>
              <textarea
                id="delivery-comments"
                value={form.deliveryComments}
                onChange={(e) => handleChange("deliveryComments", e.target.value)}
                placeholder="Any additional delivery or birth details..."
                rows={2}
                className="form-textarea"
              />
            </div>
          )}
        </div>

        {/* Maternal Information */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <User size={18} />
            Maternal Information
          </h4>

          <div className="form-row-2">
            <div className="form-field">
              <label htmlFor="mother-age">Mother's Age at Delivery</label>
              <input
                id="mother-age"
                type="number"
                min="10"
                max="60"
                value={form.motherAge}
                onChange={(e) => handleChange("motherAge", e.target.value)}
                placeholder="e.g., 33"
                className="form-input inline-number-input-large"
              />
            </div>

            <div className="form-field">
              <label>Gravida/Para</label>
              <div className="inline-number-group">
                <span>G</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.gravida}
                  onChange={(e) => handleChange("gravida", e.target.value)}
                  className="form-input inline-number-input-small"
                />
                <span>P</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={form.para}
                  onChange={(e) => handleChange("para", e.target.value)}
                  className="form-input inline-number-input-small"
                />
              </div>
              <span className="helper-text">Auto-formats as "G2P2 female"</span>
            </div>

           <div className="form-field">
            <label>Prenatal Complications</label>
            <div className="checkbox-group checkbox-grid-2col">
              <label>
                <input
                  type="checkbox"
                  checked={form.prenatalComplications?.includes('none')}
                  onChange={() => handleCheckbox('prenatalComplications', 'none')}
                />
                None
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.prenatalComplications?.includes('elevated blood pressure')}
                  onChange={() => handleCheckbox('prenatalComplications', 'elevated blood pressure')}
                />
                Elevated blood pressure
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.prenatalComplications?.includes('preeclampsia')}
                  onChange={() => handleCheckbox('prenatalComplications', 'preeclampsia')}
                />
                Preeclampsia
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.prenatalComplications?.includes('bleeding')}
                  onChange={() => handleCheckbox('prenatalComplications', 'bleeding')}
                />
                Bleeding
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.prenatalComplications?.includes('gestational diabetes')}
                  onChange={() => handleCheckbox('prenatalComplications', 'gestational diabetes')}
                />
                Gestational diabetes
              </label>
            </div>
          </div>
         </div>

          {!form.showMaternalComments && (
            <button
              type="button"
              onClick={() => handleChange("showMaternalComments", true)}
              className="add-notes-button"
            >
              <Plus size={14} />
              Add notes
            </button>
          )}

          {form.showMaternalComments && (
            <div className="form-field comments-field-wrapper">
              <div className="comments-field-header">
                <label htmlFor="maternal-comments">Additional Notes</label>
                <button
                  type="button"
                  onClick={() => {
                    handleChange("maternalComments", "");
                    handleChange("showMaternalComments", false);
                  }}
                  className="close-comments-button"
                >
                  <X size={16} />
                </button>
              </div>
              <textarea
                id="maternal-comments"
                value={form.maternalComments}
                onChange={(e) => handleChange("maternalComments", e.target.value)}
                placeholder="Any additional maternal information..."
                rows={2}
                className="form-textarea"
              />
            </div>
          )}
        </div>

        {/* NICU Care */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Stethoscope size={18} />
            NICU Care
          </h4>

          <div className="form-field">
            <label>
              NICU Admission <span className="required">*</span>
            </label>
            <div className="radio-group radio-group-horizontal">
              <label>
                <input
                  type="radio"
                  name="nicu"
                  checked={form.nicuAdmitted === "no"}
                  onChange={() => handleChange("nicuAdmitted", "no")}
                />
                No
              </label>
              <label>
                <input
                  type="radio"
                  name="nicu"
                  checked={form.nicuAdmitted === "yes"}
                  onChange={() => handleChange("nicuAdmitted", "yes")}
                />
                Yes
              </label>
            </div>
          </div>

          {form.nicuAdmitted === "yes" && (
            <>
              <div className="form-field">
                <label>Duration in NICU</label>
                <div className="inline-number-group">
                  <input
                    type="number"
                    min="1"
                    value={form.nicuDuration}
                    onChange={(e) => handleChange("nicuDuration", e.target.value)}
                    className="form-input inline-number-input"
                  />
                  <select
                    value={form.nicuDurationUnit}
                    onChange={(e) => handleChange("nicuDurationUnit", e.target.value)}
                    className="form-input inline-select"
                  >
                    <option value="days">days</option>
                    <option value="weeks">weeks</option>
                    <option value="months">months</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>NICU Interventions (select all that apply)</label>
                <div className="checkbox-group checkbox-grid-2col">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.nicuInterventions?.includes('gavage feeding')}
                      onChange={() => handleCheckbox('nicuInterventions', 'gavage feeding')}
                    />
                    Gavage feeding
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.nicuInterventions?.includes('NG tube feeding')}
                      onChange={() => handleCheckbox('nicuInterventions', 'NG tube feeding')}
                    />
                    NG tube feeding
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.nicuInterventions?.includes('O2')}
                      onChange={() => handleCheckbox('nicuInterventions', 'O2')}
                    />
                    O2 support
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.nicuInterventions?.includes('CPAP')}
                      onChange={() => handleCheckbox('nicuInterventions', 'CPAP')}
                    />
                    CPAP
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={form.nicuInterventions?.includes('feeding difficulties')}
                      onChange={() => handleCheckbox('nicuInterventions', 'feeding difficulties')}
                    />
                    Feeding difficulties
                  </label>
                </div>
              </div>

              <div className="form-field">
                <label>Brain Ultrasound</label>
                <div className="radio-group radio-group-vertical">
                  <label>
                    <input
                      type="radio"
                      name="ultrasound"
                      checked={form.brainUltrasound === "not_performed"}
                      onChange={() => handleChange("brainUltrasound", "not_performed")}
                    />
                    Not performed
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="ultrasound"
                      checked={form.brainUltrasound === "normal"}
                      onChange={() => handleChange("brainUltrasound", "normal")}
                    />
                    Normal results
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="ultrasound"
                      checked={form.brainUltrasound === "abnormal"}
                      onChange={() => handleChange("brainUltrasound", "abnormal")}
                    />
                    Abnormal (describe in notes)
                  </label>
                </div>
              </div>
            </>
          )}

          {!form.showNicuComments && form.nicuAdmitted === "yes" && (
            <button
              type="button"
              onClick={() => handleChange("showNicuComments", true)}
              className="add-notes-button"
            >
              <Plus size={14} />
              Add notes
            </button>
          )}

          {form.showNicuComments && (
            <div className="form-field comments-field-wrapper">
              <div className="comments-field-header">
                <label htmlFor="nicu-comments">Additional Notes</label>
                <button
                  type="button"
                  onClick={() => {
                    handleChange("nicuComments", "");
                    handleChange("showNicuComments", false);
                  }}
                  className="close-comments-button"
                >
                  <X size={16} />
                </button>
              </div>
              <textarea
                id="nicu-comments"
                value={form.nicuComments}
                onChange={(e) => handleChange("nicuComments", e.target.value)}
                placeholder="Any additional NICU information..."
                rows={2}
                className="form-textarea"
              />
            </div>
          )}
        </div>

        {/* Newborn Screenings */}
        <div className="form-section">
          <h4 className="section-subtitle">
            <Heart size={18} />
            Newborn Screenings & Discharge
          </h4>

          <div className="form-row-2">
            <div className="form-field">
              <label>PKU Screening</label>
              <div className="radio-group radio-group-vertical">
                <label>
                  <input
                    type="radio"
                    name="pku"
                    checked={form.pkuScreening === "passed"}
                    onChange={() => handleChange("pkuScreening", "passed")}
                  />
                  Passed
                </label>
                <label>
                  <input
                    type="radio"
                    name="pku"
                    checked={form.pkuScreening === "failed_then_passed"}
                    onChange={() => handleChange("pkuScreening", "failed_then_passed")}
                  />
                  Failed initially, passed on 2nd attempt
                </label>
                <label>
                  <input
                    type="radio"
                    name="pku"
                    checked={form.pkuScreening === "not_completed"}
                    onChange={() => handleChange("pkuScreening", "not_completed")}
                  />
                  Not completed
                </label>
              </div>
            </div>

            <div className="form-field">
              <label>Hearing Screening</label>
              <div className="radio-group radio-group-vertical">
                <label>
                  <input
                    type="radio"
                    name="hearing"
                    checked={form.hearingScreening === "passed"}
                    onChange={() => handleChange("hearingScreening", "passed")}
                  />
                  Passed
                </label>
                <label>
                  <input
                    type="radio"
                    name="hearing"
                    checked={form.hearingScreening === "failed"}
                    onChange={() => handleChange("hearingScreening", "failed")}
                  />
                  Failed
                </label>
                <label>
                  <input
                    type="radio"
                    name="hearing"
                    checked={form.hearingScreening === "not_completed"}
                    onChange={() => handleChange("hearingScreening", "not_completed")}
                  />
                  Not completed
                </label>
              </div>
            </div>
          </div>

          <div className="form-field">
            <label>Discharged Home After</label>
            <div className="inline-number-group">
              <input
                type="number"
                min="1"
                value={form.dischargeDuration}
                onChange={(e) => handleChange("dischargeDuration", e.target.value)}
                className="form-input inline-number-input"
              />
              <select
                value={form.dischargeDurationUnit}
                onChange={(e) => handleChange("dischargeDurationUnit", e.target.value)}
                className="form-input inline-select"
              >
                <option value="days">days</option>
                <option value="weeks">weeks</option>
                <option value="months">months</option>
              </select>
            </div>
          </div>

          {!form.showScreeningComments && (
            <button
              type="button"
              onClick={() => handleChange("showScreeningComments", true)}
              className="add-notes-button"
            >
              <Plus size={14} />
              Add notes
            </button>
          )}

          {form.showScreeningComments && (
            <div className="form-field comments-field-wrapper">
              <div className="comments-field-header">
                <label htmlFor="screening-comments">Additional Notes</label>
                <button
                  type="button"
                  onClick={() => {
                    handleChange("screeningComments", "");
                    handleChange("showScreeningComments", false);
                  }}
                  className="close-comments-button"
                >
                  <X size={16} />
                </button>
              </div>
              <textarea
                id="screening-comments"
                value={form.screeningComments}
                onChange={(e) => handleChange("screeningComments", e.target.value)}
                placeholder="Any additional screening or discharge information..."
                rows={2}
                className="form-textarea"
              />
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="preview-section">
        <h4 className="preview-title">
          <FileText size={18} />
          Birth History Preview
        </h4>
        <div className="preview-box">
          <p>{generatedText}</p>
        </div>
      </div>

      {/* Completion Indicator */}
      <div className="completion-indicator">
        <div className="completion-bar">
          <div
            className="completion-fill"
            style={{
              width: `${
                (Object.values(form).filter(v => 
                  v && v !== '' && v !== false && (!Array.isArray(v) || v.length > 0)
                ).length / Object.keys(form).filter(k => !k.startsWith('show')).length) * 100
              }%`
            }}
          />
        </div>
        <p className="completion-text">
          {Object.values(form).filter(v => v && v !== '' && v !== false && (!Array.isArray(v) || v.length > 0)).length} fields completed
        </p>
      </div>
    </div>
  );
}