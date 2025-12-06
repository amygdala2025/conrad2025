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
  const [statusMsg, setStatusMsg] = useState("");
  const [loadingStory, setLoadingStory] = useState(false);

  const [postSuds, setPostSuds] = useState(0);
  const [hasReadStory, setHasReadStory] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [postSaved, setPostSaved] = useState(false);

  const [sudsScale, setSudsScale] = useState({});

  useEffect(() => {
    // 백엔드에서 SUDS scale 가져오기 (참고용)
    const fetchScale = async () => {
      try {
        const res = await fetch(`${apiBase}/api/suds/scale`);
        if (!res.ok) return;
        const data = await res.json();
        setSudsScale(data.scale || {});
      } catch {
        // 무시 (필수는 아님)
      }
    };
    fetchScale();
  }, [apiBase]);

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
  // 1) Story 생성 요청
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
      setStatusMsg("❌ 토큰이 없습니다. Intake/로그인 단계부터 진행해주세요.");
      return;
    }

    const clampedPre = clamp(preSuds, 0, 100);
    const clampedIntensity = clamp(intensity, 0.2, 1.5);

    setLoadingStory(true);
    try {
      const res = await fetch(`${apiBase}/api/story`, {
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
      setStatusMsg("✅ 노출 스토리가 생성되었습니다. 천천히 끝까지 읽어주세요.");
    } catch (err) {
      setStatusMsg(`❌ Failed to generate story: ${err.message}`);
    } finally {
      setLoadingStory(false);
    }
  };

  // ---------------------------
  // 2) Post SUDS 저장
  // ---------------------------
  const savePostSuds = async () => {
    setStatusMsg("");
    setPostSaved(false);

    if (!sessionId) {
      setStatusMsg("❌ 먼저 스토리를 생성해야 합니다.");
      return;
    }
    if (!hasReadStory) {
      setStatusMsg(
        "❌ 스토리를 끝까지 읽었다는 체크박스를 먼저 확인해주세요."
      );
      return;
    }

    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg("❌ 토큰이 없습니다. 다시 로그인/Intake를 해주세요.");
      return;
    }

    const clampedPost = clamp(postSuds, 0, 100);

    setSavingPost(true);
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
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setPostSaved(true);
      setStatusMsg(
        `✅ Post SUDS 저장 완료. (pre: ${data.pre_suds}, post: ${data.post_suds}, next intensity: ${data.next_intensity.toFixed(
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
        이 페이지에서는 현재 SUDS와 강도를 설정하고, 노출 스토리를 생성한 뒤
        읽고 나서 post SUDS를 기록합니다.
      </p>

      {/* 상단: User ID + SUDS + intensity 설정 */}
      <div className="card">
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            onChange={onChangeUserId}
            placeholder="Intake에서 사용한 User ID"
          />
        </div>

        <div className="field-group">
          <label>현재 SUDS (pre)</label>
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
          <label>노출 강도 (intensity, 0.2 ~ 1.5)</label>
          <input
            type="number"
            step="0.1"
            min={0.2}
            max={1.5}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value) || 0.8)}
          />
          <p className="help-text">
            1.0을 기준으로 0.2에 가까울수록 부드럽고, 1.5에 가까울수록 조금 더
            강한 노출입니다. (실제 temperature는 백엔드에서 안전하게 조절)
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={generateStory}
          disabled={loadingStory}
        >
          {loadingStory ? "Generating…" : "노출 스토리 생성"}
        </button>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
      </div>

      {/* 생성된 스토리 + Post SUDS 입력 */}
      <div className="card" style={{ marginTop: 24 }}>
        <p className="help-text">
          노출 스토리를 천천히, 가능하면 여러 번 눈으로 읽어보세요. 중간에
          회피하고 싶어질 수 있지만, 가능한 한 끝까지 머물러 보는 것이
          노출치료의 핵심입니다.
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
            스토리를 처음부터 끝까지 읽었습니다.
          </label>
        </div>

        <div className="field-group">
          <label>노출 후 SUDS (post)</label>
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
          {savingPost ? "Saving…" : "Post SUDS 저장"}
        </button>

        {postSaved && (
          <p className="help-text">
            저장이 완료되었습니다. 다음 세션에서는 제안된 intensity를 참고해
            주세요.
          </p>
        )}
      </div>

      {/* SUDS Reference Table (시각화용) */}
      <div className="card" style={{ marginTop: 24 }}>
        <h2>SUDS Reference</h2>
        <SudsReferenceTable sudsScale={sudsScale} />
      </div>
    </div>
  );
}

export default Session;
