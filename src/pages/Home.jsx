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
    <div className="home-page">
      {/* HERO */}
      <section className="home-hero-layout">
        <div className="home-hero-left">
          <div className="home-badge-row">
            <span className="home-badge">Prototype · PTSD Exposure</span>
          </div>

          <h1 className="home-hero-title">
            LLM-assisted <span>digital exposure therapy</span> for PTSD
          </h1>

          <p className="home-hero-subtitle">
            A clinician-informed platform that generates trauma-specific exposure
            stories, tracks SUDS, and visualizes change across sessions.
          </p>

          <div className="home-hero-cta-row">
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
            <li>
              <strong>Structured exposure:</strong> Align each narrative with a
              target SUDS range and clinical goal.
            </li>
            <li>
              <strong>Objective tracking:</strong> Log pre/post SUDS and story
              intensity for every session.
            </li>
            <li>
              <strong>Dashboard view:</strong> Review change in distress over
              time for each patient.
            </li>
          </ul>
        </div>

        {/* Right-side preview card */}
        <div className="home-hero-right">
          <div className="home-preview-card">
            <div className="home-preview-header">
              <span className="home-preview-title">Live Session Preview</span>
              <span className="home-preview-tag">Demo</span>
            </div>

            <div className="home-preview-body">
              <div className="home-preview-suds-row">
                <div>
                  <p className="preview-label">Current SUDS</p>
                  <p className="preview-suds-value">35 / 100</p>
                </div>
                <div className="preview-suds-chip">Mild distress</div>
              </div>

              <div className="preview-story-box">
                <p className="preview-story-label">Exposure narrative (excerpt)</p>
                <p className="preview-story-text">
                  “You stand in the hospital corridor where the event took place.
                  The fluorescent lights hum overhead. You notice your breathing,
                  a little faster than usual, but still under control…”
                </p>
              </div>

              <div className="preview-progress-row">
                <p className="preview-label">Exposure dose</p>
                <div className="preview-progress-track">
                  <div className="preview-progress-fill" />
                </div>
                <p className="preview-progress-text">Low–moderate</p>
              </div>
            </div>

            <div className="home-preview-footer">
              <button
                type="button"
                className="btn-ghost"
                onClick={handleGoSession}
              >
                Go to Session page
              </button>
              <p className="home-preview-footnote">
                * Prototype only. For supervised clinical use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLANATION: SUDS + DIGITAL THERAPY */}
      <section className="home-section home-section-alt">
        <div className="home-section-inner">
          <h2>Why use a digital exposure assistant?</h2>
          <p className="home-section-subtitle">
            Exposure therapy is effective, but it is cognitively demanding for
            clinicians and emotionally intense for patients. This prototype aims
            to support, not replace, the therapist.
          </p>

          <div className="home-three-column">
            <div className="home-info-card">
              <h3>Personalized narratives</h3>
              <p>
                Generate stories that match the patient&apos;s trauma themes
                rather than relying on generic exposure scripts.
              </p>
            </div>
            <div className="home-info-card">
              <h3>SUDS-anchored control</h3>
              <p>
                Use SUDS (0–100) targets to keep exposure within an agreed
                distress window and track habituation over time.
              </p>
            </div>
            <div className="home-info-card">
              <h3>Transparent data</h3>
              <p>
                Every session logs SUDS, story intensity, and key metadata,
                making supervision and research easier.
              </p>
            </div>
          </div>

          {/* Optional mini-card for clinicians/researchers */}
          <div className="home-tagline-card">
            <p className="home-tagline-title">For clinicians &amp; researchers</p>
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
              intake form captures triggers, safety information, and consent for
              digital exposure support.
            </p>
          </div>
          <div className="card home-step-card">
            <h3>2. Plan exposure</h3>
            <p>
              The clinician chooses a target SUDS range and selects story
              intensity. The system generates a structured exposure script based
              on the intake data.
            </p>
          </div>
          <div className="card home-step-card">
            <h3>3. Run session</h3>
            <p>
              During the session, the clinician reads the narrative with the
              patient, checks in on SUDS, and adjusts pacing. Pre/post SUDS
              scores are logged.
            </p>
          </div>
          <div className="card home-step-card">
            <h3>4. Review &amp; adapt</h3>
            <p>
              Over multiple sessions, the dashboard visualizes SUDS change and
              exposure dose so clinicians can decide when to increase, maintain,
              or taper intensity.
            </p>
          </div>
        </div>
      </section>

      {/* SUDS EXPLANATION */}
      <section className="home-section home-suds-section">
        <h2>What is the SUDS scale?</h2>
        <p className="home-section-subtitle">
          SUDS (Subjective Units of Distress Scale) is a 0–100 scale that helps
          patients quickly communicate how distressed they feel in the moment.
        </p>

        <div className="home-suds-grid">
          <div className="card suds-card">
            <h3>0–30 · Low distress</h3>
            <p>
              Mild tension or discomfort. Suitable for early exposure, warm-up,
              or imaginal work that patients can tolerate relatively easily.
            </p>
          </div>
          <div className="card suds-card">
            <h3>30–60 · Moderate distress</h3>
            <p>
              Noticeable anxiety, with some physical symptoms (e.g., tight
              chest, racing thoughts). Common target range for graded exposure.
            </p>
          </div>
          <div className="card suds-card">
            <h3>60–100 · High distress</h3>
            <p>
              Intense anxiety or near-panic. Used carefully, often later in
              treatment, with strong safety planning and trust.
            </p>
          </div>
        </div>
      </section>

      {/* DEMO / VIDEO PLACEHOLDER */}
      <section className="home-section home-demo-section">
        <div className="home-demo-inner">
          <div className="home-demo-text">
            <h2>Demo video (coming soon)</h2>
            <p className="home-section-subtitle">
              You can embed a short walk-through that shows how the Intake →
              Session → Dashboard flow works in practice.
            </p>
            <ul className="home-demo-list">
              <li>Record a real or mock session using screen capture.</li>
              <li>Highlight how SUDS sliders and story intensity controls work.</li>
              <li>
                Show the dashboard updating after each exposure to visualize
                progress.
              </li>
            </ul>
          </div>

          <div className="home-video-placeholder">
            <div className="home-video-frame">
              <div className="home-video-play-icon">▶</div>
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
