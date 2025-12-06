// src/pages/Session.jsx
import { useState, useEffect } from "react";
import SudsReferenceTable from "./SudsReferenceTable";

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

// Safely resolve API base URL
function resolveApiBase(passedBase) {
  if (passedBase && typeof passedBase === "string") {
    return passedBase.replace(/\/+$/, "");
  }
  if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");
  }
  return window.location.origin.replace(/\/+$/, "");
}

function Session({ apiBase }) {
  const base = resolveApiBase(apiBase);
  console.log("Session apiBase resolved =", base);

  const [userId, setUserId] = useState(
    localStorage.getItem("ptsd_user_id") || ""
  );
  const [preSuds, setPreSuds] = useState(0);
  const [intensity, setIntensity] = useState(0.8);
  const [story, setStory] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loadingStory, setLoadingStory] = useState(false);

  const [postSuds, setPostSuds] = useState(0);
  const [hasReadStory, setHasReadStory] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [postSaved, setPostSaved] = useState(false);

  const [sudsScale, setSudsScale] = useState({});

  useEffect(() => {
    // Load SUDS scale from backend (for reference)
    const fetchScale = async () => {
      try {
        const res = await fetch(`${base}/api/suds/scale`);
        if (!res.ok) return;
        const data = await res.json();
        setSudsScale(data.scale || {});
      } catch {
        // Non-critical, ignore
      }
    };
    fetchScale();
  }, [base]);

  const onChangeUserId = (e) => {
    setUserId(e.target.value);
    localStorage.setItem("ptsd_user_id", e.target.value);
  };

  const describeSuds = (value) => {
    if (!sudsScale) return null;
    const keys = Object.keys(sudsScale).map((k) => parseInt(k, 10));
    if (keys.length === 0) return null;
    let closest = keys[0];
    let bestDiff = Math.abs(value - closest);
    for (const k of keys) {
      const diff = Math.abs(value - k);
      if (diff < bestDiff) {
        bestDiff = diff;
        closest = k;
      }
    }
    return (
      <p className="help-text">
        Description near {closest}: {sudsScale[closest]}
      </p>
    );
  };

  // ---------------------------
  // 1) Generate exposure story
  // ---------------------------
  const generateStory = async () => {
    setStatusMsg("");
    setStory("");
    setSessionId("");
    setHasReadStory(false);
    setPostSaved(false);

    if (!userId) {
      setStatusMsg("❌ Please enter your User ID first.");
      return;
    }

    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg(
        "❌ No token found. Please complete Intake / Login before starting a session."
      );
      return;
    }

    const clampedPre = clamp(preSuds, 0, 100);
    const clampedIntensity = clamp(intensity, 0.2, 1.5);

    setLoadingStory(true);
    try {
      const res = await fetch(`${base}/api/story`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": token,
        },
        body: JSON.stringify({
          user_id: userId,
          pre_suds: clampedPre,
          intensity: clampedIntensity,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setStory(data.story || "");
      setSessionId(data.session_id || "");
      setIntensity(data.intensity ?? clampedIntensity);
      setStatusMsg(
        "✅ Exposure story has been generated. Please read it slowly from beginning to end."
      );
    } catch (err) {
      setStatusMsg(`❌ Failed to generate story: ${err.message}`);
    } finally {
      setLoadingStory(false);
    }
  };

  // ---------------------------
  // 2) Save post-SUDS
  // ---------------------------
  const savePostSuds = async () => {
    setStatusMsg("");
    setPostSaved(false);

    if (!sessionId) {
      setStatusMsg("❌ Please generate a story first.");
      return;
    }
    if (!hasReadStory) {
      setStatusMsg(
        "❌ Please check the box confirming that you have read the story from start to finish."
      );
      return;
    }

    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg(
        "❌ No token found. Please log in / complete Intake again and retry."
      );
      return;
    }

    const clampedPost = clamp(postSuds, 0, 100);

    setSavingPost(true);
    try {
      const res = await fetch(`${base}/api/suds/post`, {
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
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setPostSaved(true);
      setStatusMsg(
        `✅ Post-SUDS saved. (pre: ${data.pre_suds}, post: ${data.post_suds}, next intensity: ${data.next_intensity.toFixed(
          2
        )})`
      );
      setIntensity(data.next_intensity);
    } catch (err) {
      setStatusMsg(`❌ Failed to save post-SUDS: ${err.message}`);
    } finally {
      setSavingPost(false);
    }
  };

  return (
    <div className="page">
      <h1>Session</h1>
      <p className="page-intro">
        In this page, you set your current SUDS and intensity, generate an
        exposure story, read it, and then record your post-exposure SUDS.
      </p>

      {/* Top: User ID + SUDS + intensity */}
      <div className="card">
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            onChange={onChangeUserId}
            placeholder="User ID used in Intake"
          />
        </div>

        <div className="field-group">
          <label>Current SUDS (pre)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={preSuds}
            onChange={(e) => setPreSuds(Number(e.target.value) || 0)}
          />
          {describeSuds(preSuds)}
        </div>

        <div className="field-group">
          <label>Exposure intensity (0.2 – 1.5)</label>
          <input
            type="number"
            step="0.1"
            min={0.2}
            max={1.5}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value) || 0.8)}
          />
          <p className="help-text">
            Use 1.0 as a baseline. Values closer to 0.2 make the story gentler;
            values closer to 1.5 make it somewhat stronger.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={generateStory}
          disabled={loadingStory}
        >
          {loadingStory ? "Generating…" : "Generate exposure story"}
        </button>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
      </div>

      {/* Generated story + Post SUDS input */}
      <div className="card" style={{ marginTop: 24 }}>
        <p className="help-text">
          Read the exposure story slowly, ideally more than once. You may feel
          an urge to avoid or stop reading; try to stay with the story until the
          end, as this is the core of exposure therapy.
        </p>

        <div className="story-box">
          {story ? <p className="story-text">{story}</p> : <p>(no story yet)</p>}
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
          <label>Post-exposure SUDS (post)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={postSuds}
            onChange={(e) => setPostSuds(Number(e.target.value) || 0)}
          />
          {describeSuds(postSuds)}
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={savePostSuds}
          disabled={savingPost}
        >
          {savingPost ? "Saving…" : "Save post-SUDS"}
        </button>

        {postSaved && (
          <p className="help-text">
            Post-SUDS has been saved. You can use the suggested next intensity
            for your next session.
          </p>
        )}
      </div>

      {/* SUDS Reference Table */}
      <div className="card" style={{ marginTop: 24 }}>
        <h2>SUDS Reference</h2>
        <SudsReferenceTable sudsScale={sudsScale} />
      </div>
    </div>
  );
}

export default Session;
