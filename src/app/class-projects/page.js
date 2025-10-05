"use client";
import { useState } from "react";

export default function Volunteering() {
  const [navExpanded, setNavExpanded] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  const navLinks = [
    { id: "home", label: "Home", isSection: false, href: "/" },
    { id: "projects", label: "Project", isSection: false, href: "/projects" },
    {
      id: "volunteering",
      label: "Volunteering",
      isSection: false,
      href: "/volunteering",
    },
  ];

  const experiences = [
    {
      title: "Teaching Assistant",
      organization: "PACT-ASIA Program",
      period: "Summer 2023 & 2024",
      location: "Remote",
      description:
        "Served as a teaching assistant for two consecutive summers, helping students develop their DSA skills and fostering a collaborative learning environment.",
      responsibilities: [
        "Assisted in curriculum development and lesson planning for computer science courses",
        "Conducted one-on-one tutoring sessions to help students understand complex programming concepts",
        "Graded assignments and provided detailed feedback to support student learning",
        "Facilitated group discussions and collaborative problem-solving sessions",
        "Mentored students on academic and career development in tech",
      ],
      icon: "🎓",
      color: "#b68d40",
      link: "https://algorithmicthinking.org/",
    },
    {
      title: "Academic Tutor",
      organization: "Weingarten Center at Penn",
      period: "2023 - Present",
      location: "University of Pennsylvania",
      description:
        "Providing personalized academic support to undergraduate students across computer science courses.",
      responsibilities: [
        "Offer individualized tutoring sessions in CIS1210: Data Structures and Algorithms at Penn",
        "Help students develop effective study strategies and problem-solving techniques",
        "Create supplementary learning materials and practice problems",
        "Adapt teaching methods to accommodate different learning styles",
        "Track student progress and adjust tutoring approach accordingly",
      ],
      icon: "📚",
      color: "#0274b3",
      link: "https://weingartencenter.universitylife.upenn.edu/tutoring-services/",
    },
  ];

  return (
    <div className="min-h-screen bg-[#222831]">
      {/* Pokeball Navbar */}
      <nav className="fixed top-8 left-8 z-50">
        <div className="relative">
          {/* Expanded Navbar */}
          {navExpanded && (
            <div
              className="bg-white rounded-3xl shadow-2xl px-8 py-4 flex items-center gap-8"
              style={{
                animation: "expandNav 0.3s ease-out forwards",
                minWidth: "500px",
              }}
            >
              <button
                onClick={() => setNavExpanded(false)}
                className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden hover:scale-110 transition-transform duration-200"
              >
                <img
                  src="/pokeball.png"
                  alt="Pokeball"
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="flex gap-8 relative">
                {navLinks.map((link) => (
                  <div
                    key={link.id}
                    className="relative"
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <a
                      href={link.isSection ? `#${link.id}` : link.href}
                      className="text-black font-medium hover:text-gray-600 transition-colors"
                      onClick={() => setNavExpanded(false)}
                    >
                      {link.label}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Collapsed Pokemon Ball Button */}
          {!navExpanded && (
            <div className="relative">
              <button
                onClick={() => setNavExpanded(true)}
                className="w-20 h-20 rounded-full overflow-hidden hover:scale-110 transition-transform duration-200"
              >
                <img
                  src="/pokeball.png"
                  alt="Pokeball"
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="absolute left-24 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <img
                  src="/arrow.png"
                  alt="Arrow"
                  className="w-16 h-16 object-contain"
                />
                <div
                  className="text-white text-lg font-black whitespace-nowrap"
                  style={{
                    fontFamily:
                      "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive",
                    textShadow:
                      "3px 3px 0px rgba(0,0,0,0.3), -1px -1px 0px rgba(255,215,0,0.3)",
                    letterSpacing: "1px",
                    transform: "rotate(-5deg)",
                  }}
                >
                  Click the Pokéball!
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Animations */}
      <style jsx global>{`
        @keyframes expandNav {
          from {
            width: 80px;
            opacity: 0;
          }
          to {
            width: 500px;
            opacity: 1;
          }
        }
      `}</style>

      {/* Link fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Rock+Salt&family=Racing+Sans+One&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />

      {/* Hero Section */}
      <section className="px-8 pt-32 pb-16">
        <div className="max-w-6xl mx-auto">
          <h1
            className="text-white text-6xl mb-6 text-center"
            style={{ fontFamily: "Rock Salt, cursive" }}
          >
            Volunteering
          </h1>
          <p className="text-[#DFD0B8] text-xl text-center max-w-3xl mx-auto leading-relaxed">
            Giving back to the community through education and mentorship. I'm
            passionate about helping students discover their potential and
            develop their skills in computer science and mathematics.
          </p>
        </div>
      </section>

      {/* Experience Cards */}
      <section className="px-8 pb-20">
        <div className="max-w-6xl mx-auto space-y-12">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="bg-[#393E46] rounded-lg shadow-2xl overflow-hidden border-l-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(223,208,184,0.3)] hover:scale-[1.02]"
              style={{ borderLeftColor: exp.color }}
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start gap-6 mb-6">
                  <div
                    className="text-6xl flex-shrink-0 w-20 h-20 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: `${exp.color}20` }}
                  >
                    {exp.icon}
                  </div>
                  <div className="flex-grow">
                    <h2
                      className="text-[#DFD0B8] text-3xl font-bold mb-2"
                      style={{ fontFamily: "Racing Sans One" }}
                    >
                      {exp.title}
                    </h2>
                    <a
                      href={exp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-xl mb-2 hover:text-[#DFD0B8] transition-colors inline-flex items-center gap-2 group"
                    >
                      {exp.organization}
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                    <div className="flex flex-wrap gap-4 text-[#DFD0B8]/80">
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {exp.period}
                      </span>
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {exp.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white text-lg leading-relaxed mb-6">
                  {exp.description}
                </p>

                {/* Responsibilities */}
                <div>
                  <h4 className="text-[#DFD0B8] text-xl font-semibold mb-4">
                    Key Responsibilities & Impact
                  </h4>
                  <ul className="space-y-3">
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <svg
                          className="w-6 h-6 flex-shrink-0 mt-0.5"
                          style={{ color: exp.color }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-white/90 leading-relaxed">
                          {resp}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Statement */}
      <section className="px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#393E46] p-10 rounded-lg shadow-2xl border-4 border-[#DFD0B8]">
            <h2
              className="text-[#DFD0B8] text-3xl font-bold mb-6 text-center"
              style={{ fontFamily: "Rock Salt, cursive" }}
            >
              Why I Volunteer
            </h2>
            <p className="text-white text-lg leading-relaxed text-center">
              Education transformed my life, and I believe everyone deserves
              access to quality learning experiences. Through tutoring and
              teaching, I aim to make computer science more accessible and help
              students build confidence in their abilities. Watching students
              have their "aha!" moments and seeing them grow academically is
              incredibly rewarding.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-20">
        <div className="relative">
          <svg
            className="w-full h-24 md:h-32"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="#DFD0B8"
              fillOpacity="0.2"
            />
            <path
              d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,64C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="#DFD0B8"
              fillOpacity="0.4"
            />
            <path
              d="M0,96L48,90.7C96,85,192,75,288,74.7C384,75,480,85,576,90.7C672,96,768,96,864,90.7C960,85,1056,75,1152,74.7C1248,75,1344,85,1392,90.7L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
              fill="#DFD0B8"
            />
          </svg>
        </div>
        <div className="bg-[#DFD0B8] py-12 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="border-t border-[#393E46]/20 pt-6 text-center">
              <p className="text-[#393E46]/70 text-sm">
                © 2025 Stan Chen. Built with Next.js
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
