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
  const [loading, setLoading] = useState(false);

  const minorOptions =
    majorHead === "Personal"
      ? ["John", "Tom", "Emily"]
      : majorHead === "Professional"
      ? ["Accounts", "HR", "IT", "Finance"]
      : [];

  const handleSearch = async () => {
    const body = {
      major_head: majorHead || "",
      minor_head: minorHead || "",
      from_date: fromDate || "",
      to_date: toDate || "",
      tags: tag ? [{ tag_name: tag }] : [],
      uploaded_by: "",
      start: 0,
      length: 10,
      filterId: "",
      search: { value: query || "" },
    };

    setLoading(true);
    try {
      const res = await searchDocuments(body, token);
      setResults(res.status && Array.isArray(res.data) ? res.data : []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const handleDownload = async (file) => {
    if (!file.file_url) return alert("File URL missing");
    try {
      const response = await fetch(file.file_url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const filename = file.file_url.split("/").pop().split("?")[0];
      saveAs(blob, filename);
    } catch {
      alert("Failed to download file.");
    }
  };

  const handleDownloadAll = async () => {
    if (!results.length) return;
    const zip = new JSZip();

    for (let file of results) {
      try {
        const response = await fetch(file.file_url);
        if (!response.ok) continue;
        const blob = await response.blob();
        const filename = file.file_url.split("/").pop().split("?")[0];
        zip.file(filename, blob);
      } catch {}
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "all_documents.zip");
  };

  const renderPreview = (doc) => {
    if (!doc.file_url) return <p className="text-muted">⚠️ No preview available.</p>;

    const ext = doc.file_url.split(".").pop().split("?")[0].toLowerCase();

    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
      return (
        <img
          src={doc.file_url}
          alt={doc.document_remarks || "Image Document"}
          className="img-fluid rounded shadow-sm"
          style={{ maxHeight: "200px" }}
        />
      );
    } else {
      return (
        <p className="text-muted">❌ Preview not supported. Use the View button.</p>
      );
    }
  };

  const getFileName = (doc) =>
    doc.file_name || doc.file_url.split("/").pop().split("?")[0];

  return (
    <div className="card shadow-lg border-0 mt-4">
      <div className="card-body">
        <h4 className="mb-4 fw-bold text-primary">🔍 Search Documents</h4>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name/owner"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={majorHead}
              onChange={(e) => setMajorHead(e.target.value)}
            >
              <option value="">Select Category</option>
              <option value="Personal">Personal</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
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
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <button
              className="btn btn-primary w-100"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-semibold">📂 Results ({results.length})</h5>
              <button className="btn btn-success" onClick={handleDownloadAll}>
                ⬇️ Download All as ZIP
              </button>
            </div>

            <div className="row g-3">
              {results.map((doc, idx) => (
                <div key={idx} className="col-md-6">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <h6 className="fw-bold">{getFileName(doc)}</h6>
                      {renderPreview(doc)}

                      <div className="mt-2">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleDownload(doc)}
                        >
                          ⬇️ Download
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => window.open(doc.file_url, "_blank")}
                        >
                          👁️ View
                        </button>
                      </div>

                      <p className="text-muted mt-2">
                        Uploaded by: {doc.uploaded_by} | Remarks: {doc.document_remarks}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && (
          <p className="text-muted mt-3">No documents found. Try different filters.</p>
        )}
      </div>
    </div>
  );
};

export default SearchDocuments;
