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
  const [adminPw, setAdminPw] = useState(""); // 🔐 admin password
  const [sessions, setSessions] = useState([]); // list from SUDS history
  const [selectedSession, setSelectedSession] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStory, setLoadingStory] = useState(false);
  const [downloadingStories, setDownloadingStories] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  const token = localStorage.getItem("ptsd_token") || "";
  const isAdmin = userId.trim() === ADMIN_USER_ID;

  // Load Dashboard data (SUDS history)
  const loadData = async () => {
    setStatusMsg("");
    setSessions([]);
    setSelectedSession(null);

    if (!userId) {
      setStatusMsg("❌ Please enter a User ID.");
      return;
    }
    if (!token) {
      setStatusMsg(
        "❌ No authentication token found. Please complete Intake first."
      );
      return;
    }
    if (isAdmin && !adminPw) {
      setStatusMsg("❌ Admin password required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/suds/history/${userId}`, {
        headers: {
          "X-Auth-Token": token,
          ...(isAdmin ? { "X-Admin-Password": adminPw } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const list = data.history || [];

      setSessions(list);
      if (list.length > 0) {
        await loadSessionDetail(list[0].session_id); // auto-select most recent session
      }
    } catch (err) {
      setStatusMsg(`❌ Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load individual session detail (including story)
  const loadSessionDetail = async (sessionId) => {
    if (!token) return;
    setLoadingStory(true);
    try {
      const res = await fetch(`${apiBase}/api/sessions/${sessionId}`, {
        headers: {
          "X-Auth-Token": token,
          ...(isAdmin ? { "X-Admin-Password": adminPw } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSelectedSession(data);
    } catch (err) {
      setSelectedSession({
        session_id: sessionId,
        story: "",
        error: err.message,
      });
    } finally {
      setLoadingStory(false);
    }
  };

  // 🔐 ADMIN: EXPORT ALL STORIES (JSON)
  const exportStories = async () => {
    if (!isAdmin) return;
    if (!adminPw) {
      setStatusMsg("❌ Admin password required.");
      return;
    }

    setDownloadingStories(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/stories/export`, {
        headers: {
          "X-Auth-Token": token,
          "X-Admin-Password": adminPw,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }

      const text = await res.text();
      const blob = new Blob([text], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "all_stories.json";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      setStatusMsg(`❌ Export failed: ${err.message}`);
    } finally {
      setDownloadingStories(false);
    }
  };

  // 🔐 ADMIN: EXPORT SUDS CSV (pre/post + timestamp)
  const exportSudsCsv = async () => {
    if (!isAdmin) return;
    if (!adminPw) {
      setStatusMsg("❌ Admin password required.");
      return;
    }

    setDownloadingCsv(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/suds/export`, {
        headers: {
          "X-Auth-Token": token,
          "X-Admin-Password": adminPw,
        },
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
    } catch (err) {
      setStatusMsg(`❌ CSV export failed: ${err.message}`);
    } finally {
      setDownloadingCsv(false);
    }
  };

  // 🔍 user별 색상 맵 (ADMIN 모드에서만 의미 있음)
  const userIds = Array.from(
    new Set(
      sessions
        .map((s) => s.user_id)
        .filter((u) => !!u)
    )
  );
  const colorPalette = [
    "#ef4444",
    "#3b82f6",
    "#22c55e",
    "#a855f7",
    "#f97316",
    "#14b8a6",
    "#eab308",
    "#6366f1",
    "#ec4899",
    "#0ea5e9",
  ];
  const userColorMap = {};
  userIds.forEach((id, idx) => {
    userColorMap[id] = colorPalette[idx % colorPalette.length];
  });

  // Build chart data sorted by time (oldest → newest)
  const chartData = sessions
    .slice()
    .reverse()
    .map((s) => ({
      date: new Date(s.timestamp).toLocaleString(),
      pre: s.pre_suds,
      post: s.post_suds,
      userId: s.user_id || null,
    }));

  const renderPreDot = (props) => {
    const { cx, cy, payload } = props;
    const color = userColorMap[payload.userId] || "#6366f1";
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    );
  };

  const renderPostDot = (props) => {
    const { cx, cy, payload } = props;
    const color = userColorMap[payload.userId] || "#22c55e";
    return (
      <rect
        x={props.cx - 3}
        y={props.cy - 3}
        width={6}
        height={6}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    );
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p className="page-intro">
        Review changes in your Pre/Post SUDS scores over time and revisit the
        exposure stories generated in each session.
      </p>

      <div className="card">
        <div className="field-row">
          <div className="field-group" style={{ flex: 1 }}>
            <label>User ID</label>
            <input
              type="text"
              value={userId}
              placeholder="e.g., 0001 / amygdala_admin"
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          {isAdmin && (
            <input
              type="password"
              placeholder="Admin Password"
              value={adminPw}
              onChange={(e) => setAdminPw(e.target.value)}
              style={{ marginLeft: "0.5rem" }}
            />
          )}

          <button
            type="button"
            className="primary-btn"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load Dashboard"}
          </button>

          {isAdmin && (
            <>
              <button
                type="button"
                onClick={exportStories}
                disabled={downloadingStories}
                style={{ marginLeft: "0.5rem" }}
              >
                {downloadingStories ? "Exporting..." : "Export All Stories"}
              </button>
              <button
                type="button"
                onClick={exportSudsCsv}
                disabled={downloadingCsv}
                style={{ marginLeft: "0.5rem" }}
              >
                {downloadingCsv ? "Exporting CSV..." : "Export SUDS CSV"}
              </button>
            </>
          )}
        </div>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
      </div>

      {sessions.length > 0 && (
        <>
          <div className="card" style={{ marginTop: 16 }}>
            <h3>SUDS Trend by Session</h3>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pre"
                    name="Pre-SUDS"
                    stroke="#6366f1"
                    dot={isAdmin ? renderPreDot : false}
                  />
                  <Line
                    type="monotone"
                    dataKey="post"
                    name="Post-SUDS"
                    stroke="#22c55e"
                    dot={isAdmin ? renderPostDot : false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {isAdmin && userIds.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                {userIds.map((uid) => (
                  <div
                    key={uid}
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: userColorMap[uid],
                      }}
                    />
                    <span>{uid}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="card"
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.6fr)",
              gap: 16,
            }}
          >
            <div className="session-list">
              <h3>Session List</h3>
              <ul>
                {sessions.map((s) => (
                  <li
                    key={s.session_id}
                    className={
                      "session-item" +
                      (selectedSession &&
                      selectedSession.session_id === s.session_id
                        ? " session-item-active"
                        : "")
                    }
                    onClick={() => loadSessionDetail(s.session_id)}
                    style={
                      isAdmin && s.user_id && userColorMap[s.user_id]
                        ? {
                            borderLeft: `4px solid ${userColorMap[s.user_id]}`,
                            paddingLeft: 8,
                          }
                        : {}
                    }
                  >
                    <div className="session-item-main">
                      <span>{new Date(s.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="session-item-sub">
                      {isAdmin && s.user_id && (
                        <span
                          style={{
                            marginRight: 8,
                            fontSize: 11,
                            opacity: 0.7,
                          }}
                        >
                          User: {s.user_id}
                        </span>
                      )}
                      Pre: {s.pre_suds} / Post:{" "}
                      {s.post_suds !== null ? s.post_suds : "-"}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="session-detail">
              <h3>Exposure Story</h3>
              {loadingStory && <p className="help-text">Loading story…</p>}
              {!loadingStory && selectedSession ? (
                <>
                  <p className="help-text">
                    {new Date(
                      selectedSession.created_at || sessions[0].timestamp
                    ).toLocaleString()}
                    <br />
                    Pre: {selectedSession.pre_suds} / Post:{" "}
                    {selectedSession.post_suds !== null
                      ? selectedSession.post_suds
                      : "-"}
                    {isAdmin && selectedSession.user_id && (
                      <>
                        <br />
                        User: {selectedSession.user_id}
                      </>
                    )}
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
                !loadingStory && (
                  <p className="help-text">
                    Select a session from the list on the left.
                  </p>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
