// src/Intake.jsx
import { useState, useEffect } from "react";
import SudsReferenceTable from "./SudsReferenceTable";

function Intake({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [trauma, setTrauma] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [sudsScale, setSudsScale] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`${apiBase}/api/suds/scale`)
      .then((res) => res.json())
      .then((data) => setSudsScale(data.scale))
      .catch(() => {});
  }, [apiBase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!userId || !trauma.trim()) {
      setMsg("User ID와 트라우마 서술을 모두 입력해주세요.");
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
      setMsg("트라우마 서술이 저장되었고, 키워드가 추출되었습니다.");
    } catch (err) {
      setMsg(`❌ 저장 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Intake – Trauma Narrative</h2>
      <p className="page-intro">
        아래에 본인의 트라우마 경험을 자유롭게 서술해주세요. 입력한 내용은 노출 스토리를
        생성하기 위한 키워드 추출에만 사용됩니다.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            placeholder="예: 33"
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label>Trauma Narrative</label>
          <textarea
            rows={6}
            value={trauma}
            placeholder="자신의 언어로 트라우마 경험을 간단히 설명해주세요."
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
            이 키워드들은 이후 세션에서 노출 스토리를 생성할 때 사용됩니다.
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
        <h3>SUDS 점수 안내</h3>
        <p className="help-text">
          세션에서는 현재 느끼는 괴로움 정도를 0–100 점 SUDS로 표시하게 됩니다.
          아래 표는 각 점수가 대략 어떤 느낌인지 설명합니다.
        </p>
        <SudsReferenceTable />

        {sudsScale && (
          <div className="suds-scale-raw">
            <h4>Backend SUDS Scale (raw)</h4>
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
    </div>
  );
}

export default Intake;
