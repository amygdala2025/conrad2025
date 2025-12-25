// src/pages/Team.jsx
import "./Team.css";

import coachImg from "./team_bio/coach.png";
import img0 from "./team_bio/image0.png";
import img1 from "./team_bio/image1.png";
import img2 from "./team_bio/image2.png";

function Team() {
  const coach = {
    name: "Jihwan",
    role: "Clinical Advisor",
    image: coachImg,
    bio: `I hold an undergraduate degree in Computer Engineering and previously worked as an AI researcher at a government-funded research institute, where I focused on applied machine learning and data-driven systems. I have also served as a reviewer for IEEE journals, contributing to the evaluation of academic research in the field of artificial intelligence. I am currently a medical student, integrating my background in engineering and AI with clinical training. In parallel, I have participated in multiple medical AI competitions and received several awards for projects focused on healthcare applications. My role in this project is to provide high-level clinical and technical guidance, ensuring that the platform remains clinically informed, ethically grounded, and technically sound.`,
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
I worked on maintaining the website and implementing improvements to enhance usability.`,
    },
  ];

  return (
    <div className="team-page">
      <h2 className="team-title">Team</h2>

      {/* ===== Coach ===== */}
      <div className="team-row coach-row">
        <div className="team-image-wrap">
          <img src={coach.image} alt="Team Coach" />
        </div>

        <div className="team-content">
          <div className="coach-badge">Coach</div>
          <h3 className="team-name">{coach.name}</h3>
          <div className="team-role">{coach.role}</div>
          <p className="team-bio">{coach.bio}</p>
        </div>
      </div>

      {/* ===== Members ===== */}
      {members.map((m, idx) => (
        <div key={idx} className="team-row">
          <div className="team-image-wrap">
            <img src={m.image} alt={m.name} />
          </div>

          <div className="team-content">
            <h3 className="team-name">{m.name}</h3>
            <div className="team-role">{m.role}</div>
            <p className="team-bio">{m.bio}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Team;
