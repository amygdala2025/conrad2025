import { useState } from "react";

function Session({ apiBase }) {
  const [userId, setUserId] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [intensity, setIntensity] = useState(0.7);

  const [preSuds, setPreSuds] = useState(null);
  const [postSuds, setPostSuds] = useState(null);

  const [sessionId, setSessionId] = useState(null);
  const [story, setStory] = useState("");
  const [nextIntensity, setNextIntensity] = useState(null);

  const loadKeywords = async () => {
    const res = await fetch(`${apiBase}/api/dashboard/${userId}`);
    const data = await res.json();

    // trauma keywords = USERS[user_id].keywords 이므로 그냥 `api/trauma`에서 저장됨
    // Dashboard endpoint doesn't include keywords → we fetch from trauma endpoint
    const traumaRes = await fetch(`${apiBase}/api/trauma`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, trauma_text: "" })
    });

    // But more correct: you already saved keywords in intake
    // So we just fetch last known trauma keywords
    setKeywords(data.sessions.length > 0 ? data.sessions[0].keywords : []);
  };

  const requestStory = async () => {
    const res = await fetch(`${apiBase}/api/story`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        keywords,
        intensity
      })
    });

    const data = await res.json();
    setStory(data.story);
    setSessionId(data.session_id);
  };

  const submitPre = async () => {
    await fetch(`${apiBase}/api/suds/pre`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, suds_score: preSuds })
    });
  };

  const submitPost = async () => {
    const res = await fetch(`${apiBase}/api/suds/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, suds_score: postSuds })
    });

    const data = await res.json();
    setNextIntensity(data.new_intensity);
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <h2>Therapy Session</h2>

      <label>User ID</label>
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={loadKeywords}>Load Keywords</button>

      {keywords.length > 0 && (
        <div>
          <h3>Keywords</h3>
          <ul>{keywords.map(k => <li key={k}>{k}</li>)}</ul>
        </div>
      )}

      <label>Story Intensity (temperature)</label>
      <input
        type="number"
        step="0.1"
        min="0.1"
        max="1.5"
        value={intensity}
        onChange={(e) => setIntensity(parseFloat(e.target.value))}
      />

      <button onClick={requestStory} style={{ marginTop: 10 }}>
        Request Story
      </button>

      {story && (
        <div>
          <h3>Generated Story</h3>
          <p>{story}</p>

          <h3>Pre-session SUDS</h3>
          <input
            type="number"
            min="0"
            max="100"
            value={preSuds || ""}
            onChange={(e) => setPreSuds(parseInt(e.target.value))}
          />
          <button onClick={submitPre}>Submit Pre-SUDS</button>

          <h3>Post-session SUDS</h3>
          <input
            type="number"
            min="0"
            max="100"
            value={postSuds || ""}
            onChange={(e) => setPostSuds(parseInt(e.target.value))}
          />
          <button onClick={submitPost}>Submit Post-SUDS</button>

          {nextIntensity && (
            <p>➡ Next session recommended intensity: <b>{nextIntensity.toFixed(2)}</b></p>
          )}
        </div>
      )}
    </div>
  );
}

export default Session;
