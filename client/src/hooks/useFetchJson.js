import { useState, useEffect } from "react";

export default function useFetchJson(url, options = {}) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, { ...options, signal });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json = await res.json();
        setData(json || {});
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
          setData({});
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup
    return () => controller.abort();
  }, [url, JSON.stringify(options)]); // re-fetch on url/options change

  return { data, loading, error };
}
