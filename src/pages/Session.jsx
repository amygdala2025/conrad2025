// src/pages/Session.jsx
import { useState, useEffect } from "react";
import SudsReferenceTable from "./SudsReferenceTable";

function Session({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [sudsScale, setSudsScale] = useState(null);

  const [preSuds, setPreSuds] = useState(30);
  const [postSuds, setPostSuds] = useState(30);
  const [intensity, setIntensity] = useState(0.7);

  const [sessionId, setSessionId] = useState(null);
  const [story, setStory] = useState("");
  const [nextIntensity, setNextIntensity] = useState(null);

  const [hasReadStory, setHasReadStory] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    fetch(`${apiBase}/api/suds/scale`)
      .then((res) => res.json())
      .then((data) => setSudsScale(data.scale))
      .catch(() => {});
  }, [apiBase]);

  const renderScaleHint = (value) => {
    if (!sudsScale) return null;
    const scores = Object.keys(sudsScale).map((k) => Number(k));
    let closest = scores[0];
    let minDiff = Math.abs(value - closest);
    for (const s of scores) {
      const diff = Math.abs(value - s);
      if (diff < minDiff) {
        minDiff = diff;
        closest = s;
      }
    }
    return (
      <p className="help-text">
        Approximate description around {closest}: {sudsScale[closest]}
      </p>
    );
  };

  const startSession = async () => {
    setStatusMsg("");
    setStory("");
    setSessionId(null);
    setNextIntensity(null);
    setHasReadStory(false);

    if (!userId) {
      setStatusMsg("Please enter your User ID.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          suds_pre: preSuds,
          intensity,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to start story session");
      }

      const data = await res.json();
      setStory(data.story);
      setSessionId(data.session_id);
      setStatusMsg("Exposure story generated. Please read it carefully.");
    } catch (err) {
      setStatusMsg(`❌ Failed to start session: ${err.message}`);
    }
  };

  const submitPostSuds = async () => {
    if (!sessionId) {
      setStatusMsg("Please generate a story first.");
      return;
    }
    if (!hasReadStory) {
      setStatusMsg("Please confirm that you have read the story.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/suds/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          suds_score: postSuds,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to submit post-SUDS");
      }

      const data = await res.json();
      setNextIntensity(data.new_intensity);
      setStatusMsg("Post-SUDS score saved.");
    } catch (err) {
      setStatusMsg(`❌ Failed to submit post-SUDS: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Session – Exposure Story</h2>
      <p className="page-intro">
        In each session, you first record your pre-session SUDS, then read an
        exposure story based on your trauma narrative, and finally record your
        post-session SUDS. This information is used to adapt the intensity of
        the next session.
      </p>

      <div className="card">
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            placeholder="e.g., 33"
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>1. Pre-session SUDS (0–100)</label>
          <p className="help-text">
            Rate your current level of distress right now on a scale from 0 to
            100.
          </p>

          <input
            type="range"
            min="0"
            max="100"
            value={preSuds}
            onChange={(e) => setPreSuds(Number(e.target.value))}
          />
          <div className="range-labels">
            <span>0</span>
            <span>100</span>
          </div>

          <div className="range-number">
            <input
              type="number"
              min="0"
              max="100"
              value={preSuds}
              onChange={(e) => setPreSuds(Number(e.target.value))}
            />
            <span>pts</span>
          </div>

          {renderScaleHint(preSuds)}

          <div className="suds-help-block">
            <details>
              <summary>What do these numbers mean? (Open SUDS guide)</summary>
              <SudsReferenceTable />
            </details>
          </div>
        </div>

        <div className="field-group">
          <label>2. Story Intensity (LLM temperature)</label>
          <p className="help-text">
            This controls how intense/creative the exposure story will be. A
            higher value leads to a looser and often more intense story.
          </p>

          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
          />
          <p className="help-text">
            Current intensity: <b>{intensity.toFixed(2)}</b>
          </p>
        </div>

        <button type="button" className="primary-btn" onClick={startSession}>
          Generate Story
        </button>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
      </div>

      {story && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>3. Exposure Story</h3>
          <p className="story-text">{story}</p>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={hasReadStory}
              onChange={(e) => setHasReadStory(e.target.checked)}
            />
            <span>I have read the story from beginning to end.</span>
          </label>
        </div>
      )}

      {story && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="field-group">
            <label>4. Post-session SUDS (0–100)</label>
            <p className="help-text">
              Immediately after reading the story, rate your current level of
              distress again on a scale from 0 to 100.
            </p>

            <input
              type="range"
              min="0"
              max="100"
              value={postSuds}
              onChange={(e) => setPostSuds(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>0</span>
              <span>100</span>
            </div>

            <div className="range-number">
              <input
                type="number"
                min="0"
                max="100"
                value={postSuds}
                onChange={(e) => setPostSuds(Number(e.target.value))}
              />
              <span>pts</span>
            </div>

            {renderScaleHint(postSuds)}
          </div>

          <button
            type="button"
            className="secondary-btn"
            onClick={submitPostSuds}
          >
            Save Post-SUDS
          </button>

          {nextIntensity && (
            <p className="help-text" style={{ marginTop: 8 }}>
              Recommended intensity for the next session:{" "}
              <b>{nextIntensity.toFixed(2)}</b>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Session;
