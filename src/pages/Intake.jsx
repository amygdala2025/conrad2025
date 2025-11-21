// src/pages/Intake.jsx
import { useState } from "react";

const DEMO_USER_ID = "demo-user";

function Intake({ apiBase }) {
  const [traumaText, setTraumaText] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    setStatus("Saving trauma narrative...");
    try {
      const res = await fetch(`${apiBase}/api/trauma`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: DEMO_USER_ID,
          trauma_text: traumaText,
        }),
      });

      if (!res.ok) throw new Error("Failed to store trauma");

      const data = await res.json();
      setKeywords(data.keywords || []);
      setStatus("✅ Trauma narrative saved and keywords extracted.");
    } catch (e) {
      console.error(e);
      setStatus("❌ Failed to save trauma narrative. Check backend / network.");
    }
  };

  return (
    <div className="panel">
      <h2>Intake – Trauma Narrative</h2>
      <p className="sub">
        Write a brief description of your trauma experience in your own words.  
        This text will be used only to extract keywords and generate controlled exposure stories.
      </p>

      <textarea
        className="text-input"
        placeholder="Describe your trauma experience here..."
        value={traumaText}
        onChange={(e) => setTraumaText(e.target.value)}
      />

      <button className="primary-btn" onClick={handleSubmit}>
        Save Trauma & Extract Keywords
      </button>

      <div className="status-text">{status}</div>

      {keywords.length > 0 && (
        <div className="card">
          <h3>Extracted Keywords</h3>
          <div className="chip-row">
            {keywords.map((k) => (
              <span key={k} className="chip">
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Intake;
