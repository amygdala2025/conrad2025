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
  // ▶ 처음 접속하면 무조건 Home 탭이 보이도록 초기값을 "home"으로 설정
  const [activeTab, setActiveTab] = useState("home");
  const [backendStatus, setBackendStatus] = useState("checking");

  // 백엔드 health 체크
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((r) => {
        if (!r.ok) throw new Error("health check failed");
        // 응답 JSON은 안 써도 되지만, 형식상 한번 파싱
        return r
          .json()
          .catch(() => ({}));
      })
      .then(() => setBackendStatus("ok"))
      .catch(() => setBackendStatus("error"));
  }, []);

  // 탭별로 어떤 컴포넌트를 렌더할지 정의
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
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* 상단 헤더 + 네비게이션 */}
      <header className="app-header">
        <div className="app-header-inner">
          {/* 로고 클릭 시 언제나 Home으로 */}
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
          </nav>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="app-main">
        <section>
          {/* 상단 상태 표시 줄 */}
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

          {/* 탭별 실제 내용 */}
          {renderTab()}
        </section>
      </main>
    </div>
  );
}

export default App;
