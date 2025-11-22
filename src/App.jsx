// src/App.jsx
import { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Intake from "./pages/Intake.jsx";
import Session from "./pages/Session.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import "./index.css";

const API_BASE =
  "https://ptsd-backend-761910111968.asia-northeast3.run.app";

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((r) => r.json())
      .then(() => setBackendStatus("ok"))
      .catch(() => setBackendStatus("error"));
  }, []);

  const renderTab = () => {
    if (activeTab === "home") {
      return <Home onStartIntake={() => setActiveTab("intake")} />;
    }
    if (activeTab === "intake") {
      return <Intake apiBase={API_BASE} />;
    }
    if (activeTab === "session") {
      return <Session apiBase={API_BASE} />;
    }
    if (activeTab === "dashboard") {
      return <Dashboard apiBase={API_BASE} />;
    }
    return null;
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          {/* Logo → always go back to Home */}
          <div
            className="app-logo"
            onClick={() => setActiveTab("home")}
            style={{ cursor: "pointer" }}
          >
            <div className="logo-icon">Ψ</div>
            <div className="logo-text">
              <div className="logo-title">PTSD Digital Exposure Therapy</div>
              <div className="logo-sub">
                LLM-based Adaptive Story Platform
              </div>
            </div>
          </div>

          <nav className="app-nav">
            <button
              className={
                "nav-link " +
                (activeTab === "intake" ? "nav-link-active" : "")
              }
              onClick={() => setActiveTab("intake")}
            >
              Intake
            </button>
            <button
              className={
                "nav-link " +
                (activeTab === "session" ? "nav-link-active" : "")
              }
              onClick={() => setActiveTab("session")}
            >
              Session
            </button>
            <button
              className={
                "nav-link " +
                (activeTab === "dashboard" ? "nav-link-active" : "")
              }
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <section>
          <div className="status-row">
            <span className="badge-pill">Prototype</span>
            <span
              className={
                "badge-status " +
                (backendStatus === "ok"
                  ? "badge-status-ok"
                  : backendStatus === "error"
                  ? "badge-status-error"
                  : "badge-status-neutral")
              }
            >
              {backendStatus === "ok"
                ? "Backend connected"
                : backendStatus === "error"
                ? "Backend error"
                : "Checking backend..."}
            </span>
          </div>

          {renderTab()}
        </section>
      </main>
    </div>
  );
}

export default App;
