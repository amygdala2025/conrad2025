import { useEffect, useState } from "react";
import SudsReferenceTable from "./SudsReferenceTable";

function Session({ apiBase }) {
  const [userId, setUserId] = useState("");

  const [preSuds, setPreSuds] = useState(30);
  const [postSuds, setPostSuds] = useState(30);
  const [intensity, setIntensity] = useState(0.7);

  const [sessionId, setSessionId] = useState(null);
  const [story, setStory] = useState("");
  const [nextIntensity, setNextIntensity] = useState(null);

  const [hasReadStory, setHasReadStory] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [sudsScale, setSudsScale] = useState(null);
  const [showSudsModal, setShowSudsModal] = useState(false);

  // 백엔드 SUDS 스케일 로드
  useEffect(() => {
    fetch(`${apiBase}/api/suds/scale`)
      .then((res) => res.json())
      .then((data) => setSudsScale(data.scale))
      .catch(() => {});
  }, [apiBase]);

  const getSudsHint = (value) => {
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
    return `${closest}: ${sudsScale[closest]}`;
  };

  // --------------------
  // 스토리 세션 시작
  // --------------------
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
    if (preSuds < 0 || preSuds > 100) {
      setStatusMsg("Pre-session SUDS must be between 0 and 100.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          // 🔥 백엔드 StoryRequest와 이름 맞추기
          pre_suds: preSuds,
          intensity,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.error("story error", errJson);
        const msg =
          errJson && errJson.detail
            ? typeof errJson.detail === "string"
              ? errJson.detail
              : JSON.stringify(errJson.detail)
            : "Failed to start story session.";
        throw new Error(msg);
      }

      const data = await res.json();
      setStory(data.story);
      setSessionId(data.session_id);
      setStatusMsg("Exposure story generated. Please read it carefully.");
    } catch (err) {
      setStatusMsg(
        `❌ Failed to start story session: ${
          err && err.message ? err.message : String(err)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------
  // post-SUDS 저장
  // --------------------
  const submitPost = async () => {
    setStatusMsg("");

    if (!sessionId) {
      setStatusMsg("Please generate a story first.");
      return;
    }
    if (!hasReadStory) {
      setStatusMsg("Please confirm that you have read the story to the end.");
      return;
    }
    if (postSuds < 0 || postSuds > 100) {
      setStatusMsg("Post-session SUDS must be between 0 and 100.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/suds/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          post_suds: postSuds,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.error("post-suds error", errJson);
        const msg =
          errJson && errJson.detail
            ? typeof errJson.detail === "string"
              ? errJson.detail
              : JSON.stringify(errJson.detail)
            : "Failed to submit post-SUDS.";
        throw new Error(msg);
      }

      const data = await res.json();
      setNextIntensity(data.next_intensity);
      setStatusMsg("Post-session SUDS saved.");
    } catch (err) {
      setStatusMsg(
        `❌ Failed to submit post-SUDS: ${
          err && err.message ? err.message : String(err)
        }`
      );
    }
  };

  return (
    <>
      <div>
        <h2>Session – Exposure Story</h2>
        <p className="page-intro">
          In each session, you first rate your current distress (pre-SUDS),
          then read a personalized exposure story, and finally rate your
          distress again (post-SUDS). The system adapts the intensity of
          future stories based on how your SUDS scores change over time.
        </p>

        {/* SUDS 도움말 링크 */}
        <button
          type="button"
          className="inline-link-btn"
          onClick={() => setShowSudsModal(true)}
        >
          What is SUDS? (open reference table)
        </button>

        {/* 세션 입력 카드 */}
        <div className="card" style={{ marginTop: 12 }}>
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
              Rate how distressed you feel right now, before reading the story.
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
                onChange={(e) =>
                  setPreSuds(
                    Number.isNaN(Number(e.target.value))
                      ? 0
                      : Number(e.target.value)
                  )
                }
              />
              <span>pts</span>
            </div>

            {sudsScale && (
              <p className="help-text">Hint: {getSudsHint(preSuds)}</p>
            )}
          </div>

          <div className="field-group">
            <label>2. Story Intensity (LLM temperature)</label>
            <p className="help-text">
              Controls how intense and detailed the narrative becomes. Higher
              values tend to produce more varied, emotionally vivid stories.
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

          <button
            type="button"
            className="primary-btn"
            onClick={startSession}
            disabled={isLoading}
          >
            {isLoading ? "Generating story..." : "Generate Story"}
          </button>

          {statusMsg && <p className="status-text">{statusMsg}</p>}
        </div>

        {/* 스토리 출력 */}
        {story && (
          <div className="card">
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

        {/* post-SUDS 입력 */}
        {story && (
          <div className="card">
            <div className="field-group">
              <label>4. Post-session SUDS (0–100)</label>
              <p className="help-text">
                Immediately after finishing the story, rate how distressed you
                feel now.
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
                  onChange={(e) =>
                    setPostSuds(
                      Number.isNaN(Number(e.target.value))
                        ? 0
                        : Number(e.target.value)
                    )
                  }
                />
                <span>pts</span>
              </div>

              {sudsScale && (
                <p className="help-text">Hint: {getSudsHint(postSuds)}</p>
              )}
            </div>

            <button
              type="button"
              className="secondary-btn"
              onClick={submitPost}
            >
              Save Post-SUDS
            </button>

            {nextIntensity != null && (
              <p className="help-text" style={{ marginTop: 8 }}>
                ➡ Recommended intensity for the next session:&nbsp;
                <b>{nextIntensity.toFixed(2)}</b>
              </p>
            )}
          </div>
        )}
      </div>

      {/* SUDS reference modal */}
      {showSudsModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowSudsModal(false)}
        >
          <div
            className="modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>SUDS Distress Scale Reference</h3>
                <p>
                  Use this table as a guide when choosing your SUDS scores.
                  The goal is not to be perfect, but to be roughly consistent
                  from session to session.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowSudsModal(false)}
              >
                ✕
              </button>
            </div>

            <SudsReferenceTable />
          </div>
        </div>
      )}
    </>
  );
}

export default Session;
