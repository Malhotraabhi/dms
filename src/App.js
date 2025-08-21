import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import UploadDocument from "./components/UploadDocument";
import SearchDocuments from "./components/SearchDocuments";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/custom.css";

const App = () => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("auth");
    if (stored) {
      setAuth(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="app-wrapper min-vh-100 d-flex align-items-center justify-content-center">
      <div className="container">
        {!auth ? (
          <div className="login-card shadow-lg p-4 bg-white rounded-4 mx-auto">
            <h2 className="text-center mb-4 fw-bold text-gradient">Doc Manager</h2>
            <Login onLogin={setAuth} />
          </div>
        ) : (
          <div className="dashboard">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
              <h3 className="fw-semibold">👋 Welcome, {auth.user_name}</h3>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  sessionStorage.removeItem("auth");
                  setAuth(null);
                }}
              >
                Logout
              </button>
            </div>

            <div className="row g-4">
              <div className="col-lg-5">
                <div className="card shadow-sm border-0 rounded-4 h-100 p-3">
                  <div className="card-body">
                    <h5 className="card-title mb-3 text-primary">📤 Upload Document</h5>
                    <UploadDocument token={auth.token} />
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="card shadow-sm border-0 rounded-4 h-100 p-3">
                  <div className="card-body">
                    <h5 className="card-title mb-3 text-primary">🔎 Search Documents</h5>
                    <SearchDocuments token={auth.token} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
