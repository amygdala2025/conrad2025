// src/App.jsx
import { useState } from "react";
import Intake from "./pages/Intake.jsx";
import Session from "./pages/Session.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import "./index.css";

const API_BASE = "https://ptsd-backend-761910111968.asia-northeast3.run.app";

function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "intake":
        return <Intake API_BASE={API_BASE} />;
      case "session":
        return <Session API_BASE={API_BASE} />;
      case "dashboard":
        return <Dashboard API_BASE={API_BASE} />;
      default:
        return (
          <div className="home-container">
            <h1>PTSD Digital Exposure Therapy</h1>
            <p style={{ marginTop: 8 }}>
              A controlled, LLM-based adaptive exposure-story therapy tool.
            </p>
            <p style={{ marginTop: 4, opacity: 0.7 }}>
              Choose a menu above to begin.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <div className="nav-left" onClick={() => setPage("home")}>
          <h2>PTSD Digital Exposure Therapy</h2>
          <span className="nav-sub">LLM-based Adaptive Story Platform</span>
        </div>

        <div className="nav-links">
          <button
            className={page === "intake" ? "active" : ""}
            onClick={() => setPage("intake")}
          >
            Intake
          </button>
          <button
            className={page === "session" ? "active" : ""}
            onClick={() => setPage("session")}
          >
            Session
          </button>
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
        </div>
      </nav>

      <main className="page-container">{renderPage()}</main>
    </div>
  );
}

export default App;
