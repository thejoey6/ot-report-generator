import React, { useEffect, useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import Select from "react-select";

function ReportGenerator() {
  const [templates, setTemplates] = useState([]);
  const [reportName, setReportName] = useState("");

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [sentenceOptions, setSentenceOptions] = useState({});

  const [currentDomain, setCurrentDomain] = useState("");
  const [domainEntries, setDomainEntries] = useState([]);

  const [successfulBehaviors, setSuccessfulBehaviors] = useState([]);
  const [unsuccessfulBehaviors, setUnsuccessfulBehaviors] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // Fetch available templates
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


  // Fetch sentence/domain JSON (e.g. bayley.json)
  useEffect(() => {
    const fetchSentences = async () => {
      try {
        const res = await fetch("/bayley.json");
        const data = await res.json();
        setSentenceOptions(data);
      } catch (err) {
        setError("Failed to load sentence options");
      }
    };
    fetchSentences();
  }, []);


  const getSentenceOptions = (alreadySelected = []) => {
    if (!currentDomain || !sentenceOptions[currentDomain]) return [];

    const domainSentences = sentenceOptions[currentDomain];

    return Object.entries(domainSentences).map(([num, text]) => ({
      label: `${num}. ${text}`,
      value: text,
    }))
    .filter(
      (option) => !alreadySelected.some((selected) => selected.value === option.value)
    );
  };


  const joinClauses = (clauses, conjunction = "and") => {
    if (clauses.length === 0) return "";
    if (clauses.length === 1) return clauses[0];
    if (clauses.length === 2) return `${clauses[0]} ${conjunction} ${clauses[1]}`;

    const delimiter = clauses.some(clause => clause.includes(",")) ? "; " : ", ";
    const allButLast = clauses.slice(0, -1).join(delimiter);
    const last = clauses[clauses.length - 1];
    
    return `${allButLast}${delimiter}${conjunction} ${last}`;
  };


  const groupAndFormatSentences = () => {
    return domainEntries.map(({ domain, sentences }) => {
      const positives = sentences.filter((e) => e.did).map((e) => e.text);
      const negatives = sentences.filter((e) => !e.did).map((e) => e.text);

      const pos = positives.length
        ? `Child is able to ${joinClauses(positives)}.`
        : "";
      const neg = negatives.length
        ? `Child is unable to ${joinClauses(negatives, "or")}.`
        : "";

      return {
        domain,
        text: [pos, neg].filter(Boolean).join(" "),
      };
    });
  };


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
        entries: groupAndFormatSentences(),
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


    const handleAddDomain = () => {
        if (!currentDomain) {
            setError("Please select a domain first.");
        return;
        }

        if (successfulBehaviors.length === 0 && unsuccessfulBehaviors.length === 0) {
            setError("Please select at least one behavior.");
        return;
        }

        if (domainEntries.some((entry) => entry.domain === currentDomain)) {
            setError("This domain has already been added.");
        return;
        }

        const combinedSentences = [
            ...successfulBehaviors.map((s) => ({ text: s.value, did: true })),
            ...unsuccessfulBehaviors.map((s) => ({ text: s.value, did: false })),
        ];

        setDomainEntries([
            ...domainEntries,
        {
            domain: currentDomain,
            sentences: combinedSentences,
        },
        ]);

        // Reset
        setCurrentDomain("");
        setSuccessfulBehaviors([]);
        setUnsuccessfulBehaviors([]);
        setError("");
};


  return (
    <div className="container">
      <div style={{ maxWidth: 800, margin: "auto" }}>
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
        <hr />

    <div style={{ marginTop: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Report Name:
        </label>
        <input
            type="text"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Enter report name"
            style={{
                padding: "5px",
                width: "100%",
                boxSizing: "border-box"
         }}/>
    </div>

        <h4>Select Domain</h4>
        <select
          value={currentDomain}
          onChange={(e) => {
            setCurrentDomain(e.target.value);
            setSuccessfulBehaviors([]);
            setUnsuccessfulBehaviors([]);
            setError("");
          }}
          style={{ width: "100%", marginBottom: "1rem" }}
        >
          <option value="">-- Choose a domain --</option>
          {Object.keys(sentenceOptions).map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>

    <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
            Successful Behaviors
        </label>
        <Select
         isMulti
         isDisabled={!currentDomain}
         closeMenuOnSelect={successfulBehaviors.length >= 2} 
         options={getSentenceOptions(unsuccessfulBehaviors)}
         value={successfulBehaviors}
         onChange={(selectedOptions) => setSuccessfulBehaviors(selectedOptions)}
         placeholder="Type to search or select successful behaviors..."
        />
    </div>

    <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
            Unsuccessful Behaviors
        </label>
        <Select
         isMulti
         isDisabled={!currentDomain}
         closeMenuOnSelect={unsuccessfulBehaviors.length >= 2} 
         options={getSentenceOptions(successfulBehaviors)}
         value={unsuccessfulBehaviors}
         onChange={(selectedOptions) => setUnsuccessfulBehaviors(selectedOptions)}
         placeholder="Type to search or select unsuccessful behaviors..."
        />
    </div>

        <button onClick={handleAddDomain} style={{ marginBottom: "20px" }}>
          Add Domain
        </button>


{domainEntries.length > 0 && (
  <>
    <h4>Added Domains</h4>
    <ul>
      {domainEntries.map((entry, idx) => (
        <li key={idx} style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <strong>{entry.domain}</strong> — {entry.sentences.length} sentences
          <button
            style={{
              fontSize: "0.8rem",
              padding: "2px 6px",
              cursor: "pointer",
              borderRadius: "4px",
              border: "1px solid #888",
              backgroundColor: "#cce5ff",
              color: "#004085"              // dark blue text
            }}
            onClick={() => {
              setCurrentDomain(entry.domain);
              setSuccessfulBehaviors(entry.sentences.filter(s => s.did).map(s => ({ label: s.text, value: s.text })));
              setUnsuccessfulBehaviors(entry.sentences.filter(s => !s.did).map(s => ({ label: s.text, value: s.text })));
              setDomainEntries(domainEntries.filter((_, i) => i !== idx));
            }}
          >
            Edit
          </button>
          <button
            style={{
              fontSize: "0.8rem",
              padding: "2px 6px",
              cursor: "pointer",
              borderRadius: "4px",
              border: "1px solid #e00",
              backgroundColor: "#ffe5e5",
              color: "#e00"
            }}
            onClick={() => setDomainEntries(domainEntries.filter((_, i) => i !== idx))}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  </>
)}

        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Document"}
        </button>
      </div>
    </div>
  );
}

export default ReportGenerator;
