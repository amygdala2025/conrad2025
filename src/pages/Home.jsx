// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleStartIntake = () => {
    navigate("/intake");
  };

  const handleGoSession = () => {
    navigate("/session");
  };

  const handleScrollHow = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="home-hero-layout">
        <div className="home-hero-left">
          <div className="home-badge-row">
            <span className="home-pill home-pill-primary">Prototype</span>
            <span className="home-pill home-pill-soft">
              LLM-based Adaptive Story Platform
            </span>
          </div>

          <h1 className="home-title">
            A calmer way to practice <span>exposure</span>.
          </h1>

          <p className="home-subtitle">
            This prototype delivers gentle, LLM-generated exposure stories
            based on a personal trauma narrative, and tracks{" "}
            <b>SUDS (Subjective Units of Distress)</b> before and after each
            session to adapt the story intensity over time.
          </p>

          <div className="home-hero-actions">
            <button
              type="button"
              className="primary-btn hero-primary-btn"
              onClick={handleStartIntake}
            >
              Start with Intake
            </button>
            <button
              type="button"
              className="secondary-btn hero-secondary-btn"
              onClick={handleScrollHow}
            >
              See how it works
            </button>
          </div>

          <ul className="home-hero-bullets">
            <li>⚖ Matches story intensity to your current SUDS level</li>
            <li>📈 Tracks pre- and post-session distress over time</li>
            <li>🧠 Keeps your original trauma narrative under your control</li>
          </ul>

          <div className="home-safety-note">
            <strong>Important:</strong> This is a research prototype and{" "}
            <u>not a medical device</u>. It does not provide crisis support.
            In emergencies, contact your local emergency number or hotline.
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="home-hero-right">
          <div className="home-orbit-card">
            <div className="home-orbit-glow" />
            <div className="home-orbit-inner">
              <div className="home-orbit-icon">🧠</div>
              <p className="home-orbit-title">Digital Exposure Companion</p>
              <p className="home-orbit-text">
                LLM-generated stories are tuned to your SUDS score and
                gradually adjusted as distress decreases across sessions.
              </p>
              <div className="home-orbit-metrics">
                <div>
                  <span className="metric-label">Today&apos;s SUDS</span>
                  <span className="metric-value">42 → 26</span>
                </div>
                <div>
                  <span className="metric-label">Trend</span>
                  <span className="metric-chip">Mild decrease</span>
                </div>
              </div>
            </div>
          </div>

          {/* Optional mini-card for clinicians/researchers */}
          <div className="home-tagline-card">
            <p className="home-tagline-title">For clinicians & researchers</p>
            <p className="home-tagline-text">
              Use the dashboard view to review SUDS trajectories, story
              content, and intensity adaptation patterns across sessions.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="home-section">
        <h2>How this platform works</h2>
        <p className="home-section-subtitle">
          Each session follows the same simple loop: describe, expose, then
          reflect. The system tracks your SUDS responses to adapt intensity
          safely over time.
        </p>

        <div className="home-steps-grid">
          <div className="card home-step-card">
            <h3>1. Intake</h3>
            <p>
              The user writes their trauma narrative in their own words. The
              text is stored securely and used only to create controlled
              exposure stories tailored to their experience.
            </p>
          </div>

          <div className="card home-step-card">
            <h3>2. Session</h3>
            <p>
              Before reading, the user reports a <b>pre-session SUDS score</b>.
              An exposure story is generated based on their narrative and
              previous sessions. After reading, they report a{" "}
              <b>post-session SUDS score</b>.
            </p>
          </div>

          <div className="card home-step-card">
            <h3>3. Dashboard</h3>
            <p>
              The dashboard visualizes changes in SUDS over time and shows the
              story content for each session, enabling monitoring of
              therapeutic progress and intensity adaptation.
            </p>
          </div>
        </div>
      </section>

      {/* VIDEO / DEMO PLACEHOLDER */}
      <section className="home-section">
        <h2>Walkthrough demo</h2>
        <p className="home-section-subtitle">
          You can embed a short video here to walk users through a typical
          session. For now this is a placeholder box.
        </p>

        <div className="card home-video-card">
          {/* 나중에 실제 영상이 생기면 아래 iframe의 src만 바꾸면 됨 */}
          {/* 
          <div className="home-video-frame">
            <iframe
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
              title="PTSD Digital Exposure Therapy demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          */}
          <div className="home-video-placeholder">
            <span className="home-video-icon">▶</span>
            <div>
              <p className="home-video-title">Add your demo video here</p>
              <p className="home-video-text">
                Replace this placeholder with a YouTube link or screen-capture
                video showing how the Intake → Session → Dashboard flow works.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
