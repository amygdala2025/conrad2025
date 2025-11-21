import { useState, useEffect } from "react";

function Intake({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [trauma, setTrauma] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [sudsScale, setSudsScale] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`${apiBase}/api/suds/scale`)
      .then(res => res.json())
      .then(data => setSudsScale(data.scale));
  }, []);

  const submitTrauma = async () => {
    if (!userId || !trauma) {
      setMsg("Please enter both User ID and trauma description.");
      return;
    }

    const res = await fetch(`${apiBase}/api/trauma`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        trauma_text: trauma
      })
    });

    const data = await res.json();
    setKeywords(data.keywords);
    setMsg("Trauma profile saved. Keywords extracted.");
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>Intake – Trauma Registration</h2>

      <label>User ID</label>
      <input
        style={{ width: "100%", marginBottom: 10 }}
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <label>Describe your trauma (free text)</label>
      <textarea
        style={{ width: "100%", height: 150 }}
        value={trauma}
        onChange={(e) => setTrauma(e.target.value)}
      />

      <button onClick={submitTrauma} style={{ marginTop: 10 }}>
        Submit Trauma
      </button>

      <p>{msg}</p>

      {keywords.length > 0 && (
        <div>
          <h3>Extracted Keywords</h3>
          <ul>
            {keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>
      )}

      {sudsScale && (
        <div>
          <h3>SUDS Scale (0–100)</h3>
          <ul>
            {Object.entries(sudsScale).map(([score, desc]) => (
              <li key={score}><b>{score}</b> → {desc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Intake;
