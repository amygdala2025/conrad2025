// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const DEMO_USER_ID = "demo-user";

function Dashboard({ apiBase }) {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setStatus("Loading dashboard data...");
      try {
        const res = await fetch(`${apiBase}/api/dashboard/${DEMO_USER_ID}`);
        if (!res.ok) throw new Error("Failed to load dashboard");
        const data = await res.json();
        const sorted = (data.sessions || []).sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        setSessions(sorted);
        setStatus("✅ Dashboard data loaded.");
      } catch (e) {
        console.error(e);
        setStatus("❌ Failed to load dashboard.");
      }
    };

    loadDashboard();
  }, [apiBase]);

  const chartData = sessions
    .filter((s) => s.suds_pre != null && s.suds_post != null)
    .map((s, idx) => ({
      index: idx + 1,
      pre: s.suds_pre,
      post: s.suds_post,
    }));

  return (
    <div className="panel">
      <h2>Dashboard – SUDS Over Time</h2>
      <p className="sub">
        This chart shows how your SUDS scores change before and after each session. Over time, you should
        see the overall distress trend going down.
      </p>

      <div className="status-text">{status}</div>

      {chartData.length === 0 && (
        <p className="sub">No sessions with both pre and post SUDS recorded yet.</p>
      )}

      {chartData.length > 0 && (
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" label={{ value: "Session", position: "insideBottomRight", offset: -5 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="pre" stroke="#f97373" name="Pre SUDS" />
              <Line type="monotone" dataKey="post" stroke="#22c55e" name="Post SUDS" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
