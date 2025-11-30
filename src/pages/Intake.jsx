import { useState } from "react";

function Intake({ apiBase }) {
  const [userId, setUserId] = useState(
    localStorage.getItem("ptsd_user_id") || ""
  );
  const [trauma, setTrauma] = useState("");
  const [adminPw, setAdminPw] = useState("");   // 🔐 admin password
  const [keywords, setKeywords] = useState([]); // (현재는 백엔드에서 안 쓰지만 UI는 유지)
  const [msg, setMsg] = useState("");

  const submitTrauma = async () => {
    setMsg("");
    const isAdmin = userId.trim() === "amygdala_admin";

    if (!userId) {
      setMsg("Please enter a User ID.");
      return;
    }

    // admin은 trauma 대신 password가 필수
    if (isAdmin && !adminPw) {
      setMsg("Admin password is required for amygdala_admin.");
      return;
    }

    // 일반 유저는 trauma 필수
    if (!isAdmin && !trauma.trim()) {
      setMsg("Please enter both User ID and trauma narrative.");
      return;
    }

    const token = localStorage.getItem("ptsd_token") || null;
    const headers = { "Content-Type": "application/json" };

    if (isAdmin) {
      headers["X-Admin-Password"] = adminPw;
      // admin 로그인 시에는 기존 일반 유저 토큰은 사용하지 않음
    } else if (token) {
      headers["X-Auth-Token"] = token;
    }

    try {
      const res = await fetch(`${apiBase}/api/intake`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          user_id: userId,
          trauma_text: trauma, // admin일 때는 백엔드에서 무시됨
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

      // 새 user_id / admin이면 토큰이 내려옴 → 저장
      if (data.token) {
        localStorage.setItem("ptsd_token", data.token);
        localStorage.setItem("ptsd_user_id", data.user_id);
      }

      setMsg(data.message || "Trauma narrative saved.");
      // keywords는 나중에 백엔드가 지원하면 여기서 setKeywords()로 업데이트 가능
    } catch (err) {
      setMsg(
        `❌ Error while saving trauma: ${
          err && err.message ? err.message : String(err)
        }`
      );
    }
  };

  const isAdmin = userId.trim() === "amygdala_admin";

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
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={userId}
              placeholder="e.g., 0001 or amygdala_admin"
              onChange={(e) => setUserId(e.target.value)}
              style={{ flex: 1 }}
            />

            {/* 🔐 admin일 때만 나타나는 password 입력칸 */}
            {isAdmin && (
              <input
                type="password"
                value={adminPw}
                placeholder="Admin Password"
                onChange={(e) => setAdminPw(e.target.value)}
                style={{ flexBasis: "40%" }}
              />
            )}
          </div>
        </div>

        <div className="field-group">
          <label>Trauma Narrative</label>
          <textarea
            rows={8}
            value={trauma}
            placeholder={
              isAdmin
                ? "Admin login does not require trauma text here."
                : "Write a brief description of your trauma experience here…"
            }
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
          {!isAdmin && (
            <p className="help-text">
              A few sentences focusing on the key moment are enough for the
              system to work.
            </p>
          )}
          {isAdmin && (
            <p className="help-text">
              For the admin account, only the User ID and Admin Password are
              required to authenticate.
            </p>
          )}
        </div>

        <button type="button" className="primary-btn" onClick={submitTrauma}>
          Save Trauma
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

      {/* 🔥 기존의 "Backend SUDS Scale (reference)" 카드는 완전히 제거됨 */}
    </div>
  );
}

export default Intake;
