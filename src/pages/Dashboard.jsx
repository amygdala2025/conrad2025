// src/pages/Dashboard.jsx
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ADMIN_USER_ID = "amygdala_admin";

function Dashboard({ apiBase }) {
  const [userId, setUserId] = useState(
    localStorage.getItem("ptsd_user_id") || ""
  );
  const [adminPw, setAdminPw] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const [sessions, setSessions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingStory, setLoadingStory] = useState(false);

  const [downloadingStories, setDownloadingStories] = useState(false);
  const [downloadingSuds, setDownloadingSuds] = useState(false);

  const isAdmin = userId.trim() === ADMIN_USER_ID;

  const onChangeUserId = (e) => {
    setUserId(e.target.value);
    localStorage.setItem("ptsd_user_id", e.target.value);
  };

  const buildHeaders = (extra = {}) => {
    const token = localStorage.getItem("ptsd_token");
    if (!token) return null;
    return {
      "X-Auth-Token": token,
      ...(isAdmin && adminPw ? { "X-Admin-Password": adminPw } : {}),
      ...extra,
    };
  };

  // ---------------------------
  // 1) /api/suds/history/{user_id}
  // ---------------------------
  const loadHistory = async () => {
    setStatusMsg("");
    setSessions([]);
    setSelectedSession(null);

    if (!userId) {
      setStatusMsg("❌ User ID를 입력해주세요.");
      return;
    }

    const headers = buildHeaders();
    if (!headers) {
      setStatusMsg("❌ 토큰이 없습니다. Intake/로그인부터 진행해주세요.");
      return;
    }

    setLoadingHistory(true);
    try {
      const res = await fetch(`${apiBase}/api/suds/history/${userId}`, {
        headers,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const list = data.history || [];
      setSessions(list);

      if (list.length > 0) {
        await loadSessionDetail(list[0].session_id, headers);
      }
      setStatusMsg(
        list.length > 0
          ? `✅ ${list.length}개의 세션을 불러왔습니다.`
          : "✅ 세션 히스토리가 없습니다."
      );
    } catch (err) {
      setStatusMsg(`❌ Failed to load history: ${err.message}`);
    } finally {
      setLoadingHistory(false);
    }
  };

  // ---------------------------
  // 2) /api/sessions/{session_id}
  // ---------------------------
  const loadSessionDetail = async (sessionId, headersFromHistory) => {
    setStatusMsg("");
    setLoadingStory(true);

    try {
      const tokenHeaders = headersFromHistory || buildHeaders();
      if (!tokenHeaders) {
        setStatusMsg("❌ 토큰이 없습니다.");
        setLoadingStory(false);
        return;
      }

      const res = await fetch(`${apiBase}/api/sessions/${sessionId}`, {
        headers: tokenHeaders,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSelectedSession(data);
    } catch (err) {
      setStatusMsg(`❌ Failed to load session detail: ${err.message}`);
    } finally {
      setLoadingStory(false);
    }
  };

  // ---------------------------
  // 3) Admin: Stories JSON export
  // ---------------------------
  const exportStoriesJson = async () => {
    setStatusMsg("");
    if (!isAdmin) {
      setStatusMsg("❌ 이 기능은 admin만 사용할 수 있습니다.");
      return;
    }
    const headers = buildHeaders();
    if (!headers || !adminPw) {
      setStatusMsg("❌ Admin password와 토큰을 확인해주세요.");
      return;
    }

    setDownloadingStories(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/stories/export`, {
        headers,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const text = JSON.stringify(data, null, 2);

      const blob = new Blob([text], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "all_stories.json";
      a.click();

      URL.revokeObjectURL(url);
      setStatusMsg("✅ Stories JSON export가 완료되었습니다.");
    } catch (err) {
      setStatusMsg(`❌ Export failed: ${err.message}`);
    } finally {
      setDownloadingStories(false);
    }
  };

  // ---------------------------
  // 4) Admin: SUDS CSV export
  // ---------------------------
  const exportSudsCsv = async () => {
    setStatusMsg("");
    if (!isAdmin) {
      setStatusMsg("❌ 이 기능은 admin만 사용할 수 있습니다.");
      return;
    }
    const headers = buildHeaders();
    if (!headers || !adminPw) {
      setStatusMsg("❌ Admin password와 토큰을 확인해주세요.");
      return;
    }

    setDownloadingSuds(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/suds/export`, {
        headers,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "suds_export.csv";
      a.click();

      URL.revokeObjectURL(url);
      setStatusMsg("✅ SUDS CSV export가 완료되었습니다.");
    } catch (err) {
      setStatusMsg(`❌ Export failed: ${err.message}`);
    } finally {
      setDownloadingSuds(false);
    }
  };

  // ---------------------------
  // 5) 그래프용 데이터 변환
  // ---------------------------
  const chartData = sessions.map((s, idx) => ({
    idx: idx + 1,
    pre_suds: s.pre_suds,
    post_suds: s.post_suds,
  }));

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p className="page-intro">
        유저별 세션 히스토리를 확인하고, pre/post SUDS 변화를 그래프로 볼 수
        있습니다. Admin 계정은 전체 데이터를 export할 수 있습니다.
      </p>

      {/* 상단: User ID / Admin PW / 버튼들 */}
      <div className="card">
        <div className="field-row">
          <div className="field-group" style={{ flex: 1 }}>
            <label>User ID</label>
            <input
              type="text"
              value={userId}
              onChange={onChangeUserId}
              placeholder="조회할 User ID"
            />
          </div>

          {isAdmin && (
            <div className="field-group" style={{ flex: 1 }}>
              <label>Admin Password</label>
              <input
                type="password"
                value={adminPw}
                onChange={(e) => setAdminPw(e.target.value)}
                placeholder="ADMIN_PASSWORD"
              />
            </div>
          )}
        </div>

        <div className="field-row" style={{ marginTop: 8, gap: 8 }}>
          <button
            type="button"
            className="primary-btn"
            onClick={loadHistory}
            disabled={loadingHistory}
          >
            {loadingHistory ? "Loading…" : "SUDS History 불러오기"}
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={exportStoriesJson}
                disabled={downloadingStories}
              >
                {downloadingStories ? "Exporting…" : "Export Stories (JSON)"}
              </button>
              <button
                type="button"
                onClick={exportSudsCsv}
                disabled={downloadingSuds}
              >
                {downloadingSuds ? "Exporting…" : "Export SUDS (CSV)"}
              </button>
            </>
          )}
        </div>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
      </div>

      {/* 중간: 그래프 + 세션 리스트 + 상세 */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="field-row" style={{ alignItems: "stretch", gap: 16 }}>
          {/* 왼쪽: 그래프 */}
          <div style={{ flex: 1, minHeight: 260 }}>
            <h2>SUDS Trend</h2>
            {chartData.length === 0 ? (
              <p className="help-text">표시할 세션이 없습니다.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="idx" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pre_suds" name="Pre SUDS" />
                  <Line type="monotone" dataKey="post_suds" name="Post SUDS" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 오른쪽: 세션 리스트 + 상세 */}
          <div style={{ flex: 1, display: "flex", gap: 12 }}>
            <div className="session-list" style={{ flex: 1 }}>
              <h2>Sessions</h2>
              {sessions.length === 0 ? (
                <p className="help-text">세션이 없습니다.</p>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.session_id}
                    className={
                      selectedSession &&
                      selectedSession.session_id === s.session_id
                        ? "session-item selected"
                        : "session-item"
                    }
                    onClick={() => loadSessionDetail(s.session_id)}
                  >
                    <div className="session-item-main">
                      <div>
                        <b>{s.session_id.slice(0, 8)}...</b>
                      </div>
                      <div>
                        pre: {s.pre_suds} / post:{" "}
                        {s.post_suds !== null && s.post_suds !== undefined
                          ? s.post_suds
                          : "-"}
                      </div>
                    </div>
                    <div className="session-item-sub">
                      <div>user: {s.user_id}</div>
                      <div>{s.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="session-detail" style={{ flex: 1 }}>
              <h2>Session Detail</h2>
              {loadingStory ? (
                <p className="help-text">Loading story…</p>
              ) : selectedSession ? (
                <>
                  <p className="help-text">
                    <b>ID:</b> {selectedSession.session_id}
                    <br />
                    <b>User:</b> {selectedSession.user_id}
                    <br />
                    <b>Time:</b> {selectedSession.timestamp}
                    <br />
                    <b>pre:</b> {selectedSession.pre_suds} /{" "}
                    <b>post:</b>{" "}
                    {selectedSession.post_suds !== null &&
                    selectedSession.post_suds !== undefined
                      ? selectedSession.post_suds
                      : "-"}
                    <br />
                    <b>Intensity:</b> {selectedSession.intensity}
                  </p>
                  <div className="story-box">
                    {selectedSession.story ? (
                      <p className="story-text">{selectedSession.story}</p>
                    ) : (
                      <p className="story-text">(story missing)</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="help-text">
                  왼쪽 리스트에서 세션을 선택하면 자세한 내용을 볼 수 있습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
