// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

import Intake from "./pages/Intake.jsx";
import Session from "./pages/Session.jsx";
import Dashboard from "./pages/Dashboard.jsx";

const API_BASE = "https://your-cloud-run-url.a.run.app"; // TODO: replace

function App() {
  const [apiStatus, setApiStatus] = useState("Checking backend status...");
  const location = useLocation();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        if (!res.ok) throw new Error("Health check failed");
        const data = await res.json();
        setApiStatus(`✅ Backend connected (${data.time})`);
      } catch (err) {
        setApiStatus("❌ Failed to connect to backend - Check URL/CORS settings");
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="app">
      {/* Navigation */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-mark">Ψ</span>
          <div>
            <div className="logo-title">PTSD Digital Exposure Therapy</div>
            <div className="logo-sub">LLM-based Adaptive Story Platform</div>
          </div>
        </div>

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

      {/* API status */}
      <div className="api-status">{apiStatus}</div>

      {/* Page content */}
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h2>PTSD LLM-Based Digital Exposure Therapy</h2>
                <p>
                  This platform allows users to write their trauma narrative, generates
                  exposure stories using an LLM, and adjusts story intensity based on
                  SUDs score changes.
                </p>

                <ul>
                  <li>① Intake: Write trauma narrative + record initial SUDs</li>
                  <li>② Session: Read LLM-generated story + record post-session SUDs</li>
                  <li>③ Dashboard: Track SUDs trends and session history</li>
                </ul>

                <p style={{ marginTop: "1rem" }}>
                  Use the navigation bar above to access <b>Intake</b>, <b>Session</b>, and{" "}
                  <b>Dashboard</b>.
                </p>
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

