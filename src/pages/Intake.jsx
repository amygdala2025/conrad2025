import { useState } from "react";

function Intake({ apiBase }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const FAKE_USER_ID = "test-user-1";

  const submitTrauma = async () => {
    try {
      const res = await fetch(`${apiBase}/api/intake/trauma`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FAKE_USER_ID}`,
        },
        body: JSON.stringify({ raw_text: text }),
      });

      const data = await res.json();
      setResult(
        `Saved! Trauma Profile ID: ${data.trauma_profile_id}\nKeywords: ${data.keywords.join(", ")}`
      );
    } catch (err) {
      setResult("Error sending trauma text to backend.");
    }
  };

  return (
    <div>
      <h2>Intake</h2>
      <p>Write your trauma narrative. Keywords will be extracted automatically.</p>

      <textarea
        style={{ width: "100%", height: "150px", marginTop: "0.5rem" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <br />

      <button onClick={submitTrauma} style={{ marginTop: "0.7rem" }}>
        Submit Trauma
      </button>

      <pre style={{ marginTop: "1rem", background: "#eee", padding: "1rem" }}>
        {result}
      </pre>
    </div>
  );
}

export default Intake;
