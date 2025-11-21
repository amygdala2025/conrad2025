import { useEffect, useState } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard({ apiBase }) {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const FAKE_USER_ID = "test-user-1";

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/dashboard`, {
        headers: { Authorization: `Bearer ${FAKE_USER_ID}` },
      });
      const data = await res.json();
      setLog(data.sessions || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const chartData = log.map((s) => ({
    date: s.date,
    suds: s.suds,
  }));

  return (
    <div>
      <h2>Dashboard</h2>

      <h3>SUDS Trend Over Time</h3>

      <div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line type="monotone" dataKey="suds" stroke="#ff5252" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h3 style={{ marginTop: "2rem" }}>Session Log</h3>

      {log.map((s, idx) => (
        <div
          key={idx}
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#fafafa",
          }}
        >
          <p><b>Date:</b> {s.date}</p>
          <p><b>SUDS:</b> {s.suds}</p>
          <p><b>Story:</b></p>
          <div style={{ whiteSpace: "pre-line" }}>{s.story}</div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
