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

  // SUDS scale 불러오기
  useEffect(() => {
    const loadScale = async () => {
      try {
        const res = await fetch(`${apiBase}/api/suds/scale`);
        const data = await res.json();
        setSudsScale(data.scale || {});
      } catch {
        // 조용히 무시 (필수는 아님)
      }
    };
    loadScale();
  }, [apiBase]);

  // userId 로컬스토리지에 저장
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
        {closest}점 근처 설명: {sudsScale[closest]}
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
      setStatusMsg("❌ User ID를 먼저 입력해주세요.");
      return;
    }

    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg("❌ 인증 토큰이 없습니다. Intake를 먼저 완료해주세요.");
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
      setStatusMsg("✔ 스토리가 생성되었습니다. 천천히 처음부터 끝까지 읽어 주세요.");
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
      setStatusMsg("❌ 먼저 스토리를 생성해주세요.");
      return;
    }
    if (!hasReadStory) {
      setStatusMsg("❌ 스토리를 끝까지 읽었다는 체크박스를 먼저 선택해주세요.");
      return;
    }

    const clampedPost = clamp(postSuds, 0, 100);
    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg("❌ 인증 토큰이 없습니다.");
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
      setStatusMsg("✔ Post-session SUDS가 저장되었습니다.");
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
        세션마다 현재의 SUDS 점수를 기록한 뒤, 트라우마 기반 노출 스토리를 읽고
        다시 SUDS를 평가합니다. 이 정보는 다음 세션의 intensity를 조정하는 데
        사용됩니다.
      </p>

      <div className="card">
        {/* User ID */}
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            placeholder="예: 0001"
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        {/* Pre-session SUDS */}
        <div className="field-group">
          <label>1. Pre-session SUDS (0–100)</label>
          <p className="help-text">
            지금 이 순간의 불안/긴장 정도를 0–100 사이 숫자로 표시해주세요.
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
            <span>점</span>
          </div>

          {renderScaleHint(preSuds)}

          <div className="suds-help-block">
            <details>
              <summary>이 숫자들은 어떤 의미인가요? (SUDS 예시 표 보기)</summary>
              <SudsReferenceTable />
            </details>
          </div>
        </div>

        {/* Story Intensity */}
        <div className="field-group">
          <label>2. Story Intensity (LLM temperature)</label>
          <p className="help-text">
            노출 스토리의 강도를 조절합니다. 값이 높을수록 더 자유롭고 강한
            스토리가 생성됩니다.
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
            현재 intensity: {intensity.toFixed(2)} – Higher values → more varied
            and emotionally vivid stories.
          </p>
        </div>

        {/* Generate Story 버튼 */}
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

      {/* Story 영역 + Post SUDS */}
      {sessionId && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3>Exposure Story</h3>
          <p className="help-text">
            아래 스토리를 천천히, 중간에 생기는 감정과 신체 감각을 알아차리면서
            읽어주세요.
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
              이야기를 처음부터 끝까지 읽었습니다.
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
              <span>점</span>
            </div>
          </div>

          <div className="field-group">
            <button
              type="button"
              className="primary-btn"
              onClick={savePostSuds}
              disabled={isSavingPost}
            >
              {postSaved ? "Saved ✅" : isSavingPost ? "Saving..." : "Save Post SUDS"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Session;
