// src/App.jsx
import { useEffect, useState } from "react";

import Home from "./pages/Home.jsx";
import Intake from "./pages/Intake.jsx";
import Session from "./pages/Session.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Team from "./pages/Team.jsx";

import "./index.css";

const API_BASE =
  "https://ptsd-backend-761910111968.asia-northeast3.run.app";

function App() {
  // 기본 진입은 Home
  const [activeTab, setActiveTab] = useState("home");
  const [backendStatus, setBackendStatus] = useState("checking");

  // 백엔드 상태 체크
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((r) => {
        if (!r.ok) throw new Error("health check failed");
        return r.json().catch(() => ({}));
      })
      .then(() => setBackendStatus("ok"))
      .catch(() => setBackendStatus("error"));
  }, []);

  // 탭별 렌더링
  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return (
          <Home
            onStartIntake={() => setActiveTab("intake")}
            onGoSession={() => setActiveTab("session")}
          />
        );
      case "intake":
        return <Intake apiBase={API_BASE} />;
      case "session":
        return <Session apiBase={API_BASE} />;
      case "dashboard":
        return <Dashboard apiBase={API_BASE} />;
      case "team":
        return <Team />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* ===== Header / Navigation ===== */}
      <header className="app-header">
        <div className="app-header-inner">
          {/* Logo */}
          <div
            className="app-logo"
            onClick={() => setActiveTab("home")}
            style={{ cursor: "pointer" }}
          >
            <div className="logo-icon">Ψ</div>
            <div className="logo-text">
              <div className="logo-title">
                PTSD Digital Exposure Therapy
              </div>
              <div className="logo-sub">
                LLM-based Adaptive Story Platform
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="app-nav">
            <button
              type="button"
              className={
                "nav-link " +
                (activeTab === "intake" ? "nav-link-active" : "")
              }
              onClick={() => setActiveTab("intake")}
            >
              Intake
            </button>

            <button
              type="button"
              className={
                "nav-link " +
                (activeTab === "session" ? "nav-link-active" : "")
              }
              onClick={() => setActiveTab("session")}
            >
              Session
            </button>

            <button
              type="button"
              className={
                "nav-link " +
                (activeTab === "dashboard" ? "nav-link-active" : "")
              }
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>

            <button
              type="button"
              className={
                "nav-link " +
                (activeTab === "team" ? "nav-link-active" : "")
              }
              onClick={() => setActiveTab("team")}
            >
              Team
            </button>
          </nav>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className="app-main">
        <section>
          {/* Status Row */}
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

          {/* Page Content */}
          {renderTab()}
        </section>
      </main>
    </div>
  );
}

export default App;
