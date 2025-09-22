import { useLocation } from "react-router-dom";
import React, { useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import DomainTabs from '../components/ReportGenerator/DomainTabs'
import DomainSelector from "../components/ReportGenerator/DomainSelector";
import useFetchJson from "../hooks/useFetchJson";
import groupAndFormatSentences from "../utils/textUtils";


function ReportGenerator() {
  const [currentDomain, setCurrentDomain] = useState("");
  const [domainEntries, setDomainEntries] = useState([]);

  const [successfulBehaviors, setSuccessfulBehaviors] = useState([]);
  const [unsuccessfulBehaviors, setUnsuccessfulBehaviors] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const { reportName, selectedTemplateId } = location.state || {};
  const { data: sentenceOptions, loading: sentencesLoading, error: sentencesError } = useFetchJson("/bayley.json");

  // Obtain template file
  const fetchDocxBuffer = async (templateId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:4000/api/templates/${templateId}/download`,
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

    if (domainEntries.length === 0) {
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
      });

      const data = {
        entries: groupAndFormatSentences(domainEntries),
      };

      doc.render(data);

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

  // Prevent error from calling .map
  if (sentencesLoading) return <p>Loading sentences...</p>;
  if (sentencesError) return <p>Error loading sentences: {sentencesError}</p>;

  return (
    <div className="container">
      <div style={{ maxWidth: 800, margin: "auto" }}>

        <h2>Generate Document from Template</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <DomainTabs
          domainEntries={domainEntries}
          currentDomain={currentDomain}
          setCurrentDomain={setCurrentDomain}
          setSuccessfulBehaviors={setSuccessfulBehaviors}
          setUnsuccessfulBehaviors={setUnsuccessfulBehaviors}
          setDomainEntries={setDomainEntries}
        />

        <DomainSelector
          currentDomain={currentDomain}
          setCurrentDomain={setCurrentDomain}
          sentenceOptions={sentenceOptions}
          domainEntries={domainEntries}
          setDomainEntries={setDomainEntries}
          successfulBehaviors={successfulBehaviors}
          setSuccessfulBehaviors={setSuccessfulBehaviors}
          unsuccessfulBehaviors={unsuccessfulBehaviors}
          setUnsuccessfulBehaviors={setUnsuccessfulBehaviors}
          setError={setError}
        />

        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Document"}
        </button>

      </div>
    </div>
  );
}

export default ReportGenerator;
