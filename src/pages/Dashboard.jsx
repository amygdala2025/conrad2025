// src/Dashboard.jsx
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

function Dashboard({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  const loadData = async () => {
    setStatusMsg("");
    setSessions([]);
    setSelectedSessionId(null);

    if (!userId) {
      setStatusMsg("User ID를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/dashboard/${userId}`);
      if (!res.ok) throw new Error("Dashboard API 실패");
      const data = await res.json();
      const list = data.sessions || [];
      setSessions(list);
      if (list.length > 0) {
        setSelectedSessionId(list[list.length - 1].session_id);
      }
    } catch (err) {
      setStatusMsg(`❌ 데이터를 불러오지 못했습니다: ${err.message}`);
    }
  };

  const chartData = sessions.map((s) => ({
    date: new Date(s.created_at).toLocaleDateString(),
    pre: s.suds_pre,
    post: s.suds_post,
  }));

  const selected =
    sessions.find((s) => s.session_id === selectedSessionId) || null;

  return (
    <div>
      <h2>Dashboard</h2>
      <p className="page-intro">
        날짜별로 Pre / Post SUDS 변화와 각 세션에서 생성된 스토리를 한눈에 볼 수 있습니다.
      </p>

      <div className="card">
        <div className="field-row">
          <div className="field-group" style={{ flex: 1 }}>
            <label>User ID</label>
            <input
              type="text"
              value={userId}
              placeholder="예: 33"
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <button type="button" className="primary-btn" onClick={loadData}>
            Load Dashboard
          </button>
        </div>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
      </div>

      {sessions.length > 0 && (
        <>
          <div className="card" style={{ marginTop: 16 }}>
            <h3>SUDS Trend by Date</h3>
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
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="post"
                    name="Post-SUDS"
                    stroke="#22c55e"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
              <h3>Sessions</h3>
              <ul>
                {sessions.map((s) => (
                  <li
                    key={s.session_id}
                    className={
                      "session-item" +
                      (s.session_id === selectedSessionId
                        ? " session-item-active"
                        : "")
                    }
                    onClick={() => setSelectedSessionId(s.session_id)}
                  >
                    <div className="session-item-main">
                      <span>
                        {new Date(s.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="session-item-sub">
                      Pre: {s.suds_pre} / Post:{" "}
                      {s.suds_post !== null ? s.suds_post : "-"}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="session-detail">
              <h3>Story</h3>
              {selected ? (
                <>
                  <p className="help-text">
                    {new Date(selected.created_at).toLocaleString()}
                    <br />
                    Pre: {selected.suds_pre} / Post:{" "}
                    {selected.suds_post !== null ? selected.suds_post : "-"}
                  </p>
                  <p className="story-text">{selected.story}</p>
                </>
              ) : (
                <p className="help-text">
                  왼쪽에서 보고 싶은 세션을 선택하세요.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
