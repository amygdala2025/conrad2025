// src/Session.jsx
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
        {closest}점 근처 설명: {sudsScale[closest]}
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
      setStatusMsg("User ID를 입력해주세요.");
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
      setStatusMsg("스토리가 생성되었습니다. 천천히 읽어 주세요.");
    } catch (err) {
      setStatusMsg(`❌ 세션 시작에 실패했습니다: ${err.message}`);
    }
  };

  const submitPostSuds = async () => {
    if (!sessionId) {
      setStatusMsg("먼저 스토리를 생성해주세요.");
      return;
    }
    if (!hasReadStory) {
      setStatusMsg("이야기를 모두 읽었다는 체크박스를 먼저 선택해주세요.");
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
      setStatusMsg("Post-SUDS가 저장되었습니다.");
    } catch (err) {
      setStatusMsg(`❌ Post-SUDS 전송에 실패했습니다: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Session – Exposure Story</h2>
      <p className="page-intro">
        세션마다 현재의 SUDS 점수를 기록한 후, 트라우마 기반 노출 스토리를 읽고
        다시 SUDS를 평가합니다. 이 정보는 다음 세션의 intensity를 조정하는 데 사용됩니다.
      </p>

      <div className="card">
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            placeholder="예: 33"
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

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
            <span>점</span>
          </div>

          {renderScaleHint(preSuds)}

          <div className="suds-help-block">
            <details>
              <summary>이 숫자들은 어떤 의미인가요? (SUDS 예시 표 열기)</summary>
              <SudsReferenceTable />
            </details>
          </div>
        </div>

        <div className="field-group">
          <label>2. Story Intensity (LLM temperature)</label>
          <p className="help-text">
            현재 세션에서 사용할 노출 스토리의 강도입니다. 숫자가 높을수록 더
            자유롭고 강한 스토리가 생성됩니다.
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
            현재 intensity: <b>{intensity.toFixed(2)}</b>
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
            <span>이야기를 처음부터 끝까지 읽었습니다.</span>
          </label>
        </div>
      )}

      {story && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="field-group">
            <label>4. Post-session SUDS (0–100)</label>
            <p className="help-text">
              이야기를 읽고 난 직후, 지금의 불안/긴장 정도를 0–100으로 다시 평가해주세요.
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
              <span>점</span>
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
              다음 세션 추천 intensity:{" "}
              <b>{nextIntensity.toFixed(2)}</b>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Session;
