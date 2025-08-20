import React, { useState, useEffect } from "react";
import { uploadDocument, getDocumentTags } from "../services/api";

const UploadDocument = () => {

  const rawSession = sessionStorage.getItem("auth");
   const session = rawSession ? JSON.parse(rawSession) : null;


  console.log("session:", session);

  const [doc, setDoc] = useState({
    major_head: "",
    minor_head: "",
    document_date: "",
    document_remarks: "",
    tags: [],
  });
  const [file, setFile] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [message, setMessage] = useState("");


  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };


useEffect(() => {
  const loadTags = async () => {
    if (!session?.token) {
      console.warn("No token found in session");
      return;
    }

    try {
      const res = await getDocumentTags(session.token);
      console.log("Tags response:", res);

      if (res.status && Array.isArray(res.data)) {
        const mapped = res.data.map((t) => ({
          id: t.id,
          label: t.label, 
        }));
        setAllTags(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  loadTags();
}, [session?.token]);


  const minorOptions =
    doc.major_head === "Personal"
      ? ["John", "Tom", "Emily"]
      : doc.major_head === "Professional"
      ? ["Accounts", "HR", "IT", "Finance"]
      : [];

  const handleAddTag = () => {
    if (newTag.trim() && !doc.tags.some((t) => t.label === newTag.trim())) {
      setDoc({
        ...doc,
        tags: [...doc.tags, { id: newTag.trim(), label: newTag.trim() }],
      });
      setNewTag("");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
      setMessage("Only PDF and Image files are allowed.");
      return;
    }

    if (!session?.token || !session?.user_id) {
      setMessage("❌ Invalid session. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const data = {
      ...doc,
      document_date: formatDate(doc.document_date),
      user_id: session.user_id, 
      tags: doc.tags.map((t) => ({ tag_name: t.label })),
    };

    console.log(" Upload payload:", data);

    formData.append("data", JSON.stringify(data));

    const res = await uploadDocument(formData, session);
    if (res.status) {
      setMessage(" Document uploaded successfully!");
      setDoc({
        major_head: "",
        minor_head: "",
        document_date: "",
        document_remarks: "",
        tags: [],
      });
      setFile(null);
    } else {
      setMessage(res.message || "❌ Upload failed.");
    }
  };

  return (
    <div className="card shadow-sm p-4 mt-3">
      <h5>📂 Upload Document</h5>

      {/* File input */}
      <input
        type="file"
        accept="image/*,application/pdf"
        className="form-control mb-2"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* Category dropdown */}
      <select
        className="form-control mb-2"
        value={doc.major_head}
        onChange={(e) => setDoc({ ...doc, major_head: e.target.value })}
      >
        <option value="">Select Category</option>
        <option value="Personal">Personal</option>
        <option value="Professional">Professional</option>
      </select>

      {/* Minor Head */}
      <select
        className="form-control mb-2"
        value={doc.minor_head}
        onChange={(e) => setDoc({ ...doc, minor_head: e.target.value })}
        disabled={!doc.major_head}
      >
        <option value="">Select {doc.major_head || "Minor Head"}</option>
        {minorOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {/* Date */}
      <input
        type="date"
        className="form-control mb-2"
        value={doc.document_date}
        onChange={(e) => setDoc({ ...doc, document_date: e.target.value })}
      />

      {/* Remarks */}
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Remarks"
        value={doc.document_remarks}
        onChange={(e) => setDoc({ ...doc, document_remarks: e.target.value })}
      />

      {/* Tags */}
      <div className="mb-2">
        <div className="d-flex gap-2 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Add tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleAddTag}
          >
            Add
          </button>
        </div>

        {/* Existing tags dropdown */}
        <select
          className="form-control mb-2"
          onChange={(e) => {
            const selected = allTags.find((t) => t.id === e.target.value);
            if (selected && !doc.tags.some((t) => t.id === selected.id)) {
              setDoc({ ...doc, tags: [...doc.tags, selected] });
            }
          }}
        >
          <option value="">Select Existing Tag</option>
          {allTags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.label}
            </option>
          ))}
        </select>

        <div className="d-flex flex-wrap gap-2">
          {doc.tags.map((tag, i) => (
            <span key={i} className="badge bg-primary">
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      <button className="btn btn-success w-100" onClick={handleSubmit}>
        Upload
      </button>

      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default UploadDocument;
