"use client";
import { usePathname } from "next/navigation";

export default function Miscellaneous() {
  const pathname = usePathname();
  const navLinks = [
    { id: "home", label: "Home", isSection: false, href: "/" },
    { id: "projects", label: "Project", isSection: false, href: "/projects" },
    {
      id: "miscellaneous",
      label: "Miscellaneous",
      isSection: false,
      href: "/class-projects",
    },
    {
      id: "resume",
      label: "Resume",
      isSection: false,
      href: "/Stan_resume_1221.pdf",
      download: true,
    },
  ];

  const volunteeringExperiences = [
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
      link: "https://weingartencenter.universitylife.upenn.edu/tutoring-services/",
    },
  ];

  return (
    <div className="min-h-screen bg-[#222831]">
      {/* Standard Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#222831] border-b border-white">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Name on the left */}
            <div className="text-white font-semibold text-lg">
              Stan Chen
            </div>

            {/* Nav items on the right */}
            <div className="flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <a
                    key={link.id}
                    href={link.isSection ? `#${link.id}` : link.href}
                    download={link.download ? "Stan_Chen_Resume.pdf" : undefined}
                    className={`text-white text-sm font-medium px-3 py-1.5 rounded transition-all duration-300 ${isActive
                      ? "shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                      : "hover:text-white/80 hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                      }`}
                    style={isActive ? { textShadow: "0 0 8px rgba(255, 255, 255, 0.6), 0 0 15px rgba(255, 255, 255, 0.4)" } : {}}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-32 pb-16">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-white text-5xl md:text-6xl font-bold mb-4">
            Miscellaneous
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            A collection of my volunteering work and musical pursuits.
          </p>
        </div>
      </section>

      {/* Volunteering Section */}
      <section id="volunteering" className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white text-4xl font-bold mb-16 text-left">
            Volunteering
          </h2>
          <div className="space-y-12">
            {volunteeringExperiences.map((exp, index) => (
              <div key={index} className="space-y-4">
                <div>
                  <h3 className="text-white text-3xl font-bold mb-2">
                    {exp.title}
                  </h3>
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 text-lg hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    {exp.organization}
                    <svg
                      className="w-4 h-4"
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
                  <div className="flex flex-wrap gap-4 text-white/50 text-sm mt-2">
                    <span>{exp.period}</span>
                    <span>•</span>
                    <span>{exp.location}</span>
                  </div>
                </div>
                <p className="text-white/80 text-base leading-relaxed">
                  {exp.description}
                </p>
                <ul className="space-y-3 pt-2">
                  {exp.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-white/70 text-sm">
                      <span className="text-white/50 mt-1.5">▸</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
                {index < volunteeringExperiences.length - 1 && (
                  <div className="h-px bg-white/10 mt-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Music Section */}
      <section id="music" className="px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white text-4xl font-bold mb-16 text-left">
            Music
          </h2>

          {/* Group Info */}
          <div className="text-left mb-12">
            <h3 className="text-white text-3xl font-bold mb-2">
              Penn Enchord Acapella Group
            </h3>
            <p className="text-white/70 text-lg mb-1">
              Beatboxer
            </p>
          </div>

          {/* YouTube Videos */}
          <div className="space-y-8">
            <h3 className="text-white text-2xl font-semibold mb-6 text-center">
              Performances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* La La Land Medley */}
              <div className="space-y-3">
                <h4 className="text-white text-lg font-medium">
                  La La Land Medley
                </h4>
                <div className="aspect-video bg-white/5 rounded overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/OKHCbsXj2z0"
                    title="La La Land Medley - Penn Enchord"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* The Greatest Showman Medley */}
              <div className="space-y-3">
                <h4 className="text-white text-lg font-medium">
                  The Greatest Showman Medley
                </h4>
                <div className="aspect-video bg-white/5 rounded overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/G_HLW_cLYLg"
                    title="The Greatest Showman Medley - Penn Enchord"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Defying Gravity */}
              <div className="space-y-3">
                <h4 className="text-white text-lg font-medium">
                  Defying Gravity
                </h4>
                <div className="aspect-video bg-white/5 rounded overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/7KYvz_8U7Es"
                    title="Defying Gravity - Penn Enchord"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Add more videos as needed */}
              <div className="space-y-3">
                <h4 className="text-white text-lg font-medium">
                  Additional Performance
                </h4>
                <div className="aspect-video bg-white/5 rounded overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/sOUs0JkoKG4"
                    title="Additional Performance - Penn Enchord"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-20 z-10 border-t border-white/10">
        <div className="bg-white py-10 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-600 text-sm mb-2">
              © 2025 Stan Chen
            </p>
            <p className="text-gray-400 text-xs">
              Built with Next.js
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
