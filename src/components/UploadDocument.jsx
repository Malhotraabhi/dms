import React, { useState, useEffect } from "react";
import { uploadDocument, getDocumentTags } from "../services/api";

const UploadDocument = () => {
  const rawSession = sessionStorage.getItem("auth");
  const session = rawSession ? JSON.parse(rawSession) : null;

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
      if (!session?.token) return;
      try {
        const res = await getDocumentTags(session.token);
        if (res.status && Array.isArray(res.data)) {
          const mapped = res.data.map((t) => ({ id: t.id, label: t.label }));
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
    if (!file) return setMessage("Please select a file to upload.");
    if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type))
      return setMessage("Only PDF and Image files are allowed.");
    if (!session?.token || !session?.user_id)
      return setMessage("❌ Invalid session. Please login again.");

    const formData = new FormData();
    formData.append("file", file);

    const data = {
      ...doc,
      document_date: formatDate(doc.document_date),
      user_id: session.user_id,
      tags: doc.tags.map((t) => ({ tag_name: t.label })),
    };

    formData.append("data", JSON.stringify(data));

    const res = await uploadDocument(formData, session);
    if (res.status) {
      setMessage("✅ Document uploaded successfully!");
      setDoc({ major_head: "", minor_head: "", document_date: "", document_remarks: "", tags: [] });
      setFile(null);
    } else {
      setMessage(res.message || "❌ Upload failed.");
    }
  };

  return (
    <div className="upload-card card shadow-sm p-4 mt-3">
      <h5 className="mb-3 text-primary">📂 Upload Document</h5>

      {/* File input */}
      <input
        type="file"
        accept="image/*,application/pdf"
        className="form-control mb-3 input-animated"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* Major Head */}
      <select
        className="form-control mb-3 input-animated"
        value={doc.major_head}
        onChange={(e) => setDoc({ ...doc, major_head: e.target.value })}
      >
        <option value="">Select Category</option>
        <option value="Personal">Personal</option>
        <option value="Professional">Professional</option>
      </select>

      {/* Minor Head */}
      <select
        className="form-control mb-3 input-animated"
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
        className="form-control mb-3 input-animated"
        value={doc.document_date}
        onChange={(e) => setDoc({ ...doc, document_date: e.target.value })}
      />

      {/* Remarks */}
      <input
        type="text"
        className="form-control mb-3 input-animated"
        placeholder="Remarks"
        value={doc.document_remarks}
        onChange={(e) => setDoc({ ...doc, document_remarks: e.target.value })}
      />

      {/* Tags */}
      <div className="mb-3">
        <div className="d-flex gap-2 mb-2">
          <input
            type="text"
            className="form-control input-animated"
            placeholder="Add tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
          />
          <button className="btn btn-gradient" onClick={handleAddTag}>
            Add
          </button>
        </div>

        <select
          className="form-control mb-2 input-animated"
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

      <button className="btn btn-gradient w-100" onClick={handleSubmit}>
        Upload
      </button>

      {message && <p className="mt-2 text-center">{message}</p>}
    </div>
  );
};

export default UploadDocument;
