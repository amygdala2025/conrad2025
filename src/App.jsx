// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";

import Intake from "./pages/Intake.jsx";
import Session from "./pages/Session.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// TODO: 나중에 Cloud Run URL로 교체
const API_BASE = "https://your-cloud-run-url.a.run.app";

function App() {
  const [apiStatus, setApiStatus] = useState({
    text: "Checking backend connection...",
    ok: null,
  });
  const location = useLocation();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        if (!res.ok) throw new Error("Health check failed");
        const data = await res.json();
        setApiStatus({
          text: `Backend connected (${new Date(data.time).toLocaleTimeString()})`,
          ok: true,
        });
      } catch (err) {
        setApiStatus({
          text: "Failed to connect to backend - Check URL/CORS settings",
          ok: false,
        });
      }
    };
    checkHealth();
  }, []);

  return (
    <div className="app">
      {/* Top navigation */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <div className="logo-icon">Ψ</div>
            <div className="logo-text">
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
        </div>
      </header>

      {/* Main layout */}
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <section className="home-hero">
                <div className="home-hero-left">
                  <div className="badge-row">
                    <span className="badge-pill">Prototype · Research Only</span>
                    <span
                      className={
                        apiStatus.ok === null
                          ? "badge-status badge-status-neutral"
                          : apiStatus.ok
                          ? "badge-status badge-status-ok"
                          : "badge-status badge-status-error"
                      }
                    >
                      {apiStatus.ok === null
                        ? "Checking backend…"
                        : apiStatus.ok
                        ? "Backend: Online"
                        : "Backend: Offline"}
                    </span>
                  </div>

                  <h1 className="hero-title">
                    PTSD LLM-Based{" "}
                    <span className="hero-title-highlight">
                      Digital Exposure Therapy
                    </span>
                  </h1>

                  <p className="hero-subtitle">
                    This experimental platform helps you prototype a workflow where
                    users write their trauma narrative, receive LLM-generated exposure
                    stories, and modulate story intensity based on SUDs score changes
                    over time.
                  </p>

                  <ul className="hero-bullets">
                    <li>Capture trauma narrative in a structured, secure intake flow.</li>
                    <li>
                      Generate exposure stories with an LLM conditioned on user
                      keywords &amp; SUDs.
                    </li>
                    <li>
                      Visualize how SUDs scores change across sessions on the dashboard.
                    </li>
                  </ul>

                  <div className="hero-buttons">
                    <Link to="/intake" className="btn-primary">
                      Start with Intake
                    </Link>
                    <Link to="/dashboard" className="btn-ghost">
                      View Dashboard
                    </Link>
                  </div>

                  <p className="hero-caption">
                    ⚠️ This prototype is for research and engineering purposes only and
                    is <strong>not</strong> a clinical product.
                  </p>
                </div>

                <div className="home-hero-right">
                  <div className="flow-card">
                    <h2 className="flow-title">Therapy Flow</h2>
                    <ol className="flow-steps">
                      <li>
                        <span className="step-index">01</span>
                        <div className="step-content">
                          <div className="step-title">Intake &amp; Baseline</div>
                          <div className="step-desc">
                            User signs in, writes their trauma narrative, and records an
                            initial SUDs score for that narrative.
                          </div>
                        </div>
                      </li>
                      <li>
                        <span className="step-index">02</span>
                        <div className="step-content">
                          <div className="step-title">Exposure Session</div>
                          <div className="step-desc">
                            LLM generates a story based on extracted keywords and
                            current intensity level. After reading, the user records a
                            post-session SUDs score.
                          </div>
                        </div>
                      </li>
                      <li>
                        <span className="step-index">03</span>
                        <div className="step-content">
                          <div className="step-title">Adaptive Tuning</div>
                          <div className="step-desc">
                            The backend adjusts story intensity based on SUDs deltas and
                            logs the trajectory to the dashboard.
                          </div>
                        </div>
                      </li>
                    </ol>

                    <div className="flow-footer">
                      <span className="flow-tag">Next steps</span>
                      <span className="flow-footer-text">
                        Connect Cloud Run backend, Firestore DB, and HuggingFace models
                        to activate this flow end-to-end.
                      </span>
                    </div>
                  </div>

                  <div className="status-card">
                    <div className="status-label">Backend status</div>
                    <div className="status-text">{apiStatus.text}</div>
                  </div>
                </div>
              </section>
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
