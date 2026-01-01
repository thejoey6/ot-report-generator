import { useLocation } from "react-router-dom";
import React, { useState, useContext, useEffect } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { FileText, Eye } from 'lucide-react';
import groupAndFormatSentences from "../utils/textUtils";
import { AuthContext } from '../AuthContext';
import { reportSteps } from "../components/ReportGenerator/ReportSteps";
import ReportLayout from "../components/ReportGenerator/ReportLayout";
import { useSuggestionLearning } from '../hooks/useSuggestionLearning';
import Header from "../components/Header";
import './reportGenerator.css';

function ReportGenerator() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const { accessToken: token, fetchAccessToken } = useContext(AuthContext);
  
  // from dashboard modal
  const { reportName, selectedTemplateId } = location.state || {};

  // Load saved data from sessionStorage or initialize default (step 0 and empty form)
  const storageDataKey = `reportData_${selectedTemplateId || "default"}_${reportName || "temp"}`;
  const storageStepKey = `reportStep_${selectedTemplateId || "default"}_${reportName || "temp"}`;

  const savedReportData = sessionStorage.getItem(storageDataKey);
  const savedStep = sessionStorage.getItem(storageStepKey);

  const [currentStep, setCurrentStep] = useState( savedStep ? parseInt(savedStep, 10) : 0 );

  // Learning and Suggestions
  const { learnFromSubmission } = useSuggestionLearning();

  const [reportData, setReportData] = useState(
    savedReportData
      ? JSON.parse(savedReportData)
      : {
          clientInformation: {},
          backgroundInformation: {},
          birthHistory: {},
          clinicalObservations: {},
          domains: { domainEntries: [] },
          feedingAndSensory: {},
          summary: {},
        }
  );

  const totalSteps = reportSteps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const StepComponent = reportSteps[currentStep].component;

  // Temporary save to sessionStorage when global data (or cur step) updates
  useEffect(() => {
    sessionStorage.setItem(storageDataKey, JSON.stringify(reportData));
    sessionStorage.setItem(storageStepKey, currentStep);
  }, [reportData, currentStep]);

  const goNext = async () => {
    const currentStepKey = reportSteps[currentStep].key;
    
    await learnFromSubmission(reportData[currentStepKey], currentStepKey);
    
    if (!isLast) setCurrentStep(currentStep + 1);
  };

  const goPrev = () => {
    if (!isFirst) setCurrentStep(currentStep - 1);
  };

  // Obtain template file
  const fetchDocxBuffer = async (templateId) => {
    const res = await fetch(
      `/api/templates/${templateId}/download`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Failed to download template");
    return await res.arrayBuffer();
  };

  // Load into template & Download
  const handleGenerate = async () => {
    setError("");

    if (!selectedTemplateId) {
      setError("Please select a template.");
      return;
    }

    const currentStepKey = reportSteps[currentStep].key;
    await learnFromSubmission(reportData[currentStepKey], currentStepKey);

    const cleanedDomainEntries = (reportData.domains?.domainEntries || []).filter((entry) => entry.domain !== "New Tab");

    if (cleanedDomainEntries.length === 0) {
      setError("Please add at least one domain with sentence selections.");
      return;
    }

    try {
      setLoading(true);
      const buffer = await fetchDocxBuffer(selectedTemplateId);
      const zip = new PizZip(buffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: () => "",
      });

      const formattedEntries = groupAndFormatSentences(cleanedDomainEntries);

      // Merge all report data for template rendering
      const templateData = {
        ...reportData,
        entries: formattedEntries,
      };

      doc.render(templateData);

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const safeFileName = reportName.trim() || "generated-document";
      saveAs(blob, `${safeFileName}.docx`);

    } catch (err) {
      console.error(err);
      setError("Failed to generate document: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-generator">
      <Header />
      
      <ReportLayout
        title={reportSteps[currentStep].title}
        onNext={goNext}
        onPrev={goPrev}
        prevStepTitle={currentStep > 0 ? reportSteps[currentStep - 1].title : ""}
        nextStepTitle={currentStep < totalSteps - 1 ? reportSteps[currentStep + 1].title : ""}
        isFirst={isFirst}
        isLast={isLast}
        onFinish={handleGenerate}
        loading={loading}
        error={error}
      >
        <StepComponent
          data={reportData[reportSteps[currentStep].key]}
          updateData={(newData) =>
            setReportData({ ...reportData, [reportSteps[currentStep].key]: newData })
          }
          clientInformation={reportData.clientInformation}
        />
      </ReportLayout>

      {/* Report Preview Section */}
      <div className="report-preview-section">
        <h2>
          <Eye size={24} style={{ color: '#95D5B2' }} />
          Report Progress
        </h2>
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
          Review your completed sections before generating the final document
        </p>
        
        <div className="preview-grid">
          <div className={`preview-card ${reportData.clientInformation?.name ? '' : 'empty'}`}>
            <h4>Client Name</h4>
            <p>{reportData.clientInformation?.name || 'Not entered'}</p>
          </div>
          
          <div className={`preview-card ${reportData.clientInformation?.age ? '' : 'empty'}`}>
            <h4>Age</h4>
            <p>{reportData.clientInformation?.age || 'Not calculated'}</p>
          </div>
          
          <div className={`preview-card ${reportData.clientInformation?.evaluationDate ? '' : 'empty'}`}>
            <h4>Evaluation Date</h4>
            <p>{reportData.clientInformation?.evaluationDate || 'Not set'}</p>
          </div>
          
          <div className={`preview-card ${reportData.domains?.domainEntries?.filter(e => e.domain !== 'New Tab').length > 0 ? '' : 'empty'}`}>
            <h4>Domains Completed</h4>
            <p>
              {reportData.domains?.domainEntries?.filter(e => e.domain !== 'New Tab').length || 0} domains
            </p>
            {reportData.domains?.domainEntries?.filter(e => e.domain !== 'New Tab').length > 0 && (
              <div className="preview-domains">
                {reportData.domains.domainEntries
                  .filter(e => e.domain !== 'New Tab')
                  .map((entry, idx) => (
                    <span key={idx} className="domain-badge">
                      {entry.domain}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportGenerator;