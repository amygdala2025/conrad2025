// src/pages/Team.jsx
import "./Team.css";

import coachImg from "./team_bio/coach.png";
import img0 from "./team_bio/image0.png";
import img1 from "./team_bio/image1.png";
import img2 from "./team_bio/image2.png";

function Team() {
  const coach = {
    name: "Team Coach",
    role: "Clinical Advisor",
    image: coachImg,
    bio: `This project was developed with guidance from a clinician experienced in trauma-informed care.
The coach provided high-level feedback on safety boundaries, exposure principles, and ethical considerations.
(This description is a placeholder and will be updated.)`,
  };

  const members = [
    {
      name: "Jeongjin",
      role: "Project Lead",
      image: img0,
      bio: `Hello, my name is Jeongjin, and I am a senior at Fiorello H. LaGuardia High School.
As the project leader, I guided the team, coordinated research and development, and managed the design and implementation of the platform.`,
    },
    {
      name: "Naryn",
      role: "Research & Product",
      image: img1,
      bio: `Hello, my name is Naryn, and I am a freshman at Fiorello H. LaGuardia High School.
I worked on research, design, and technical execution, helping translate complex user needs into cohesive platform features.`,
    },
    {
      name: "Simon",
      role: "Web & Maintenance",
      image: img2,
      bio: `Hello, my name is Simon, and I am a freshman at Syosset High School.
I worked on maintaining the website and implementing improvements to enhance usability and overall user experience.`,
    },
  ];

  return (
    <div className="team-page">
      <h2 className="team-title">Team</h2>

      {/* ===== Coach Section ===== */}
      <div className="coach-card">
        <img
          src={coach.image}
          alt="Team Coach"
          className="coach-image"
        />

        <div className="coach-content">
          <div className="coach-badge">Coach</div>
          <h3 className="coach-name">{coach.name}</h3>
          <div className="coach-role">{coach.role}</div>
          <p className="coach-bio">{coach.bio}</p>
        </div>
      </div>

      {/* ===== Members ===== */}
      <div className="team-list">
        {members.map((m, idx) => (
          <div key={idx} className="team-card">
            <img
              src={m.image}
              alt={m.name}
              className="team-image"
            />
            <div className="team-text">
              <h3 className="team-name">{m.name}</h3>
              <div className="team-role">{m.role}</div>
              <p className="team-bio">{m.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Team;
