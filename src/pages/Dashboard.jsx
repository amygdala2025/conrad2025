import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

function Dashboard({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [sessions, setSessions] = useState([]);

  const loadData = async () => {
    const res = await fetch(`${apiBase}/api/dashboard/${userId}`);
    const data = await res.json();
    setSessions(data.sessions);
  };

  const chartData = sessions.map((s, idx) => ({
    idx,
    pre: s.suds_pre,
    post: s.suds_post
  }));

  return (
    <div style={{ maxWidth: 900 }}>
      <h2>Dashboard</h2>
      <input
        value={userId}
        placeholder="User ID"
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={loadData}>Load Dashboard</button>

      <h3>SUDS Trend</h3>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <XAxis dataKey="idx" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pre" stroke="#8884d8" />
            <Line type="monotone" dataKey="post" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h3>Stories</h3>
      {sessions.map((s) => (
        <div key={s.session_id} style={{ marginBottom: 20 }}>
          <b>Session {s.session_id}</b>
          <p>{s.story}</p>
          <p>pre: {s.suds_pre} / post: {s.suds_post}</p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
