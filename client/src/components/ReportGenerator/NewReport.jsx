import React, { useState } from "react";

export default function NewReport({ templates, onClose, navigate }) {
  const [reportName, setReportName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reportName || !selectedTemplateId) {
      setError("Please enter a report name and select a template");
      return;
    }
 
    onClose();  //close modal
    navigate("/generate", { state: { reportName, selectedTemplateId: selectedTemplateId } });
  };

  return (
    <div>
        <h2>Create New Report</h2>
         {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Name  */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
          Report Name:
        </label>
        <input
          type="text"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          placeholder="Enter report name"
          style={{ width: "100%", padding: "5px", boxSizing: "border-box" }}
        />
      </div>

      {/* Template Selector */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
          Select Template:
        </label>
        <select
          value={selectedTemplateId || ""}
          onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
          style={{ width: "100%", padding: "5px" }}
        >
          <option value="">-- Choose a template --</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <button onClick={handleSubmit} style={{ padding: "8px 12px" }}>Continue</button>
    </div>
  );
}
