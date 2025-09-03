import React, { useState } from "react";

function TemplateUploader({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
  
    const token = localStorage.getItem('token');
    if (!token) {
        setMessage("You must be logged in to upload a template");
        return;
    }

    const formData = new FormData();
    formData.append("template", file);
    formData.append("description", description);


    try {
        const res = await fetch('http://localhost:4000/api/templates/upload', {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`(${res.status}) ${errorData.error || errorData.message || "Upload failed"}`);
    }
    const data = await res.json();
    setMessage(`Uploaded: ${data.name || 'success'}`);
    setFile(null);
    setDescription("");
    if (onUploadComplete) onUploadComplete(); // refresh list

    } catch (err) {
        console.error("Upload error:", err);
        setMessage("Upload failed: " + err.message);
    }
  };

  return (
    <div>
      <h2>Upload Template</h2>

      {/* File input */}
      <input type="file" accept=".docx" onChange={handleChange} />

      {/* Show options upon file selection */}
      {file && (
        <>
          <br />
          <textarea
            placeholder="Enter description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: "300px" }}
          />
          <br />
          <button onClick={handleUpload}>Upload</button>
        </>
      )}

      <p>{message}</p>
    </div>
  );
}

export default TemplateUploader;