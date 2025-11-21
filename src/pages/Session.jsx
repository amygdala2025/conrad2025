// src/pages/Session.jsx
import { useEffect, useState } from "react";

const DEMO_USER_ID = "demo-user";

function Session({ apiBase }) {
  const [sudsScale, setSudsScale] = useState({});
  const [currentSuds, setCurrentSuds] = useState(0);
  const [story, setStory] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState("");
  const [intensity, setIntensity] = useState(0.7); // temperature 초기값
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    const loadScale = async () => {
      try {
        const res = await fetch(`${apiBase}/api/suds/scale`);
        const data = await res.json();
        setSudsScale(data.scale || {});
      } catch (e) {
        console.error(e);
      }
    };

    // 사용자의 키워드는 dashboard/trauma에서 불러와도 되지만
    // 지금은 단순화를 위해 mock
    setKeywords(["car", "night", "rain", "accident"]);
    loadScale();
  }, [apiBase]);

  const handleNewStory = async () => {
    setStatus("Requesting new story from backend...");
    setStory("");
    setSessionId(null);

    try {
      const res = await fetch(`${apiBase}/api/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: DEMO_USER_ID,
          keywords,
          intensity,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate story");
      const data = await res.json();

      setStory(data.story);
      setSessionId(data.session_id);
      setStatus(
        `✅ Story generated (session_id=${data.session_id}). Current intensity: ${intensity.toFixed(
          2
        )}`
      );
    } catch (e) {
      console.error(e);
      setStatus("❌ Failed to generate story. Check backend / HuggingFace.");
    }
  };

  const handleRecordPre = async () => {
    if (!sessionId) {
      setStatus("⚠️ Start a story first.");
      return;
    }
    setStatus("Recording pre-session SUDS...");

    try {
      const res = await fetch(`${apiBase}/api/suds/pre`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          suds_score: currentSuds,
        }),
      });
      if (!res.ok) throw new Error("Error recording pre SUDS");
      await res.json();
      setStatus(`✅ Pre-session SUDS recorded: ${currentSuds}`);
    } catch (e) {
      console.error(e);
      setStatus("❌ Failed to record pre-session SUDS.");
    }
  };

  const handleRecordPost = async () => {
    if (!sessionId) {
      setStatus("⚠️ Start a story first.");
      return;
    }
    setStatus("Recording post-session SUDS...");

    try {
      const res = await fetch(`${apiBase}/api/suds/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          suds_score: currentSuds,
        }),
      });

      if (!res.ok) throw new Error("Error recording post SUDS");
      const data = await res.json();
      setStatus(
        `✅ Post-session SUDS recorded: ${currentSuds}. Next intensity suggested: ${data.new_intensity.toFixed(
          2
        )}`
      );
      setIntensity(data.new_intensity);
    } catch (e) {
      console.error(e);
      setStatus("❌ Failed to record post-session SUDS.");
    }
  };

  return (
    <div className="panel">
      <h2>Session – Adaptive Exposure Story</h2>

      <div className="card">
        <h3>1. SUDS Scale (0–100)</h3>
        <p className="sub">
          Use this thermometer to rate your current distress level. 0 means no distress, 100 means the
          worst distress you can imagine.
        </p>

        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={currentSuds}
          onChange={(e) => setCurrentSuds(parseInt(e.target.value))}
          className="suds-slider"
        />
        <div className="suds-scale-labels">
          {Object.entries(sudsScale).map(([score, label]) => (
            <div key={score} className="suds-label-item">
              <span className="suds-score">{score}</span>
              <span className="suds-desc">{label}</span>
            </div>
          ))}
        </div>

        <div className="suds-current">
          Current SUDS: <b>{currentSuds}</b>
        </div>
      </div>

      <div className="card">
        <h3>2. Story Generation</h3>
        <p className="sub">
          Current intensity (LLM temperature): <b>{intensity.toFixed(2)}</b>
        </p>
        <button className="primary-btn" onClick={handleNewStory}>
          Start / Next Story
        </button>

        {story && (
          <div className="story-box">
            <h4>Exposure Story</h4>
            <p>{story}</p>
          </div>
        )}

        <div className="btn-row">
          <button className="secondary-btn" onClick={handleRecordPre}>
            Save Pre-session SUDS
          </button>
          <button className="secondary-btn" onClick={handleRecordPost}>
            Save Post-session SUDS & Update Intensity
          </button>
        </div>
      </div>

      <div className="status-text">{status}</div>
    </div>
  );
}

export default Session;
