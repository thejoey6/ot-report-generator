import React from "react";
import {useEffect} from "react";
import Select from "react-select";

const DomainSelector = ({
  currentDomain,
  setCurrentDomain,
  sentenceOptions,
  domainEntries,
  setDomainEntries,
  successfulBehaviors,
  setSuccessfulBehaviors,
  unsuccessfulBehaviors,
  setUnsuccessfulBehaviors,
  setError,
}) => {

     // List all behaviors (with number), filter out behaviors that are used by other selection
    const getSentenceOptions = (alreadySelected = []) => {
        if (!currentDomain || !sentenceOptions[currentDomain]) return [];

        const domainSentences = sentenceOptions[currentDomain];

        return Object.entries(domainSentences).map(([num, text]) => ({
            label: `${num}. ${text}`,
            value: text,
            }))
            .filter(
                (option) => !alreadySelected.some((selected) => selected.value === option.value));
        };


        // Auto-save whenever behaviors change
    useEffect(() => {
        if (!currentDomain) return;

        const combinedSentences = [
            ...successfulBehaviors.map((s) => ({ text: s.value, did: true })),
            ...unsuccessfulBehaviors.map((s) => ({ text: s.value, did: false })),
        ];

        const existingIndex = domainEntries.findIndex(
            (entry) => entry.domain === currentDomain
        );

            if (existingIndex !== -1) {
                // Update existing domain
                const updatedEntries = [...domainEntries];
                updatedEntries[existingIndex] = {
                    domain: currentDomain,
                    sentences: combinedSentences,
                };
                setDomainEntries(updatedEntries);
            } else {
                // Add new domain automatically
                setDomainEntries([
                ...domainEntries,
            { domain: currentDomain, sentences: [] },
            ]);
            
        }
    }, [successfulBehaviors, unsuccessfulBehaviors, currentDomain]);


  return (
    <div className="domain-selector">
    <h4>Select Domain</h4>
    <select
        value={currentDomain}
        onChange={(e) => {
            const newDomain = e.target.value;

            // Rename if "new tab"
            setDomainEntries((prev) =>
            prev.map((entry) =>
                entry.domain === "New Tab" ? { ...entry, domain: newDomain } : entry
            )
            );

            setCurrentDomain(newDomain);
            setSuccessfulBehaviors([]);
            setUnsuccessfulBehaviors([]);
            setError("");
        }}
        style={{ width: "100%", marginBottom: "1rem" }}
    >
        <option value="">-- Choose a domain --</option>
            {Object.keys(sentenceOptions || {})
            .filter(
            (domain) =>
                !domainEntries.some((entry) => entry.domain === domain) ||
                domain === currentDomain
            )
            .map((domain) => (
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
 </div>
  );
};

export default DomainSelector;