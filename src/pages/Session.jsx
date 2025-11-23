import { useState } from "react";
import SudsModal from "./SudsModal";
import SudsReferenceTable from "./SudsReferenceTable";

function Session({ apiBase }) {
  const [userId, setUserId] = useState(
    localStorage.getItem("ptsd_user_id") || ""
  );
  const [preSuds, setPreSuds] = useState(0);
  const [intensity, setIntensity] = useState(0.7);
  const [story, setStory] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [postSuds, setPostSuds] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [readConfirmed, setReadConfirmed] = useState(null); // "yes" | "no" | null

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

    setIsGenerating(true);
    setStory("");
    setSessionId("");
    setReadConfirmed(null);
    setPostSuds(0);

    try {
      const res = await fetch(`${apiBase}/api/story`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": token,
        },
        body: JSON.stringify({
          user_id: userId,
          pre_suds: preSuds,
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
      setStatusMsg("✔ Exposure story generated. Please read it carefully.");
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
      setStatusMsg("❌ No session ID found. Generate a story first.");
      return;
    }
    if (readConfirmed !== "yes") {
      setStatusMsg(
        "❌ Please confirm that you have read the exposure story from start to finish."
      );
      return;
    }

    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg("❌ No auth token found.");
      return;
    }

    setIsSavingPost(true);

    try {
      const res = await fetch(`${apiBase}/api/suds/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": token,
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

      await res.json();
      setStatusMsg("✔ Post-session SUDS saved.");
    } catch (e) {
      setStatusMsg("❌ Failed to save post-SUDS: " + e.message);
    } finally {
      setIsSavingPost(false);
    }
  };

  return (
    <div>
      <h2>Session – Exposure Story</h2>

      {/* --------- SESSION SETUP CARD --------- */}
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

        {/* PRE-SUDS SLIDER */}
        <div className="field-group">
          <label>
            1. Pre-session SUDS (0–100)
            <span
              className="suds-hint"
              onClick={() => setShowModal(true)}
              style={{ color: "#7aa2ff", cursor: "pointer", marginLeft: "6px" }}
            >
              [What is this?]
            </span>
          </label>

          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={preSuds}
            onChange={(e) => setPreSuds(parseInt(e.target.value, 10))}
            className="slider"
          />
          <div className="slider-meta">
            <span className="slider-value">{preSuds}</span>
            <span className="slider-caption">
              0 = totally calm · 100 = worst distress you can imagine
            </span>
          </div>
        </div>

        {/* INTENSITY SLIDER */}
        <div className="field-group">
          <label>2. Story Intensity (LLM temperature)</label>
          <input
            type="range"
            min={0.2}
            max={1.5}
            step={0.01}
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="slider"
          />
          <div className="slider-meta">
            <span className="slider-value">{intensity.toFixed(2)}</span>
            <span className="slider-caption">
              Higher values → more varied and emotionally vivid stories.
            </span>
          </div>
        </div>

        <button
          className={`primary-btn ${isGenerating ? "btn-loading" : ""}`}
          onClick={generateStory}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating story..." : "Generate Story"}
        </button>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
      </div>

      {/* --------- STORY & POST-SUDS CARD --------- */}
      {story && (
        <div className="card">
          <h3>3. Exposure Story</h3>
          <p className="story-box">{story}</p>

          {/* READ CONFIRMATION */}
          <div className="field-group" style={{ marginTop: "18px" }}>
            <label>Have you read this story carefully from beginning to end?</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="read-confirm"
                  value="yes"
                  checked={readConfirmed === "yes"}
                  onChange={() => setReadConfirmed("yes")}
                />
                Yes, I read it carefully.
              </label>
              <label style={{ marginLeft: "16px" }}>
                <input
                  type="radio"
                  name="read-confirm"
                  value="no"
                  checked={readConfirmed === "no"}
                  onChange={() => setReadConfirmed("no")}
                />
                Not yet / I skimmed it.
              </label>
            </div>
          </div>

          {/* POST-SUDS SLIDER */}
          <div className="field-group" style={{ marginTop: "10px" }}>
            <label>4. Post-session SUDS (0–100)</label>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={postSuds}
              onChange={(e) => setPostSuds(parseInt(e.target.value, 10))}
              className="slider"
            />
            <div className="slider-meta">
              <span className="slider-value">{postSuds}</span>
              <span className="slider-caption">
                Rate how distressed you feel right now, after reading.
              </span>
            </div>
          </div>

          <button
            className={`primary-btn ${isSavingPost ? "btn-loading" : ""}`}
            onClick={savePostSuds}
            disabled={isSavingPost}
          >
            {isSavingPost ? "Saving..." : "Save Post SUDS"}
          </button>
        </div>
      )}

      {/* --------- SUDS HELP MODAL --------- */}
      {showModal && (
        <SudsModal onClose={() => setShowModal(false)}>
          <SudsReferenceTable />
        </SudsModal>
      )}
    </div>
  );
}

export default Session;
