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
    <div className="container py-5">
      {!auth ? (
        <Login onLogin={setAuth} />
      ) : (
        <>
          <h3 className="mb-3">Welcome, {auth.user_name}</h3>
          <UploadDocument token={auth.token} />
          <SearchDocuments token={auth.token} />
        </>
      )}
    </div>
  );
};

export default App;
