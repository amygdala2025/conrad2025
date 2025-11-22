// src/pages/Home.jsx

function Home({ onStartIntake }) {
  return (
    <div>
      <h2>Welcome</h2>
      <p className="page-intro">
        This prototype delivers LLM-generated exposure stories based on a
        personal trauma narrative, and tracks SUDS (Subjective Units of
        Distress) before and after each session to adapt the story intensity
        over time.
      </p>

      <div className="card">
        <h3>How this platform works</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginTop: 12,
          }}
        >
          <div className="session-detail">
            <h4>1. Intake</h4>
            <p className="help-text">
              The user writes their trauma narrative in their own words. The
              system extracts keywords which are later used to generate
              controlled exposure stories.
            </p>
          </div>
          <div className="session-detail">
            <h4>2. Session</h4>
            <p className="help-text">
              Before reading, the user reports a pre-session SUDS score. An
              exposure story is generated based on their narrative and previous
              sessions. After reading, the user reports a post-session SUDS
              score.
            </p>
          </div>
          <div className="session-detail">
            <h4>3. Dashboard</h4>
            <p className="help-text">
              The dashboard visualizes changes in pre/post SUDS by date and
              shows the story content for each session, enabling monitoring of
              therapeutic progress.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            type="button"
            className="primary-btn"
            onClick={onStartIntake}
          >
            Start with Intake
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
