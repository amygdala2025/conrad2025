// src/pages/Session.jsx
import { useState } from "react";

function Session({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [intensity, setIntensity] = useState(0.7);

  const [preSuds, setPreSuds] = useState("");
  const [postSuds, setPostSuds] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [story, setStory] = useState("");
  const [nextIntensity, setNextIntensity] = useState(null);

  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // 1) Pre-SUDS + intensity 보내서 story 생성
  const startStory = async () => {
    setError("");
    setStatusMsg("");

    if (!userId || preSuds === "") {
      setError("User ID and pre-session SUDS are required.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          suds_pre: Number(preSuds),
          intensity: Number(intensity),
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to start story session");
      }

      const data = await res.json();
      setSessionId(data.session_id);
      setStory(data.story);
      setStatusMsg(`Session started. Intensity used: ${data.intensity_used.toFixed(2)}`);
    } catch (e) {
      setError("Failed to start story session. Check backend / network.");
      console.error(e);
    }
  };

  // 2) story 읽은 후 post SUDS 기록 + 다음 intensity 추천받기
  const submitPostSuds = async () => {
    setError("");
    setStatusMsg("");

    if (!sessionId) {
      setError("No active session. Generate a story first.");
      return;
    }
    if (postSuds === "") {
      setError("Post-session SUDS is required.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/suds/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          suds_score: Number(postSuds),
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to submit post SUDS");
      }

      const data = await res.json();
      setNextIntensity(data.new_intensity);
      setIntensity(data.new_intensity);
      setStatusMsg("Post-SUDS recorded. Intensity updated for next session.");
    } catch (e) {
      setError("Failed to record post SUDS. Check backend / network.");
      console.error(e);
    }
  };

  return (
    <div>
      <h2>Session – Exposure Story</h2>
      <p>
        Enter your <b>User ID</b>, rate your distress (pre-SUDS), and generate an exposure
        story. After reading, enter post-SUDS to adapt the next session&apos;s intensity.
      </p>

      <div className="card">
        <label>
          User ID
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. user123"
          />
        </label>

        <label>
          Pre-session SUDS (0–100)
          <input
            type="number"
            min="0"
            max="100"
            value={preSuds}
            onChange={(e) => setPreSuds(e.target.value)}
          />
        </label>

        <label>
          Story intensity (LLM temperature)
          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.05"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
          />
          <span style={{ marginLeft: 8 }}>{intensity.toFixed(2)}</span>
        </label>

        <button onClick={startStory}>Generate Story</button>
      </div>

      {story && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <h3>Exposure Story</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{story}</p>

          <hr style={{ margin: "1rem 0" }} />

          <label>
            Post-session SUDS (0–100)
            <input
              type="number"
              min="0"
              max="100"
              value={postSuds}
              onChange={(e) => setPostSuds(e.target.value)}
            />
          </label>

          <button onClick={submitPostSuds}>Submit Post-SUDS &amp; Update Intensity</button>

          {nextIntensity !== null && (
            <p style={{ marginTop: "0.5rem" }}>
              ➡ Recommended intensity for next session:{" "}
              <b>{nextIntensity.toFixed(2)}</b>
            </p>
          )}
        </div>
      )}

      {statusMsg && (
        <p style={{ marginTop: "1rem", color: "#7dd3fc" }}>
          {statusMsg}
        </p>
      )}
      {error && (
        <p style={{ marginTop: "1rem", color: "#fca5a5" }}>
          ❌ {error}
        </p>
      )}
    </div>
  );
}

export default Session;
