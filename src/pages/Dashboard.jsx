import { useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

function Dashboard({ apiBase }) {
  const [userId, setUserId] = useState(localStorage.getItem("ptsd_user_id") || "");
  const [history, setHistory] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    if (!userId) {
      setStatusMsg("❌ Please enter your User ID.");
      return;
    }

    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setStatusMsg("❌ No auth token found. Complete intake first.");
      return;
    }

    setLoading(true);
    setStatusMsg("");

    try {
      const res = await fetch(
        `${apiBase}/api/suds/history/${encodeURIComponent(userId)}`,
        {
          headers: {
            "X-Auth-Token": token, // ★ 토큰 인증
          },
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg =
          errJson?.detail || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      const data = await res.json();
      setHistory(data.history || []);
      setStatusMsg("✔ Dashboard loaded.");
    } catch (err) {
      setStatusMsg(`❌ Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Prepare data for Chart.js (Pre/Post SUDS)
  // -----------------------------------------

  const chartData = {
    labels: history.map((h) => new Date(h.timestamp).toLocaleString()),
    datasets: [
      {
        label: "Pre-SUDS",
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96,165,250,0.2)",
        data: history.map((h) => h.pre_suds),
      },
      {
        label: "Post-SUDS",
        borderColor: "#f472b6",
        backgroundColor: "rgba(244,114,182,0.2)",
        data: history.map((h) => h.post_suds ?? null),
      },
    ],
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p className="page-intro">
        Visualize pre- and post-session SUDS trends and review previous exposure stories.
      </p>

      {/* -------------------- */}
      {/* Load Controls        */}
      {/* -------------------- */}
      <div className="card">
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            placeholder="0001"
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <button className="primary-btn" onClick={loadDashboard}>
          Load Dashboard
        </button>

        {statusMsg && <p className="status-text">{statusMsg}</p>}
      </div>

      {/* -------------------- */}
      {/* Charts + Session List */}
      {/* -------------------- */}
      {history.length > 0 && (
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>SUDS Trend Over Time</h3>

          <div className="chart-box">
            <Line data={chartData} />
          </div>

          <h3 style={{ marginTop: "30px" }}>Session List</h3>
          <ul className="session-list">
            {history.map((session) => (
              <li
                key={session.session_id}
                className="session-item"
                onClick={() => setSelectedStory(session)}
              >
                <div>
                  <b>{new Date(session.timestamp).toLocaleString()}</b>
                  <br />
                  Pre: {session.pre_suds} / Post:{" "}
                  {session.post_suds !== null ? session.post_suds : "—"}
                </div>
                <div className="session-item-arrow">›</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* -------------------- */}
      {/* Story Viewer Modal   */}
      {/* -------------------- */}
      {selectedStory && (
        <div className="modal-overlay" onClick={() => setSelectedStory(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Exposure Story</h3>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {selectedStory.story || "(story missing)"}
            </p>
            <button
              className="primary-btn"
              style={{ marginTop: "20px" }}
              onClick={() => setSelectedStory(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
