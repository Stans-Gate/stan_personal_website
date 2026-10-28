// ALL portfolio content lives here. The dungeon scene, the info panels, the
// lectern and the list view are generated from this file: adding a project
// means adding one object to `entries`.

export type IconName = "briefcase" | "rune" | "cube" | "trophy" | "scroll";

export interface Category {
  label: string;
  glow: string;
  icon: IconName;
}

export const categories = {
  work: { label: "Experience", glow: "#F2B33D", icon: "briefcase" },
  software: { label: "Projects", glow: "#3EE6D0", icon: "rune" },
  graphics: { label: "Graphics", glow: "#A066FF", icon: "cube" },
  hackathon: { label: "Hackathon", glow: "#FF4D5E", icon: "trophy" },
  teaching: { label: "Teaching", glow: "#4CDB6A", icon: "scroll" },
} satisfies Record<string, Category>;

export type CategoryId = keyof typeof categories;

export interface EntryLinks {
  demo?: string;
  github?: string;
  caseStudy?: string;
  devpost?: string;
  video?: string;
  website?: string;
}

export const linkLabels: Record<keyof EntryLinks, string> = {
  demo: "Live demo",
  github: "GitHub",
  caseStudy: "Case study",
  devpost: "Devpost",
  video: "Demo video",
  website: "Website",
};

export interface Entry {
  id: string;
  category: CategoryId;
  title: string;
  // experience-style entries
  org?: string;
  dates?: string;
  // project-style entries
  pitch?: string;
  year?: number;
  highlights: string[];
  tech: string[];
  links: EntryLinks;
  image: string | null;
  note?: string;
}

export const owner = {
  name: "Stan Chen",
  title: "CS & Robotics @ Penn",
  blurb:
    "B.S.E. in Computer and Information Science and M.S.E. in Robotics at the University of Pennsylvania (expected May 2027). Passionate about full-stack development, reliable and scalable systems, and creative user interfaces.",
  url: "https://www.schen473.com",
};

