// src/SudsReferenceTable.jsx

const SUDS_ROWS = [
  {
    rating: "100",
    level: "Extreme Distress",
    desc: "상상할 수 있는 최악의 고통. 생각이 잘 안 나고, 거의 반사적으로만 반응하는 상태.",
  },
  {
    rating: "90's",
    level: "High to Extreme Distress",
    desc: "곧 폭발할 것 같은 느낌. 아무 것도 또렷하게 생각하기 어렵고, 매우 충동적인 선택을 하기 쉬운 상태.",
  },
  {
    rating: "80's",
    level: "High Distress",
    desc: "불안·슬픔·분노·긴장 같은 감정이 매우 강하게 느껴짐. 다른 일에 집중하기 힘든 상태.",
  },
  {
    rating: "70's",
    level: "Moderately High Distress",
    desc: "신경이 곤두서고, 조금씩 압도당하는 느낌. 집중하기가 점점 어려워지는 상태.",
  },
  {
    rating: "60's",
    level: "Moderate Distress",
    desc: "누구나 말하는 '힘든 하루' 정도. 그래도 해야 할 일은 어느 정도 해낼 수 있는 상태.",
  },
  {
    rating: "50's",
    level: "Mild to Moderate Distress",
    desc: "짜증·답답함·걱정이 계속 떠오르지만, 신체 증상이 아주 심하진 않은 상태.",
  },
  {
    rating: "40's",
    level: "Mild Distress",
    desc: "가벼운 긴장, 걱정, 짜증은 있지만 꽤 견딜 만한 수준.",
  },
  {
    rating: "30's",
    level: '"Normal"',
    desc: "긴장감은 약간 있지만, 일상생활을 하는 데 큰 어려움이 없는 상태.",
  },
  {
    rating: "20's",
    level: "Peaceful / Calm",
    desc: "편안하고 차분한 느낌. 따뜻한 공간에서 쉬고 있는 듯한 상태.",
  },
  {
    rating: "10's",
    level: "Very Relaxed",
    desc: "몸과 마음이 거의 완전히 이완된 느낌. 졸릴 정도로 편안한 상태.",
  },
  {
    rating: "0",
    level: "Complete Relaxation",
    desc: "긴장·불안·고통이 거의 없는 상태. 깊고 천천히 숨 쉬며 휴식하는 느낌.",
  },
];

function SudsReferenceTable() {
  return (
    <div className="suds-card">
      <div className="suds-card-header">
        <h3>"SUDS" Distress Ratings</h3>
        <p>
          SUDS(Subjective Units of Distress Scale)는 현재 느끼는 괴로움/불안의 정도를
          0에서 100까지 숫자로 표현하는 자기 보고 척도입니다.
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
