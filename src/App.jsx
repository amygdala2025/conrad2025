// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

import Intake from "./pages/Intake.jsx";
import Session from "./pages/Session.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// 🔧 백엔드 Cloud Run URL
const API_BASE = "https://ptsd-backend-761910111968.asia-northeast3.run.app";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking backend status...");
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setApiStatus(`✅ Backend connected (${data.time})`);
      } catch (e) {
        setApiStatus("❌ Failed to connect to backend - Check URL/CORS");
      }
    };
    check();
  }, []);

  return (
    <div className="app">
      {/* HEADER */}
      <header className="app-header">
        {/* 👉 로고 전체를 Link로 감싸서 클릭 시 루트(/)로 이동 */}
        <Link to="/" className="app-logo" style={{ textDecoration: "none", color: "inherit" }}>
          <span className="logo-mark">Ψ</span>
          <div>
            <div className="logo-title">PTSD Digital Exposure Therapy</div>
            <div className="logo-sub">LLM-based Adaptive Story Platform</div>
          </div>
        </Link>

        <nav className="app-nav">
          <NavLink to="/intake" currentPath={location.pathname}>
            Intake
          </NavLink>
          <NavLink to="/session" currentPath={location.pathname}>
            Session
          </NavLink>
          <NavLink to="/dashboard" currentPath={location.pathname}>
            Dashboard
          </NavLink>
        </nav>
      </header>

      <div className="api-status">{apiStatus}</div>

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h2>PTSD LLM-Based Digital Exposure Therapy</h2>
                <p>
                  This experimental platform lets you write a trauma narrative, generate
                  controlled exposure stories with an LLM, and track your SUDS scores
                  before and after each story. Over time, story intensity is adjusted
                  based on your responses.
                </p>
                <ul>
                  <li>① <b>Intake</b>: Save trauma narrative + show SUDS scale</li>
                  <li>② <b>Session</b>: Pre-SUDS → generate story → Post-SUDS</li>
                  <li>③ <b>Dashboard</b>: Visualize SUDS trends over sessions</li>
                </ul>
              </div>
            }
          />
          <Route path="/intake" element={<Intake apiBase={API_BASE} />} />
          <Route path="/session" element={<Session apiBase={API_BASE} />} />
          <Route path="/dashboard" element={<Dashboard apiBase={API_BASE} />} />
        </Routes>
      </main>
    </div>
  );
}

function NavLink({ to, currentPath, children }) {
  const active = currentPath === to;
  return (
    <Link
      to={to}
      className={active ? "nav-link nav-link-active" : "nav-link"}
    >
      {children}
    </Link>
  );
}

export default App;
