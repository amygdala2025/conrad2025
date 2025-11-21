import { useState, useEffect } from "react";

function Session({ apiBase }) {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState("");
  const [suds, setSuds] = useState(null);
  const [submitStatus, setSubmitStatus] = useState("");

  const FAKE_USER_ID = "test-user-1";

  const SUDS_OPTIONS = [
    { value: 0, label: "0 — No distress" },
    { value: 10, label: "10 — Very minimal distress" },
    { value: 20, label: "20 — Mild discomfort" },
    { value: 30, label: "30 — Noticeable discomfort" },
    { value: 40, label: "40 — Moderate discomfort" },
    { value: 50, label: "50 — Clear anxiety present" },
    { value: 60, label: "60 — Strong discomfort" },
    { value: 70, label: "70 — High anxiety" },
    { value: 80, label: "80 — Severe distress" },
    { value: 90, label: "90 — Extreme distress" },
    { value: 100, label: "100 — Maximum imaginable distress" }
  ];

  const loadStory = async () => {
    setLoading(true);
    setSubmitStatus("");

    try {
      const res = await fetch(`${apiBase}/api/session/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FAKE_USER_ID}`,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setStory(data.story || "No story returned.");
    } catch (err) {
      console.error(err);
      setStory("Error loading story. Check backend.");
    }

    setLoading(false);
  };

  const submitSUDS = async () => {
    if (suds === null) {
      setSubmitStatus("⚠ Please select a SUDS score before submitting.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/session/suds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FAKE_USER_ID}`,
        },
        body: JSON.stringify({ suds }),
      });

      const data = await res.json();
      setSubmitStatus("✅ SUDS submitted successfully.");
    } catch (err) {
      setSubmitStatus("❌ Error submitting SUDS.");
    }
  };

  useEffect(() => {
    loadStory();
  }, []);

  return (
    <div>
      <h2>Therapy Session</h2>

      <button onClick={loadStory} disabled={loading}>
        {loading ? "Loading..." : "Load New Story"}
      </button>

      <div style={{ marginTop: "1.5rem", whiteSpace: "pre-line" }}>
        <h3>Generated Story</h3>
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            background: "#fafafa",
          }}
        >
          {story}
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Your SUDS Level</h3>

        <p>Select your distress level (0–100):</p>

        <div style={{ marginBottom: "1rem" }}>
          <img
            src="https://i.imgur.com/cC7n3CH.png"
            alt="SUDS scale"
            style={{ width: "100%", borderRadius: "10px" }}
          />
        </div>

        <select
          value={suds ?? ""}
          onChange={(e) => setSuds(Number(e.target.value))}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        >
          <option value="">Select SUDS score</option>
          {SUDS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={submitSUDS}
          style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
        >
          Submit
        </button>

        <p style={{ marginTop: "1rem" }}>{submitStatus}</p>
      </div>
    </div>
  );
}

export default Session;
