import React, { useEffect, useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

function ReportGenerator() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [sentences, setSentences] = useState([""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:4000/api/templates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        setError("Failed to load templates");
      }
    };
    fetchTemplates();
  }, []);

  const fetchDocxBuffer = async (templateId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:4000/api/templates/${templateId}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to download template");
    return await res.arrayBuffer();
  };

  const handleGenerate = async () => {
    setError("");
    if (!selectedTemplateId) {
      setError("Please select a template.");
      return;
    }

    const cleanSentences = sentences.map((s) => s.trim()).filter(Boolean);
    if (cleanSentences.length === 0) {
      setError("Please enter at least one sentence.");
      return;
    }

    try {
      setLoading(true);
      const buffer = await fetchDocxBuffer(selectedTemplateId);
      const zip = new PizZip(buffer);
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

      // Build a data object like { sentence1: "...", sentence2: "..." }
      const data = {};
      cleanSentences.forEach((s, i) => {
        data[`sentence${i + 1}`] = s;
      });

      doc.render(data);

      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      saveAs(blob, "generated-document.docx");
    } catch (err) {
      console.error(err);
      setError("Failed to generate document: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSentence = (i, value) => {
    const newSentences = [...sentences];
    newSentences[i] = value;
    setSentences(newSentences);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Generate Document from Template</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <label>
        Select Template:
        <select
          value={selectedTemplateId || ""}
          onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
        >
          <option value="">-- Choose a template --</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <h4>Enter Sentences (up to 6):</h4>
      {[...Array(6)].map((_, i) => (
        <div key={i}>
          <input
            type="text"
            placeholder={`Sentence ${i + 1}`}
            value={sentences[i] || ""}
            onChange={(e) => updateSentence(i, e.target.value)}
            style={{ width: "100%", marginBottom: "8px" }}
          />
        </div>
      ))}

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Document"}
      </button>
    </div>
  );
}

export default ReportGenerator;
