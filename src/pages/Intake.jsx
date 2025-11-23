import { useState, useEffect } from "react";

function Intake({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [trauma, setTrauma] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [sudsScale, setSudsScale] = useState(null);
  const [msg, setMsg] = useState("");

  // Load backend SUDS scale once
  useEffect(() => {
    fetch(`${apiBase}/api/suds/scale`)
      .then((res) => res.json())
      .then((data) => setSudsScale(data.scale))
      .catch(() => {});
  }, [apiBase]);

  const submitTrauma = async () => {
    setMsg("");

    if (!userId || !trauma.trim()) {
      setMsg("Please enter both User ID and trauma narrative.");
      return;
    }

    try {
      // 🔥 여기 엔드포인트를 /api/intake 로 맞춤
      const res = await fetch(`${apiBase}/api/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          trauma_text: trauma,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg =
          errJson && errJson.detail
            ? typeof errJson.detail === "string"
              ? errJson.detail
              : JSON.stringify(errJson.detail)
            : `HTTP ${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      const data = await res.json();

      // 나중에 키워드 추출 기능을 붙일 때 대비
      if (Array.isArray(data.keywords)) {
        setKeywords(data.keywords);
      } else {
        setKeywords([]);
      }

      setMsg("Trauma narrative saved.");
    } catch (err) {
      setMsg(
        `❌ Error while saving trauma: ${
          err && err.message ? err.message : String(err)
        }`
      );
    }
  };

  return (
    <div>
      <h2>Intake – Trauma Narrative</h2>
      <p className="page-intro">
        Please describe your trauma experience in your own words. This text
        will be stored and used only to generate controlled exposure stories
        and to adapt the intensity across sessions.
      </p>

      <div className="card">
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            placeholder="e.g., 0001"
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Trauma Narrative</label>
          <textarea
            rows={8}
            value={trauma}
            placeholder="Write a brief description of your trauma experience here…"
            onChange={(e) => setTrauma(e.target.value)}
            style={{
              resize: "vertical",
              background: "#020617",
              borderRadius: "12px",
              border: "1px solid rgba(148,163,184,0.35)",
              padding: "10px 12px",
              color: "var(--text-main)",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          />
          <p className="help-text">
            A few sentences focusing on the key moment are enough for the
            system to work.
          </p>
        </div>

        <button type="button" className="primary-btn" onClick={submitTrauma}>
          Save Trauma &amp; Extract Keywords
        </button>

        {msg && <p className="status-text">{msg}</p>}
      </div>

      {keywords.length > 0 && (
        <div className="card">
          <h3>Extracted Keywords</h3>
          <p className="help-text">
            These are the elements the system will use when constructing
            exposure stories.
          </p>
          <ul>
            {keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>
      )}

      {sudsScale && (
        <div className="card">
          <h3>Backend SUDS Scale (reference)</h3>
          <p className="help-text">
            The backend uses this 0–100 SUDS scale as a reference when adapting
            story intensity.
          </p>
          <ul>
            {Object.entries(sudsScale).map(([score, desc]) => (
              <li key={score}>
                <b>{score}</b> → {desc}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Intake;
