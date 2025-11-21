// src/pages/Intake.jsx
import { useState } from "react";

function Intake({ apiBase }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const FAKE_USER_ID = "test-user-1"; // Replace with Firebase token later

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${apiBase}/api/trauma-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FAKE_USER_ID}`,
        },
        body: JSON.stringify({ raw_text: text }),
      });
      if (!res.ok) throw new Error("Error");

      const data = await res.json();
      setResult(
        `Saved! trauma_profile_id=${data.trauma_profile_id}, keywords=${data.keywords.join(
          ", "
        )}`
      );
    } catch (e) {
      setResult("Error occurred: API / CORS / Token issue");
    }
  };

  return (
    <div>
      <h2>Intake</h2>
      <p>Enter your trauma narrative to test backend connection.</p>

      <textarea
        style={{ width: "100%", height: "150px", marginTop: "0.5rem" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br />
      <button onClick={handleSubmit} style={{ marginTop: "0.5rem" }}>
        Send to Backend
      </button>

      <p style={{ marginTop: "1rem" }}>{result}</p>
    </div>
  );
}

export default Intake;

