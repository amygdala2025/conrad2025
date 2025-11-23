import { useState } from "react";
import SudsModal from "../SudsModal";
import SudsReferenceTable from "../SudsReferenceTable";

function Session({ apiBase }) {
  const [userId, setUserId] = useState(localStorage.getItem("ptsd_user_id") || "");
  const [preSuds, setPreSuds] = useState(0);
  const [intensity, setIntensity] = useState(0.7);
  const [story, setStory] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [postSuds, setPostSuds] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  // ---------------------------
  // 1) Generate Story
  // ---------------------------

  const generateStory = async () => {
    setStatusMsg("");

    if (!userId) {
      setStatusMsg("❌ User ID missing.");
      return;
    }

    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg("❌ No auth token found. Complete intake first.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/story`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": token, // ★ 토큰 추가!
        },
        body: JSON.stringify({
          user_id: userId,
          pre_suds: preSuds,
          intensity,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg =
          errJson?.detail ||
          `HTTP ${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      const data = await res.json();
      setStory(data.story || "");
      setSessionId(data.session_id || "");
      setStatusMsg("✔ Story generated.");
    } catch (err) {
      setStatusMsg(
        `❌ Failed to start story session: ${
          err?.message ? err.message : String(err)
        }`
      );
    }
  };

  // ---------------------------
  // 2) Save Post-SUDS
  // ---------------------------

  const savePostSuds = async () => {
    if (!sessionId) {
      setStatusMsg("❌ No session ID found. Generate a story first.");
      return;
    }
    if (postSuds === null) {
      setStatusMsg("❌ Please enter post-session SUDS score.");
      return;
    }

    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg("❌ No auth token found.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/suds/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": token, // ★ 토큰 추가!
        },
        body: JSON.stringify({
          session_id: sessionId,
          post_suds: postSuds,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg = errJson?.detail || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const data = await res.json();
      setStatusMsg("✔ Post-SUDS saved.");
    } catch (e) {
      setStatusMsg("❌ Failed to save post-SUDS: " + e.message);
    }
  };

  return (
    <div>
      <h2>Session – Exposure Story</h2>

      <div className="card">
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            placeholder="0001"
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>
            Pre-Session SUDS (0–100){" "}
            <span
              className="suds-hint"
              onClick={() => setShowModal(true)}
              style={{ color: "#7aa2ff", cursor: "pointer", marginLeft: "6px" }}
            >
              [What is this?]
            </span>
          </label>

          <input
            type="number"
            min={0}
            max={100}
            value={preSuds}
            onChange={(e) => setPreSuds(parseInt(e.target.value))}
          />
        </div>

        <div className="field-group">
          <label>Story Intensity (LLM temperature)</label>
          <input
            type="range"
            min={0.2}
            max={1.5}
            step={0.01}
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="slider"
          />
          <div>Current intensity: <b>{intensity.toFixed(2)}</b></div>
        </div>

        <button className="primary-btn" onClick={generateStory}>
          Generate Story
        </button>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
      </div>

      {story && (
        <div className="card">
          <h3>Exposure Story</h3>
          <p className="story-box">{story}</p>

          <div className="field-group" style={{ marginTop: "18px" }}>
            <label>Post-Session SUDS</label>
            <input
              type="number"
              min={0}
              max={100}
              value={postSuds || ""}
              onChange={(e) => setPostSuds(parseInt(e.target.value))}
            />
          </div>

          <button className="primary-btn" onClick={savePostSuds}>
            Save Post SUDS
          </button>
        </div>
      )}

      {showModal && (
        <SudsModal onClose={() => setShowModal(false)}>
          <SudsReferenceTable />
        </SudsModal>
      )}
    </div>
  );
}

export default Session;
