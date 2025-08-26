import React, { useEffect, useState } from "react";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import Select from "react-select";

function ReportGenerator() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [sentenceOptions, setSentenceOptions] = useState({});
  const [selectedSentences, setSelectedSentences] = useState(
    Array(6).fill({ text: "", did: true })
  );
  const [selectedDomain, setSelectedDomain] = useState("");
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


  // Fetch Sentences JSON
  // This address for sentences (which really should be domains/sentences)
  // Should change based on template chosen. Templates should be linked to json files of domains and test questions
  // Default is bayley and dayc, each with their own file of domains and questions. option for adding new ones can be used later
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

  const updateSelectedSentence = (index, value) => {
    const newSelected = [...selectedSentences];
    newSelected[index] = value;
    setSelectedSentences(newSelected);
  };

  const getSentenceOptions = () => {
    if (!selectedDomain || !sentenceOptions[selectedDomain]) return [];

    const domainSentences = sentenceOptions[selectedDomain];

    return Object.entries(domainSentences).map(([num, text]) => ({
      label: `${num}. ${text}`,
      value: text,
    }));
  };

  // Sentence logic
  const joinClauses = (clauses, conjunction = "and") => {
    if (clauses.length === 0) return "";
    if (clauses.length === 1) return clauses[0];
    if (clauses.length === 2) return `${clauses[0]} ${conjunction} ${clauses[1]}`;
    const allButLast = clauses.slice(0, -1).join(", ");
    const last = clauses[clauses.length - 1];
    return `${allButLast}, ${conjunction} ${last}`;
  };

  const groupAndFormatSentences = () => {
    const grouped = {};

    selectedSentences.forEach((s) => {
      if (!s.text) return;

      const domain = Object.keys(sentenceOptions).find((d) =>
        Object.values(sentenceOptions[d]).includes(s.text)
      );

      if (domain) {
        if (!grouped[domain]) grouped[domain] = [];
        grouped[domain].push(s);
      }
    });

    const formatted = Object.entries(grouped).map(([domain, entries]) => {
      const positives = entries.filter((e) => e.did).map((e) => e.text);
      const negatives = entries.filter((e) => !e.did).map((e) => e.text);

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

    return formatted;
  };
  // End sentence logic

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

    const cleanSentences = selectedSentences.filter((s) => s.text);
    if (cleanSentences.length === 0) {
      setError("Please select at least one sentence.");
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

      saveAs(blob, "generated-document.docx");
    } catch (err) {
      console.error(err);
      setError("Failed to generate document: " + err.message);
    } finally {
      setLoading(false);
    }
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

      <h4>Select Domain</h4>
      <select
        value={selectedDomain}
        onChange={(e) => {
          setSelectedDomain(e.target.value);
          setSelectedSentences(Array(6).fill({ text: "", did: true }));
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

      {[...Array(6)].map((_, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <label>
            <strong>Sentence {index + 1}:</strong>
          </label>
          <Select
            isDisabled={!selectedDomain}
            options={getSentenceOptions()}
            value={
              selectedSentences[index]?.text
                ? {
                    label: selectedSentences[index].text,
                    value: selectedSentences[index].text,
                  }
                : null
            }
            onChange={(selectedOption) =>
              updateSelectedSentence(index, {
                text: selectedOption ? selectedOption.value : "",
                did: selectedSentences[index]?.did ?? true,
              })
            }
            placeholder="Type to search for a sentence..."
          />
          <label style={{ display: "block", marginTop: "8px" }}>
            <input
              type="checkbox"
              checked={selectedSentences[index]?.did ?? true}
              onChange={(e) =>
                updateSelectedSentence(index, {
                  ...selectedSentences[index],
                  did: e.target.checked,
                })
              }
            />{" "}
            Child demonstrated this behavior
          </label>
        </div>
      ))}

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Document"}
      </button>
    </div>
   </div>
  );
}

export default ReportGenerator;
