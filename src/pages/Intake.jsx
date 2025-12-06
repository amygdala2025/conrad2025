// src/pages/Intake.jsx
import { useState } from "react";

const ADMIN_USER_ID = "amygdala_admin";

function Intake({ apiBase }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "update"
  const [userId, setUserId] = useState(
    localStorage.getItem("ptsd_user_id") || ""
  );
  const [password, setPassword] = useState("");
  const [trauma, setTrauma] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = userId.trim() === ADMIN_USER_ID;

  const saveAuthToLocalStorage = (uid, token) => {
    if (uid) {
      localStorage.setItem("ptsd_user_id", uid);
      setUserId(uid);
    }
    if (token) {
      localStorage.setItem("ptsd_token", token);
    }
  };

  // ---------------------------
  // 1) 회원가입 (/api/register)
  // ---------------------------
  const handleRegister = async () => {
    setMsg("");
    if (!userId || !password || !trauma) {
      setMsg("❌ user id, password, trauma 내용을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          password,
          trauma_text: trauma,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      saveAuthToLocalStorage(data.user_id, data.token);
      setMsg("✅ 회원가입 및 초기 trauma 저장이 완료되었습니다.");
      setPassword("");
    } catch (err) {
      setMsg(`❌ Register failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 2) 로그인 (/api/login)
  // ---------------------------
  const handleLogin = async () => {
    setMsg("");
    if (!userId || !password) {
      setMsg("❌ user id와 password를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          password,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      saveAuthToLocalStorage(data.user_id, data.token);
      setMsg(
        data.is_admin
          ? "✅ Admin 계정으로 로그인되었습니다."
          : "✅ 로그인에 성공했습니다."
      );
      setPassword("");
    } catch (err) {
      setMsg(`❌ Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 3) (기존 호환) trauma 업데이트 (/api/intake)
  // ---------------------------
  const handleUpdateTrauma = async () => {
    setMsg("");
    if (!userId) {
      setMsg("❌ User ID를 먼저 입력해주세요.");
      return;
    }
    if (!trauma) {
      setMsg("❌ 업데이트할 trauma 내용을 입력해주세요.");
      return;
    }

    const token = localStorage.getItem("ptsd_token");
    if (!token) {
      setMsg("❌ 토큰이 없습니다. 먼저 회원가입/로그인 또는 초기 intake를 완료하세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auth-Token": token,
        },
        body: JSON.stringify({
          user_id: userId,
          trauma_text: trauma,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMsg(`✅ Trauma narrative가 업데이트되었습니다. (${data.message})`);
    } catch (err) {
      setMsg(`❌ Trauma update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // 4) ADMIN 로그인 (기존 방식 유지)
  // ---------------------------
  const handleAdminLogin = async () => {
    setMsg("");
    if (!isAdmin) {
      setMsg("❌ Admin ID(amygdala_admin)를 입력해야 합니다.");
      return;
    }
    if (!adminPw) {
      setMsg("❌ Admin password를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Password": adminPw,
        },
        body: JSON.stringify({
          user_id: ADMIN_USER_ID,
          trauma_text: "",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      saveAuthToLocalStorage(data.user_id, data.token);
      setMsg("✅ Admin 토큰이 발급되었습니다.");
    } catch (err) {
      setMsg(`❌ Admin auth failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onChangeUserId = (e) => {
    setUserId(e.target.value);
    localStorage.setItem("ptsd_user_id", e.target.value);
  };

  return (
    <div className="page">
      <h1>Intake / Account</h1>
      <p className="page-intro">
        이 페이지에서는 계정을 만들고(회원가입), 로그인하며, 필요하다면
        trauma narrative를 업데이트할 수 있습니다.
      </p>

      {/* 공통: User ID 입력 */}
      <div className="card">
        <div className="field-group">
          <label>User ID</label>
          <input
            type="text"
            value={userId}
            onChange={onChangeUserId}
            placeholder="예: user123"
          />
        </div>

        {/* 모드 선택 */}
        <div className="field-group">
          <label>Mode</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className={mode === "login" ? "primary-btn" : ""}
              onClick={() => setMode("login")}
            >
              로그인
            </button>
            <button
              type="button"
              className={mode === "register" ? "primary-btn" : ""}
              onClick={() => setMode("register")}
            >
              회원가입(신규 유저)
            </button>
            <button
              type="button"
              className={mode === "update" ? "primary-btn" : ""}
              onClick={() => setMode("update")}
            >
              Trauma 업데이트
            </button>
          </div>
          <p className="help-text">
            - 신규 유저: <b>회원가입</b> 탭에서 ID/PW + 초기 trauma 입력
            <br />
            - 기존 유저: <b>로그인</b> 후 필요 시 <b>Trauma 업데이트</b> 사용
          </p>
        </div>

        {/* 비밀번호 입력 (로그인/회원가입 공통) */}
        {(mode === "login" || mode === "register") && (
          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
            />
          </div>
        )}

        {/* Trauma 입력 (회원가입 / 업데이트에서 사용) */}
        {(mode === "register" || mode === "update") && (
          <div className="field-group">
            <label>Trauma narrative</label>
            <textarea
              rows={6}
              value={trauma}
              onChange={(e) => setTrauma(e.target.value)}
              placeholder="노출치료에 사용할 trauma 내용을 구체적으로 적어주세요."
            />
            <p className="help-text">
              너무 짧은 한 줄보다는, 당시 상황(장소, 사람, 감각, 감정)을 최대한
              구체적으로 적을수록 노출 스토리가 더 정밀해집니다.
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="field-group">
          {mode === "register" && (
            <button
              type="button"
              className="primary-btn"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? "Processing…" : "회원가입 + 초기 Trauma 저장"}
            </button>
          )}
          {mode === "login" && (
            <button
              type="button"
              className="primary-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Processing…" : "로그인"}
            </button>
          )}
          {mode === "update" && (
            <button
              type="button"
              className="primary-btn"
              onClick={handleUpdateTrauma}
              disabled={loading}
            >
              {loading ? "Processing…" : "Trauma 업데이트"}
            </button>
          )}
        </div>
      </div>

      {/* Admin 전용 카드 */}
      {isAdmin && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Admin Login</h2>
          <div className="field-group">
            <label>Admin Password</label>
            <input
              type="password"
              value={adminPw}
              onChange={(e) => setAdminPw(e.target.value)}
              placeholder="ADMIN_PASSWORD 환경변수에 설정한 값"
            />
            <p className="help-text">
              Admin 계정은 전체 세션/스토리 export 기능을 사용할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            className="primary-btn"
            onClick={handleAdminLogin}
            disabled={loading}
          >
            {loading ? "Processing…" : "Admin 토큰 발급"}
          </button>
        </div>
      )}

      {msg && <p className="status-text">{msg}</p>}
    </div>
  );
}

export default Intake;
