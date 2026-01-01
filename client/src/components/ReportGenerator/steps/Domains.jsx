import { useState, useEffect } from "react";
import DomainTabs from "../DomainTabs";
import DomainSelector from "../DomainSelector";
import useFetchJson from "../../../hooks/useFetchJson";

export default function Domains({ data, updateData }) {
  const [currentDomain, setCurrentDomain] = useState("");
  const [domainEntries, setDomainEntries] = useState(data.domainEntries || []);
  const [successfulBehaviors, setSuccessfulBehaviors] = useState([]);
  const [unsuccessfulBehaviors, setUnsuccessfulBehaviors] = useState([]);
  const [error, setError] = useState("");

  // Fetch domain JSON internally
  const { data: sentenceOptions, loading, error: sentencesError } = useFetchJson("/bayley.json");

  useEffect(() => {
    if (!currentDomain || !sentenceOptions[currentDomain]?.sentences) return;

    const combinedSentences = [
      ...successfulBehaviors.map((s) => ({ text: s.value, did: true })),
      ...unsuccessfulBehaviors.map((s) => ({ text: s.value, did: false })),
    ];

    const existingIndex = domainEntries.findIndex(
      (entry) => entry.domain === currentDomain
    );

    const description = sentenceOptions[currentDomain]?.description || "";

    if (existingIndex !== -1) {
      const updatedEntries = [...domainEntries];
      updatedEntries[existingIndex] = {
        domain: currentDomain,
        sentences: combinedSentences,
        description,
      };
      setDomainEntries(updatedEntries);
    } else if (currentDomain) {
      setDomainEntries([
        ...domainEntries,
        { domain: currentDomain, sentences: [], description },
      ]);
    }
  }, [successfulBehaviors, unsuccessfulBehaviors, currentDomain, sentenceOptions]);


  useEffect(() => {
    return () => {
      updateData({ ...data, domainEntries });
    };
  }, [domainEntries]);

  if (loading) return <p>Loading domain data...</p>;
  if (sentencesError) return <p style={{ color: "red" }}>Error loading domains: {sentencesError}</p>;

  return (
    <div>
      <h3>Domains</h3>
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
        sentenceOptions={sentenceOptions} // internal
        domainEntries={domainEntries}
        setDomainEntries={setDomainEntries}
        successfulBehaviors={successfulBehaviors}
        setSuccessfulBehaviors={setSuccessfulBehaviors}
        unsuccessfulBehaviors={unsuccessfulBehaviors}
        setUnsuccessfulBehaviors={setUnsuccessfulBehaviors}
        setError={setError}
      />
    </div>
  );
}
