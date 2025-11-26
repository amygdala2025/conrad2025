// src/pages/Session.jsx
import { useState, useEffect } from "react";
import SudsReferenceTable from "./SudsReferenceTable";

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function Session({ apiBase }) {
  const [userId, setUserId] = useState(
    localStorage.getItem("ptsd_user_id") || ""
  );
  const [preSuds, setPreSuds] = useState(0);
  const [intensity, setIntensity] = useState(0.8);
  const [story, setStory] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [postSuds, setPostSuds] = useState(0);

  const [hasReadStory, setHasReadStory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [postSaved, setPostSaved] = useState(false);

  const [sudsScale, setSudsScale] = useState({});
  const [statusMsg, setStatusMsg] = useState("");

  // Load SUDS scale
  useEffect(() => {
    const loadScale = async () => {
      try {
        const res = await fetch(`${apiBase}/api/suds/scale`);
        const data = await res.json();
        setSudsScale(data.scale || {});
      } catch {
        // silently ignore (nice-to-have only)
      }
    };
    loadScale();
  }, [apiBase]);

  // Persist userId in localStorage
  useEffect(() => {
    if (userId) {
      localStorage.setItem("ptsd_user_id", userId);
    }
  }, [userId]);

  const renderScaleHint = (value) => {
    if (!sudsScale || Object.keys(sudsScale).length === 0) return null;
    const keys = Object.keys(sudsScale).map((k) => Number(k));
    let closest = keys[0];
    let bestDiff = Math.abs(value - closest);
    for (const s of keys) {
      const diff = Math.abs(value - s);
      if (diff < bestDiff) {
        bestDiff = diff;
        closest = s;
      }
    }
    return (
      <p className="help-text">
        Description near {closest}: {sudsScale[closest]}
      </p>
    );
  };

  // ---------------------------
  // 1) Generate Story
  // ---------------------------
  const generateStory = async () => {
    setStatusMsg("");
    setStory("");
    setSessionId("");
    setHasReadStory(false);
    setPostSaved(false);

    if (!userId) {
      setStatusMsg("❌ Please enter a User ID first.");
      return;
    }

    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg("❌ No auth token found. Please complete the Intake step first.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch(`${apiBase}/api/story`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": token,
        },
        body: JSON.stringify({
          user_id: userId,
          pre_suds: clamp(preSuds, 0, 100),
          intensity,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg = errJson?.detail || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      const data = await res.json();
      setStory(data.story || "");
      setSessionId(data.session_id || "");
      setStatusMsg(
        "✔ Story generated. Please read it slowly from start to finish."
      );
    } catch (err) {
      setStatusMsg(
        `❌ Failed to start story session: ${
          err?.message ? err.message : String(err)
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------------------------
  // 2) Save Post-SUDS
  // ---------------------------
  const savePostSuds = async () => {
    if (!sessionId) {
      setStatusMsg("❌ Please generate a story first.");
      return;
    }
    if (!hasReadStory) {
      setStatusMsg(
        "❌ Please check the box confirming you have read the story all the way through."
      );
      return;
    }

    const clampedPost = clamp(postSuds, 0, 100);
    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg("❌ No auth token found.");
      return;
    }

    setIsSavingPost(true);
    setPostSaved(false);
    try {
      const res = await fetch(`${apiBase}/api/suds/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": token,
        },
        body: JSON.stringify({
          session_id: sessionId,
          post_suds: clampedPost,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg = errJson?.detail || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      await res.json();
      setStatusMsg("✔ Post-session SUDS has been saved.");
      setPostSaved(true);
    } catch (e) {
      setStatusMsg("❌ Failed to save post-SUDS: " + e.message);
    } finally {
      setIsSavingPost(false);
    }
  };

  return (
    <div>
      <h2>Session – Exposure Story</h2>
      <p className="page-intro">
        At each session you first record your current SUDS score, then read a
        trauma-based exposure story, and finally rate your SUDS again. These
        data are used to adjust the story intensity for the next session.
      </p>

      <div className="card">
        {/* User ID */}
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            placeholder="e.g., 0001"
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        {/* Pre-session SUDS */}
        <div className="field-group">
          <label>1. Pre-session SUDS (0–100)</label>
          <p className="help-text">
            Please rate your current level of anxiety/tension from 0 to 100.
          </p>

          <input
            type="range"
            min="0"
            max="100"
            value={preSuds}
            onChange={(e) => setPreSuds(clamp(Number(e.target.value), 0, 100))}
          />
          <div className="range-labels">
            <span>0 = totally calm</span>
            <span>100 = worst distress you can imagine</span>
          </div>

          <div className="range-number">
            <input
              type="number"
              min="0"
              max="100"
              value={preSuds}
              onChange={(e) =>
                setPreSuds(clamp(Number(e.target.value || 0), 0, 100))
              }
            />
            <span>pts</span>
          </div>

          {renderScaleHint(preSuds)}

          <div className="suds-help-block">
            <details>
              <summary>
                What do these numbers mean? (View example SUDS scale)
              </summary>
              <SudsReferenceTable />
            </details>
          </div>
        </div>

        {/* Story Intensity */}
        <div className="field-group">
          <label>2. Story Intensity (LLM temperature)</label>
          <p className="help-text">
            Controls how intense the exposure story feels. Higher values produce
            freer and more emotionally intense stories.
          </p>

          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.02"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
          />
          <p className="help-text">
            Current intensity: {intensity.toFixed(2)} – Higher values → more
            varied and emotionally vivid stories.
          </p>
        </div>

        {/* Generate Story button */}
        <div className="field-group">
          <button
            type="button"
            className="primary-btn"
            onClick={generateStory}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Story"}
          </button>
        </div>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
      </div>

      {/* Story area + Post SUDS */}
      {sessionId && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3>Exposure Story</h3>
          <p className="help-text">
            Please read the story slowly, paying attention to any emotions and
            body sensations that arise as you go.
          </p>

          <div className="story-box">
            {story ? <p className="story-text">{story}</p> : <p>(story missing)</p>}
          </div>

          <div className="field-group" style={{ marginTop: 16 }}>
            <label>
              <input
                type="checkbox"
                checked={hasReadStory}
                onChange={(e) => setHasReadStory(e.target.checked)}
              />{" "}
              I have read the story from beginning to end.
            </label>
          </div>

          <div className="field-group">
            <label>3. Post-session SUDS (0–100)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={postSuds}
              onChange={(e) =>
                setPostSuds(clamp(Number(e.target.value), 0, 100))
              }
            />
            <div className="range-number">
              <input
                type="number"
                min="0"
                max="100"
                value={postSuds}
                onChange={(e) =>
                  setPostSuds(clamp(Number(e.target.value || 0), 0, 100))
                }
              />
              <span>pts</span>
            </div>
          </div>

          <div className="field-group">
            <button
              type="button"
              className="primary-btn"
              onClick={savePostSuds}
              disabled={isSavingPost}
            >
              {postSaved
                ? "Saved ✅"
                : isSavingPost
                ? "Saving..."
                : "Save Post SUDS"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Session;
