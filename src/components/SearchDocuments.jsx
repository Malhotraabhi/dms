import React, { useState } from "react";
import { searchDocuments } from "../services/api";
import { saveAs } from "file-saver";
import JSZip from "jszip";

const SearchDocuments = ({ token }) => {
  const [query, setQuery] = useState("");
  const [majorHead, setMajorHead] = useState("");
  const [minorHead, setMinorHead] = useState("");
  const [tag, setTag] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [results, setResults] = useState([]);

  // minor head options
  const minorOptions =
    majorHead === "Personal"
      ? ["John", "Tom", "Emily"]
      : majorHead === "Professional"
      ? ["Accounts", "HR", "IT", "Finance"]
      : [];

  // 🔍 handle search
  const handleSearch = async () => {
    const body = {
      major_head: majorHead,
      minor_head: minorHead,
      from_date: fromDate,
      to_date: toDate,
      tags: tag ? [{ tag_name: tag }] : [],
      uploaded_by: "",
      start: 0,
      length: 10,
      filterId: "",
      search: { value: query },
    };

    console.log("📤 Sending search request:", body);

    const res = await searchDocuments(body, token);
    console.log("📥 API Response:", res);

    if (res.status && Array.isArray(res.data)) {
      setResults(res.data);
    } else {
      console.warn("⚠️ No data found", res);
      setResults([]);
    }
  };

  // ⬇️ Download single file
  const handleDownload = (file) => {
    if (!file.file_url) {
      alert("File URL missing");
      return;
    }
    saveAs(file.file_url, file.file_name || "document");
  };

  // ⬇️ Download all as ZIP
  const handleDownloadAll = async () => {
    if (results.length === 0) return;

    const zip = new JSZip();
    for (let file of results) {
      try {
        const response = await fetch(file.file_url);
        const blob = await response.blob();
        zip.file(file.file_name || "document", blob);
      } catch (err) {
        console.error("❌ Error fetching file:", file, err);
      }
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "all_documents.zip");
  };

  // 👀 File preview
  const renderPreview = (doc) => {
    if (!doc.file_url) return <p>⚠️ No preview available.</p>;
    if (doc.file_type === "pdf") {
      return (
        <iframe
          src={doc.file_url}
          title={doc.file_name}
          width="100%"
          height="200px"
        />
      );
    } else if (doc.file_type === "image") {
      return <img src={doc.file_url} alt={doc.file_name} width="200px" />;
    } else {
      return <p>❌ Preview not supported for this type.</p>;
    }
  };

  return (
    <div className="card shadow-sm p-4 mt-3">
      <h5>🔍 Search Documents</h5>

      {/* search filters */}
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Search by name/owner"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <select
        className="form-control mb-2"
        value={majorHead}
        onChange={(e) => setMajorHead(e.target.value)}
      >
        <option value="">Select Category</option>
        <option value="Personal">Personal</option>
        <option value="Professional">Professional</option>
      </select>

      <select
        className="form-control mb-2"
        value={minorHead}
        onChange={(e) => setMinorHead(e.target.value)}
        disabled={!majorHead}
      >
        <option value="">Select {majorHead || "Minor Head"}</option>
        {minorOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <input
        type="text"
        className="form-control mb-2"
        placeholder="Tag"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      />

      <input
        type="date"
        className="form-control mb-2"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />

      <input
        type="date"
        className="form-control mb-2"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />

      <button className="btn btn-secondary mb-2 w-100" onClick={handleSearch}>
        Search
      </button>

      {/* results */}
      {results.length > 0 && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6>📂 Results ({results.length})</h6>
            <button className="btn btn-success" onClick={handleDownloadAll}>
              ⬇️ Download All as ZIP
            </button>
          </div>

          {results.map((doc, idx) => (
            <div key={idx} className="border rounded p-2 mb-2">
              <strong>{doc.file_name || "Untitled Document"}</strong>
              {renderPreview(doc)}
              <button
                className="btn btn-sm btn-primary mt-2"
                onClick={() => handleDownload(doc)}
              >
                ⬇️ Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchDocuments;
