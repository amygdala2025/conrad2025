// src/SudsReferenceTable.jsx

const SUDS_ROWS = [
  {
    rating: "100",
    level: "Extreme Distress",
    desc: "The highest imaginable level of distress. Thinking is nearly impossible, and reactions may be almost automatic or instinctive.",
  },
  {
    rating: "90's",
    level: "High to Extreme Distress",
    desc: "Feeling like you may burst. Very difficult to think clearly; extremely impulsive choices may feel tempting.",
  },
  {
    rating: "80's",
    level: "High Distress",
    desc: "Strong feelings of anxiety, sadness, fear, or tension. Very hard to concentrate on anything else.",
  },
  {
    rating: "70's",
    level: "Moderately High Distress",
    desc: "Noticeably tense and increasingly overwhelmed. Concentration is becoming more difficult.",
  },
  {
    rating: "60's",
    level: "Moderate Distress",
    desc: "A noticeably difficult moment or challenging day, but still able to function and complete needed tasks.",
  },
  {
    rating: "50's",
    level: "Mild to Moderate Distress",
    desc: "Persistent worry, irritability, or discomfort. Emotionally unpleasant but not physically overwhelming.",
  },
  {
    rating: "40's",
    level: "Mild Distress",
    desc: "Mild tension or worry, but generally manageable and tolerable.",
  },
  {
    rating: "30's",
    level: "“Normal”",
    desc: "Light tension or mild stress but not enough to interfere with daily activities.",
  },
  {
    rating: "20's",
    level: "Peaceful / Calm",
    desc: "Relaxed and comfortable. A sense of warmth and calmness, like resting in a safe environment.",
  },
  {
    rating: "10's",
    level: "Very Relaxed",
    desc: "Deep physical and mental relaxation. Peaceful, drowsy, and calm.",
  },
  {
    rating: "0",
    level: "Complete Relaxation",
    desc: "No noticeable distress. Breathing slowly, feeling grounded, safe, and fully at ease.",
  },
];

function SudsReferenceTable() {
  return (
    <div className="suds-card">
      <div className="suds-card-header">
        <h3>"SUDS" Distress Ratings</h3>
        <p>
          The SUDS (Subjective Units of Distress Scale) is a self-reported measure
          that describes your current level of distress or anxiety on a scale from
          0 to 100.
        </p>
      </div>

      <div className="suds-table-wrapper">
        <table className="suds-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>SUDS</th>
              <th style={{ width: "140px" }}>Level</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {SUDS_ROWS.map((row) => (
              <tr key={row.rating}>
                <td>
                  <span
                    className={`suds-rating-badge suds-${row.rating.replace(
                      "'",
                      ""
                    )}`}
                  >
                    {row.rating}
                  </span>
                </td>
                <td>{row.level}</td>
                <td>{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SudsReferenceTable;
