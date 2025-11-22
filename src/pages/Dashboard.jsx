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

function Dashboard({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/dashboard/${userId}`);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to load dashboard");
      }
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load dashboard.");
      setSessions([]);
    }
  };

  // 그래프에 쓸 데이터: pre/post 둘 다 있는 세션만
  const chartData = sessions
    .filter((s) => s.suds_pre !== null && s.suds_post !== null)
    .map((s, idx) => ({
      name: `S${idx + 1}`,
      pre: s.suds_pre,
      post: s.suds_post,
    }));

  return (
    <div>
      <h2>Dashboard – SUDS Over Time</h2>
      <p>
        This chart shows how your SUDS scores change before and after each session.
        Over time, you ideally want the overall distress trend to go down.
      </p>

      <div className="card">
        <label>
          User ID
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g. user123"
          />
        </label>
        <button onClick={loadData}>Load Dashboard</button>
      </div>

      {error && (
        <p style={{ marginTop: "1rem", color: "#fca5a5" }}>
          ❌ {error}
        </p>
      )}

      {chartData.length > 0 ? (
        <div style={{ width: "100%", height: 320, marginTop: "1.5rem" }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pre" stroke="#60a5fa" name="Pre-SUDS" />
              <Line type="monotone" dataKey="post" stroke="#f97373" name="Post-SUDS" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p style={{ marginTop: "1.5rem" }}>
          No sessions with both pre and post SUDS recorded yet.
        </p>
      )}

      {/* 세션별 스토리 요약 */}
      {sessions.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3>Session Details</h3>
          {sessions.map((s, idx) => (
            <div key={s.session_id} className="card" style={{ marginBottom: "1rem" }}>
              <b>
                Session {idx + 1} – {s.session_id}
              </b>
              <p>
                <b>Pre-SUDS:</b> {s.suds_pre} &nbsp; | &nbsp;
                <b>Post-SUDS:</b> {s.suds_post ?? "N/A"} &nbsp; | &nbsp;
                <b>Intensity:</b> {s.intensity?.toFixed ? s.intensity.toFixed(2) : s.intensity}
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>{s.story}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
