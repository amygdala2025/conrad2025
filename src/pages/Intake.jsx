// src/pages/Intake.jsx
import { useState } from "react";
import SudsReferenceTable from "./SudsReferenceTable";

function Intake({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [trauma, setTrauma] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!userId || !trauma.trim()) {
      setMsg("Please enter both your User ID and trauma narrative.");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/trauma`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, trauma_text: trauma }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to save trauma");
      }

      const data = await res.json();
      setKeywords(data.keywords || []);
      setMsg("Trauma narrative saved and keywords extracted.");
    } catch (err) {
      setMsg(`❌ Error while saving trauma: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Intake – Trauma Narrative</h2>
      <p className="page-intro">
        Please describe your trauma experience in your own words. The text will
        only be used to extract keywords and generate controlled exposure
        stories.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            placeholder="e.g., 33"
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Trauma Narrative</label>
          <textarea
            rows={6}
            value={trauma}
            placeholder="Write a brief description of your trauma experience."
            onChange={(e) => setTrauma(e.target.value)}
          />
        </div>

        <button type="submit" className="primary-btn">
          Save Trauma &amp; Extract Keywords
        </button>

        {msg && <p className="status-text">{msg}</p>}
      </form>

      {keywords.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Extracted Keywords</h3>
          <p className="help-text">
            These keywords will be used later to generate exposure stories that
            are tailored to this narrative.
          </p>
          <div className="chip-row">
            {keywords.map((kw) => (
              <span key={kw} className="chip">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 20 }}>
        <h3>SUDS Rating Guide</h3>
        <p className="help-text">
          In sessions you will rate your current distress (SUDS) from 0 to 100.
          The table below shows approximate descriptions for each range.
        </p>
        <SudsReferenceTable />
      </div>
    </div>
  );
}

export default Intake;