export const entries: Entry[] = [
  // ---- Experience ----
  {
    id: "sfcu-cto",
    category: "work",
    title: "Chief Technology Officer",
    org: "UPenn Student Federal Credit Union",
    dates: "Sep 2025 – Present",
    highlights: [
      "Architected hybrid Hyper-V/AWS infrastructure hosting the public React website and internal systems, with PowerShell automation for 99.9% uptime and NCUA compliance.",
      "Secured internal networks via Active Directory and Cisco Meraki, with automated vulnerability scanning to protect sensitive PII.",
    ],
    tech: ["AWS", "Hyper-V", "PowerShell", "Active Directory", "Cisco Meraki", "MySQL", "React"],
    links: {},
    image: null,
  },
  {
    id: "nexttier-intern",
    category: "work",
    title: "Crypto Platform Reliability & CI/CD Automation Intern",
    org: "NextTier",
    dates: "May 2025 – Aug 2025",
    highlights: [
      "Scaled throughput with parallel processing across 100+ currencies and Redis distributed locks, cutting load time from 8 hours to 30 seconds.",
      "Raised code coverage from 55% to 85% with JUnit unit and integration tests while auditing code for vulnerabilities.",
      "Built a CI/CD pipeline (Maven, JUnit, GitHub, Jenkins) with automated deployment to AWS EC2, moving releases from weekly to daily.",
    ],
    tech: ["Redis", "Jenkins", "GitHub", "Maven", "AWS EC2", "JUnit"],
    links: {},
    image: null,
  },
  {
    id: "ethtech-intern",
    category: "work",
    title: "Software Engineering Intern, Market Data & Trading Systems",
    org: "Eth Tech",
    dates: "May 2024 – Aug 2024",
    highlights: [
      "Engineered a real-time market data ingestion pipeline with Java Spring and MyBatis, storing tick data from Binance, Coinbase and other providers in AWS RDS.",
      "Optimized ingestion with multithreading and batch inserts, and built REST APIs for real-time portfolio management and backtesting.",
      "Implemented Kafka-based asynchronous queues to decouple services, reducing downtime by 20%.",
    ],
    tech: ["Java Spring Boot", "MyBatis", "AWS RDS (MySQL)", "Kafka", "Multithreading"],
    links: {},
    image: null,
  },

  // ---- Projects ----
  {
    id: "pennbook",
    category: "software",
    title: "PennBook",
    pitch: "A scalable social network backend with a Spark-powered news recommender.",
    year: 2025,
    highlights: [
      "Architected a scalable social backend on AWS DynamoDB, using concurrency limits, health checks and batch operations for high availability.",
      "Implemented a news recommendation system on AWS EMR, running adsorption / distributed label propagation over the social graph with Apache Spark (Java).",
    ],
    tech: ["Node.js", "Express", "AWS DynamoDB", "Apache Spark", "AWS EMR", "Docker"],
    links: {},
    image: null,
  },
  {
    id: "digital-currency-platform",
    category: "software",
    title: "Digital Currency Platform",
    pitch:
      "A RESTful cryptocurrency data platform for real-time market data aggregation, portfolio tracking and multi-exchange kline analysis.",
    year: 2025,
    highlights: [
      "Aggregates candlestick data from Binance US, Coinbase and Kraken with parallel fetching.",
      "Time-series interval aggregation (1s to 1M) and weighted portfolio value tracking.",
      "Batch inserts, symbol validation with a 24-hour cache, and retries with exponential backoff.",
    ],
    tech: ["Spring Boot", "MyBatis", "MySQL", "RESTful API"],
    links: { github: "https://github.com/Stans-Gate/digital_currency_platform" },
    image: "/shots/crypto.jpg",
  },
  {
    id: "neurablend",
    category: "software",
    title: "Neurablend",
    pitch:
      "An AI-powered learning platform that creates personalized study plans and gamified study guides for students.",
    year: 2025,
    highlights: [
      "AI-generated personalized study plans and adaptive quizzes that adjust difficulty.",
      "Spaced repetition for retention, with progress tracking and analytics.",
      "Achievements, streaks and leaderboards to keep students motivated.",
    ],
    tech: ["React", "FastAPI", "SQLite", "OpenAI API"],
    links: { github: "https://github.com/Stans-Gate/NeuraBlend" },
    image: "/shots/neurablend.jpg",
  },
  {
    id: "pennos",
    category: "software",
    title: "PennOS",
    pitch: "A Unix-like operating system with a custom scheduler, file system and shell.",
    year: 2025,
    highlights: [
      "Engineered a POSIX FAT file system in C, using memory-mapped I/O to simulate kernel-level block allocation.",
      "Priority-based preemptive scheduler and a shell with pipes, redirection and job control.",
      "Robust error handling, metadata tracking and low-level resource management.",
    ],
    tech: ["C", "POSIX API", "FAT file system", "Operating systems"],
    links: {},
    image: "/shots/pennos.jpg",
    note: "Course project (team of 4); source is private.",
  },
  {
    id: "game-hub",
    category: "software",
    title: "Game Hub",
    pitch:
      "A game library built on the RAWG Video Games Database API, with extensive filtering and search.",
    year: 2024,
    highlights: [
      "Search plus filters for genre, platform, popularity and release date.",
      "Responsive ChakraUI interface with dark and light modes.",
      "Detailed game pages with descriptions and metadata.",
    ],
    tech: ["React", "TypeScript", "Vite", "ChakraUI"],
    links: {
      demo: "https://rawg-demo-three.vercel.app/",
      github: "https://github.com/Stans-Gate/game-hub",
    },
    image: "/shots/gamehub.jpg",
  },

  // ---- Graphics ----
  {
    id: "mini-minecraft",
    category: "graphics",
    title: "Mini-Minecraft",
    pitch: "A voxel game engine with procedural terrain generation and efficient rendering.",
    year: 2025,
    highlights: [
      "Infinite procedurally generated terrain with biomes, built on Perlin noise.",
      "Chunk-based rendering with texture atlasing for smooth real-time gameplay.",
      "Block placement and destruction, player physics, and a day/night cycle.",
    ],
    tech: ["C++", "OpenGL", "GLSL", "GLM"],
    links: {},
    image: "/shots/minecraft.jpg",
    note: "Course project (team of 3); source is private.",
  },
  {
    id: "rasterizer",
    category: "graphics",
    title: "C++ Rasterizer & Custom GLSL Shaders",
    pitch:
      "A software rasterizer built from scratch, plus a collection of GLSL shaders and post-processing effects.",
    year: 2025,
    highlights: [
      "Custom software rasterizer implementing the full graphics pipeline.",
      "Blinn-Phong and matcap shading, and procedural animation with Worley noise.",
      "Sobel edge detection, Gaussian blur and halftone post-processing.",
    ],
    tech: ["C++", "OpenGL", "GLSL", "Computer graphics"],
    links: {},
    image: "/shots/rasterizer.jpg",
    note: "Course project; source is private.",
  },
  {
    id: "mesh-editor",
    category: "graphics",
    title: "Half-Edge Mesh Editor",
    pitch:
      "An interactive 3D mesh editor built on the half-edge data structure, with subdivision and topology operations.",
    year: 2025,
    highlights: [
      "Half-edge mesh built from OBJ files, with ray-cast selection of vertices, edges and faces.",
      "Catmull-Clark subdivision, edge splitting and face triangulation.",
      "Qt GUI with a synchronized 3D viewport and live editing.",
    ],
    tech: ["C++", "OpenGL", "Qt", "Computational geometry"],
    links: { video: "/projects/mesh/mesh.mp4" },
    image: "/shots/mesh.jpg",
    note: "Course project; source is private.",
  },

  // ---- Hackathon ----
  {
    id: "medscanner",
    category: "hackathon",
    title: "MedScanner",
    pitch:
      "PennApps XXV: a prescription scanner that uses OCR to identify medications and surface safety information.",
    year: 2025,
    highlights: [
      "Scans prescription labels with the camera and extracts medication details with OCR.",
      "Checks drug interactions and shows side effects and usage instructions.",
      "Built in 36 hours by a team of 4, with a focus on elderly users.",
    ],
    tech: ["React Native", "Flask", "OpenCV", "Tesseract OCR"],
    links: {
      devpost: "https://devpost.com/software/med-scanner",
      github: "https://github.com/charlesjin123/medicine-scanner",
    },
    image: "/shots/medscanner.jpg",
  },

  // ---- Teaching ----
  {
    id: "pact-ta",
    category: "teaching",
    title: "Teaching Assistant",
    org: "Program in Algorithmic and Combinatorial Thinking (PACT)",
    dates: "Summers 2024 & 2025",
    highlights: [
      "Helped students build data structures and algorithms skills over two consecutive summers.",
      "Ran one-on-one tutoring sessions and facilitated group problem-solving.",
      "Graded assignments with detailed feedback and mentored students on academics and careers in tech.",
    ],
    tech: ["Algorithms", "Data structures", "Mentoring"],
    links: { website: "https://algorithmicthinking.org/" },
    image: null,
  },
  {
    id: "weingarten-tutor",
    category: "teaching",
    title: "Academic Tutor",
    org: "Weingarten Center, University of Pennsylvania",
    dates: "2023 – Present",
    highlights: [
      "Individual tutoring for CIS 1210: Data Structures and Algorithms.",
      "Helps students develop study strategies and problem-solving techniques.",
      "Creates supplementary learning materials and practice problems.",
    ],
    tech: ["Java", "Algorithms", "Tutoring"],
    links: {
      website: "https://weingartencenter.universitylife.upenn.edu/tutoring-services/",
    },
    image: null,
  },
];

export const contact = {
  email: "chenstan@seas.upenn.edu",
  linkedin: "https://www.linkedin.com/in/stan-chen-87468a272/",
  github: "https://github.com/Stans-Gate",
  resume: "/Stan_resume_1221.pdf",
};

// Entries in the order they hang in the room: grouped by category, then by
// their order above.
export const orderedEntries: Entry[] = (Object.keys(categories) as CategoryId[]).flatMap((id) =>
  entries.filter((e) => e.category === id),
);
