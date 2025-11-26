// src/pages/Home.jsx
function Home({ onStartIntake, onGoSession }) {
  const handleStartIntake = () => {
    if (onStartIntake) onStartIntake();
  };

  const handleGoSession = () => {
    if (onGoSession) onGoSession();
  };

  const handleScrollHow = () => {
    const el = document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-left">
            <h1 className="home-title">
              PTSD Digital Exposure Therapy
            </h1>
            <p className="home-subtitle">
              An LLM-based platform that helps clinicians deliver
              personalized exposure narratives while tracking patient
              distress in real time.
            </p>

            <div className="home-cta-row">
              <button className="btn-primary" onClick={handleStartIntake}>
                Start Intake
              </button>
              <button className="btn-secondary" onClick={handleScrollHow}>
                How it works
              </button>
            </div>

            <div className="home-badges">
              <div className="badge">
                <span className="badge-label">For Clinicians</span>
                <span className="badge-text">
                  Structured intake, SUDS tracking, and story logs in one place.
                </span>
              </div>
              <div className="badge">
                <span className="badge-label">For Patients</span>
                <span className="badge-text">
                  Gradual, controllable exposure with clear SUDS anchors.
                </span>
              </div>
            </div>
          </div>

          <div className="home-hero-right">
            <div className="hero-card">
              <div className="hero-card-header">
                <span className="hero-card-title">Live Session Preview</span>
                <span className="hero-card-tag">Prototype</span>
              </div>
              <div className="hero-card-body">
                <div className="hero-suds-row">
                  <div className="hero-suds-label">Current SUDS</div>
                  <div className="hero-suds-value">35 / 100</div>
                  <div className="hero-suds-chip">Mild – manageable</div>
                </div>
                <div className="hero-story-snippet">
                  “You step into the hospital corridor where the incident
                  happened. The fluorescent lights hum softly above you…”
                </div>
                <div className="hero-progress-row">
                  <div className="hero-progress-label">Exposure dose</div>
                  <div className="hero-progress-track">
                    <div className="hero-progress-fill" />
                  </div>
                  <div className="hero-progress-text">Low–moderate</div>
                </div>
              </div>
              <div className="hero-card-footer">
                <button className="btn-ghost" onClick={handleGoSession}>
                  Go to Session page
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="home-section">
        <div className="home-section-inner">
          <h2 className="section-title">How this prototype works</h2>
          <p className="section-subtitle">
            The platform is designed for supervised clinical use. It does not
            replace therapy, but helps structure and document exposure work.
          </p>

          <div className="home-steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Structured Intake</h3>
              <p className="step-text">
                Collect background, trauma categories, and safety information
                in a standardized form. This becomes the foundation for all
                future exposure sessions.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">SUDS-anchored Story Generation</h3>
              <p className="step-text">
                For each session, clinicians set a pre-exposure SUDS target and
                desired story intensity. The LLM generates a narrative tailored
                to that range.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Tracking & Dashboard</h3>
              <p className="step-text">
                Session IDs, pre/post SUDS, and story metadata are logged so that
                clinicians can track progress across multiple exposures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUDS explanation */}
      <section className="home-section home-section-alt">
        <div className="home-section-inner">
          <h2 className="section-title">What is SUDS?</h2>
          <p className="section-subtitle">
            SUDS (Subjective Units of Distress Scale) is a 0–100 scale that
            helps patients communicate how distressed they feel in the moment.
          </p>

          <div className="home-two-column">
            <div className="col">
              <h3 className="step-title">0–30: Low Distress</h3>
              <p className="step-text">
                Mild tension or discomfort, but still able to focus and think
                clearly. Suitable for early-stage exposure or warm-up scenarios.
              </p>
            </div>
            <div className="col">
              <h3 className="step-title">30–60: Moderate Distress</h3>
              <p className="step-text">
                Noticeable anxiety with some physical symptoms. Often used as
                the main target range for graded exposure work.
              </p>
            </div>
            <div className="col">
              <h3 className="step-title">60–100: High Distress</h3>
              <p className="step-text">
                Intense anxiety or panic-level distress. This range is approached
                carefully and only with an established safety plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video / demo placeholder */}
      <section className="home-section">
        <div className="home-section-inner">
          <h2 className="section-title">Demo video (coming soon)</h2>
          <p className="section-subtitle">
            This area can embed a screen-recorded demo to show clinicians how
            the full Intake → Session → Dashboard flow works.
          </p>

          <div className="home-video-placeholder">
            <div className="video-frame">
              <div className="video-play-icon">▶</div>
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
