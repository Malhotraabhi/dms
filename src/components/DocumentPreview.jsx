import React from "react";

const DocumentPreview = ({ doc }) => {
  return (
    <div className="border p-2 rounded mb-2 bg-light doc-preview">
      <h6>{doc.name}</h6>
      <p className="mb-1">Owner: {doc.owner}</p>
      <small>Uploaded: {doc.uploaded}</small>
    </div>
  );
};

export default DocumentPreview;
