// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
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

// 🔥 Cloud Run backend URL
const API_BASE =
  "https://ptsd-backend-761910111968.asia-northeast3.run.app";

function Dashboard() {
  const [userId, setUserId] = useState(
    localStorage.getItem("ptsd_user_id") || ""
  );
  const [token, setToken] = useState(
    localStorage.getItem("ptsd_token") || ""
  );

  const isAdmin = userId === ADMIN_USER_ID;

  // for admin: optional filter to view another user's history
  const [filterUserId, setFilterUserId] = useState("");

  const [sessions, setSessions] = useState([]);
  const [currentHistoryUser, setCurrentHistoryUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // ---------------------------
  // Helpers
  // ---------------------------
  const buildAuthHeaders = (extra = {}) => {
    const headers = { ...extra };
    if (token) {
      headers["X-Auth-Token"] = token;
    }
    return headers;
  };

  const ensureLoggedIn = () => {
    if (!token || !userId) {
      setStatusMsg(
        "❌ You need to log in first on the Intake page. User ID and token are missing."
      );
      return false;
    }
    return true;
  };

  // ---------------------------
  // Load history
  // ---------------------------
  const loadHistory = async () => {
    setStatusMsg("");
    setSessions([]);

    if (!ensureLoggedIn()) return;

    setLoading(true);
    try {
      // 기본적으로는 자신의 히스토리
      let url = `${API_BASE}/api/sessions/history`;

      // Admin이면 다른 user_id로 필터 가능
      if (isAdmin && filterUserId.trim() !== "") {
        const q = encodeURIComponent(filterUserId.trim());
        url += `?user_id=${q}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: buildAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }

      const data = await res.json(); // { user_id, sessions: [...] }
      setCurrentHistoryUser(data.user_id || "");
      setSessions(data.sessions || []);
      if (!data.sessions || data.sessions.length === 0) {
        setStatusMsg("ℹ️ No sessions found for this user yet.");
      }
    } catch (err) {
      setStatusMsg(`❌ Failed to load history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Admin JSON export
  // ---------------------------
  const handleExportJson = async () => {
    setStatusMsg("");

    if (!ensureLoggedIn()) return;
    if (!isAdmin) {
      setStatusMsg("❌ Only the admin user can export all sessions.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/sessions`, {
        method: "GET",
        headers: buildAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }

      const data = await res.json(); // array of sessions including story

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sessions_with_stories.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatusMsg("✅ Exported JSON for all sessions (with stories).");
    } catch (err) {
      setStatusMsg(`❌ JSON export failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Admin CSV export (SUDS + story)
  // ---------------------------
  const handleExportCsv = async () => {
    setStatusMsg("");

    if (!ensureLoggedIn()) return;
    if (!isAdmin) {
      setStatusMsg("❌ Only the admin user can export all sessions.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/export/csv`, {
        method: "GET",
        headers: buildAuthHeaders(),
      });

      if (!res.ok) {
        // CSV라 json() 호출하면 깨질 수 있어서 텍스트만 보고 에러 표시
        const text = await res.text().catch(() => "");
        throw new Error(
          text || `HTTP ${res.status} (failed to download CSV)`
        );
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sessions_suds_story.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatusMsg("✅ Exported CSV for all sessions (SUDS + story).");
    } catch (err) {
      setStatusMsg(`❌ CSV export failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 자동으로 한 번 로드
  // ---------------------------
  useEffect(() => {
    if (token && userId) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // Chart 준비
  // ---------------------------
  const chartData = sessions.map((s) => {
    // created_at → 예쁘게 포맷된 라벨
    let label = s.created_at;
    try {
      label = new Date(s.created_at).toLocaleString();
    } catch {
      // ignore parse error, keep raw
    }
    return {
      ...s,
      label,
    };
  });

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p className="page-intro">
        This dashboard visualizes SUDS scores over time and allows the admin to
        export session data (including stories) as JSON and CSV.
      </p>

      <div className="card">
        {/* Basic auth info */}
        <div className="field-group">
          <label>Current user ID (from localStorage)</label>
          <input
            type="text"
            value={userId}
            readOnly
            placeholder="Not logged in"
          />
          {!token && (
            <p className="help-text">
              You are not logged in. Please go to the Intake page, log in, and
              then return here.
            </p>
          )}
          {token && (
            <p className="help-text">
              Token is present. If the user ID is <b>{ADMIN_USER_ID}</b>, you
              can use admin features below.
            </p>
          )}
        </div>

        {/* Admin filter */}
        {isAdmin && (
          <div className="field-group">
            <label>View history for user ID (admin only)</label>
            <input
              type="text"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              placeholder="Leave empty to view your own sessions"
            />
            <p className="help-text">
              As admin, you can type a user ID here and press{" "}
              <b>Reload history</b> to inspect their SUDS trend. If left empty,
              the dashboard will show your own sessions.
            </p>
          </div>
        )}

        {/* Load / reload button */}
        <div className="field-group">
          <button
            type="button"
            className="primary-btn"
            onClick={loadHistory}
            disabled={loading}
          >
            {loading ? "Loading…" : "Reload history"}
          </button>
        </div>

        {/* History summary */}
        {currentHistoryUser && (
          <p className="help-text">
            Showing history for user: <b>{currentHistoryUser}</b> (
            {sessions.length} session
            {sessions.length === 1 ? "" : "s"})
          </p>
        )}

        {/* Chart */}
        {sessions.length > 0 && (
          <div style={{ width: "100%", height: 320, marginTop: 16 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pre_suds"
                  name="Pre SUDS"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="post_suds"
                  name="Post SUDS"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        {sessions.length > 0 && (
          <div style={{ marginTop: 24, overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Created at</th>
                  <th>Session ID</th>
                  <th>Pre SUDS</th>
                  <th>Post SUDS</th>
                  <th>Intensity</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, idx) => (
                  <tr key={s.session_id}>
                    <td>{idx + 1}</td>
                    <td>
                      {(() => {
                        try {
                          return new Date(
                            s.created_at
                          ).toLocaleString();
                        } catch {
                          return s.created_at;
                        }
                      })()}
                    </td>
                    <td style={{ maxWidth: 220, wordBreak: "break-all" }}>
                      {s.session_id}
                    </td>
                    <td>{s.pre_suds}</td>
                    <td>
                      {s.post_suds === null || s.post_suds === undefined
                        ? "-"
                        : s.post_suds}
                    </td>
                    <td>{s.intensity?.toFixed?.(2) ?? s.intensity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Admin export buttons */}
        {isAdmin && (
          <div
            className="field-group"
            style={{ marginTop: 32, borderTop: "1px solid #eee", paddingTop: 16 }}
          >
            <h2>Admin exports</h2>
            <p className="help-text">
              As the admin user, you can export <b>all sessions from all users</b>.
              JSON includes full story text. CSV includes SUDS scores and story
              as a single line.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleExportJson}
                disabled={loading}
              >
                {loading ? "Working…" : "Download JSON (all sessions + stories)"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleExportCsv}
                disabled={loading}
              >
                {loading ? "Working…" : "Download CSV (SUDS + story)"}
              </button>
            </div>
          </div>
        )}

        {statusMsg && (
          <p className="status-text" style={{ marginTop: 16 }}>
            {statusMsg}
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
