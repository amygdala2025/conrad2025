// src/pages/Intake.jsx
import { useState } from "react";

const ADMIN_USER_ID = "amygdala_admin";

// Cloud Run backend URL (no trailing slash)
const API_BASE =
  "https://ptsd-backend-761910111968.asia-northeast3.run.app";

function Intake() {
  const [mode, setMode] = useState("login"); // "login" | "register" | "update"
  const [userId, setUserId] = useState(
    localStorage.getItem("ptsd_user_id") || ""
  );
  const [password, setPassword] = useState("");
  const [trauma, setTrauma] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdminId = userId.trim() === ADMIN_USER_ID;

  const saveAuthToLocalStorage = (uid, token) => {
    if (uid) localStorage.setItem("ptsd_user_id", uid);
    if (token) localStorage.setItem("ptsd_token", token);
  };

  const clearPasswords = () => {
    setPassword("");
    setAdminPw("");
  };

  // ---------------------------
  // 1) Register (new user)
  //    → POST /api/intake  (main.py와 정확히 일치)
  // ---------------------------
  const handleRegister = async () => {
    setMsg("");
    const trimmedId = userId.trim();

    if (!trimmedId || !password || !trauma) {
      setMsg("❌ Please enter user ID, password, and trauma narrative.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: trimmedId,
          password,
          trauma_narrative: trauma, // 🔑 필드 이름 main.py와 동일
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }

      const data = await res.json(); // { user_id, token }
      saveAuthToLocalStorage(data.user_id, data.token);
      setMsg("✅ Registered successfully and saved initial trauma narrative.");
      clearPasswords();
    } catch (err) {
      setMsg(`❌ Register failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 2) Login → POST /api/login
  // ---------------------------
  const handleLogin = async () => {
    setMsg("");
    const trimmedId = userId.trim();

    if (!trimmedId || !password) {
      setMsg("❌ Please enter user ID and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: trimmedId,
          password,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }

      const data = await res.json(); // { user_id, token }
      saveAuthToLocalStorage(data.user_id, data.token);
      setMsg("✅ Logged in successfully.");
      clearPasswords();
    } catch (err) {
      setMsg(`❌ Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 3) Update trauma (아직 백엔드 엔드포인트 없음)
  //    → 일단 안내 메시지만
  // ---------------------------
  const handleUpdateTrauma = async () => {
    setMsg(
      "ℹ️ Updating trauma narrative is not implemented on the backend yet. " +
        "For now, please register a new test user if you want to try a different narrative."
    );
  };

  // ---------------------------
  // 4) Admin login helper
  // ---------------------------
  const handleAdminLogin = async () => {
    setMsg("");
    if (!isAdminId) {
      setMsg(`❌ User ID must be "${ADMIN_USER_ID}" for admin login.`);
      return;
    }
    if (!adminPw) {
      setMsg("❌ Please enter the admin password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: ADMIN_USER_ID,
          password: adminPw,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }

      const data = await res.json(); // { user_id, token }
      saveAuthToLocalStorage(data.user_id, data.token);
      setMsg("✅ Admin login successful. Token issued.");
      clearPasswords();
    } catch (err) {
      setMsg(`❌ Admin login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="page">
      <h1>Intake / Account</h1>
      <p className="page-intro">
        On this page, you can create an account, log in, and (in future
        updates) edit your trauma narrative.
      </p>

      <div className="card">
        {/* User ID */}
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="e.g., jihan1008"
          />
        </div>

        {/* Mode selector */}
        <div className="field-group">
          <label>Mode</label>
          <div className="segmented-control">
            <button
              type="button"
              className={mode === "login" ? "seg-button active" : "seg-button"}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={
                mode === "register" ? "seg-button active" : "seg-button"
              }
              onClick={() => setMode("register")}
            >
              Register (new user)
            </button>
            <button
              type="button"
              className={
                mode === "update" ? "seg-button active" : "seg-button"
              }
              onClick={() => setMode("update")}
            >
              Update trauma narrative
            </button>
          </div>
          <p className="help-text">
            • New users: choose <b>Register (new user)</b> and enter ID / PW and
            initial trauma narrative.
            <br />
            • Existing users: <b>Login</b> with your ID / PW. Trauma editing
            will be added in a later version.
          </p>
        </div>

        {/* Password for login/register */}
        {(mode === "login" || mode === "register") && (
          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {/* Trauma narrative (register only, for now) */}
        {mode === "register" && (
          <div className="field-group">
            <label>Trauma narrative</label>
            <textarea
              rows={8}
              value={trauma}
              onChange={(e) => setTrauma(e.target.value)}
              placeholder="Describe the event in as much concrete detail as you feel comfortable: place, people, sensory details, emotions, etc."
            />
            <p className="help-text">
              More concrete descriptions (where, who, what you saw, heard, felt)
              help the model generate a more precise exposure story, while you
              can still respect your own limits.
            </p>
          </div>
        )}

        {/* Primary actions */}
        <div className="field-group">
          {mode === "register" && (
            <button
              type="button"
              className="primary-btn"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Processing…" : "Register + save initial trauma"}
            </button>
          )}
          {mode === "login" && (
            <button
              type="button"
              className="primary-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Processing…" : "Login"}
            </button>
          )}
          {mode === "update" && (
            <button
              type="button"
              className="primary-btn"
              onClick={handleUpdateTrauma}
              disabled={loading}
            >
              Update trauma narrative (info)
            </button>
          )}
        </div>

        {/* Admin section */}
        <div className="card" style={{ marginTop: 24 }}>
          <h2>Admin login</h2>
          <p className="help-text">
            Admin ID is <b>{ADMIN_USER_ID}</b>. Use this only for the dashboard
            and CSV export.
          </p>
          <div className="field-group">
            <label>Admin password</label>
            <input
              type="password"
              value={adminPw}
              onChange={(e) => setAdminPw(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleAdminLogin}
            disabled={loading}
          >
            {loading ? "Processing…" : "Admin login (issue token)"}
          </button>
        </div>

        {msg && <p className="status-text">{msg}</p>}
      </div>
    </div>
  );
}

export default Intake;
