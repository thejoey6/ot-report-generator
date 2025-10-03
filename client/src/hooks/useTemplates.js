import { useState, useEffect, useContext } from "react";
import { AuthContext } from '../AuthContext';

const useTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken, fetchAccessToken } = useContext(AuthContext);
  const token = accessToken;

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {

      const res = await fetch("/api/templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch templates");
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {templates, fetchTemplates};
};

export default useTemplates;
