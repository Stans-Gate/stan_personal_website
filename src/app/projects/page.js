"use client";
import { useState, useEffect } from "react";
import {
  ExternalLink,
  Github,
  Calendar,
  Play,
  X,
  Video,
  Lock,
  ChevronLeft,
  ChevronRight,
  Zap,
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";

export default function Project() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [navExpanded, setNavExpanded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navLinks = [
    { id: "home", label: "Home", isSection: false, href: "/" },
    { id: "tool", label: "Tool", isSection: false, href: "/#tool" },
    { id: "projects", label: "Project", isSection: false, href: "/projects" },
    {
      id: "contact",
      label: "Volunteering",
      isSection: false,
      href: "/class-projects",
    },
  ];

  const projects = [
    {
      id: 1,
      title: "Digital Currency Platform",
      description:
        "A RESTful cryptocurrency data platform providing real-time market data aggregation, portfolio tracking, and multi-exchange kline analysis.",
      fullDescription:
        "A comprehensive cryptocurrency analytics platform built with Spring Boot that aggregates candlestick (kline) data from multiple exchanges including Binance US, Coinbase, and Kraken. The platform features sophisticated data validation, time-series aggregation across multiple intervals, portfolio value tracking with weighted positions, and parallel data fetching for high performance. Built with a clean architecture using MyBatis for persistence, the system implements comprehensive error handling, retry mechanisms, and symbol validation across exchanges. The platform supports complex queries like interval aggregation (converting 1-minute data to hourly, daily, etc.) and portfolio performance calculation based on weighted cryptocurrency positions.",
      image: "/projects/crypto/c1.png",
      gallery: ["/projects/crypto/c1.png"],
      category: "web",
      tags: ["Spring Boot", "MyBatis", "MySQL", "RESTful API"],
      features: [
        "Multi-exchange kline data aggregation (Binance US, Coinbase, Kraken)",
        "Real-time cryptocurrency price data fetching with parallel processing",
        "Portfolio tracking with weighted position calculations",
        "Time-series interval aggregation (1s, 1m, 5m, 1h, 1d, 1w, 1M)",
        "Comprehensive input validation with detailed error responses",
        "Batch data insertion for high-performance storage",
        "Symbol validation with 24-hour cache TTL",
        "Retry mechanisms with exponential backoff",
        "RESTful API with structured exception handling",
        "Support for historical data queries with customizable time ranges",
      ],
      technologies: [
        {
          name: "Spring Boot",
          reason:
            "Enterprise-grade framework with dependency injection and validation",
        },
        {
          name: "MyBatis",
          reason:
            "Type-safe SQL mapping with dynamic queries and batch operations",
        },
        {
          name: "MySQL",
          reason: "Reliable relational database for time-series financial data",
        },
        {
          name: "Jackson",
          reason: "JSON parsing for exchange API responses",
        },
        {
          name: "Lombok",
          reason: "Reduces boilerplate code with annotations",
        },
        {
          name: "Bean Validation",
          reason: "Declarative validation with Jakarta constraints",
        },
        {
          name: "RestTemplate",
          reason: "HTTP client for exchange API communication",
        },
      ],
      role: "Backend Developer",
      teamSize: "Solo Project",
      duration: "3 months",
      github: "https://github.com/Stans-Gate/digital_currency_platform",
      demo: null,
      date: "2025",
      videoUrl: null,
      isPrivate: false,
    },
    {
      id: 2,
      title: "Neurablend",
      description:
        "AI-powered learning platform designed to create personalized study plans and gamified study guide for students.",
      fullDescription:
        "Neurablend revolutionizes how students learn by leveraging AI to analyze their learning patterns, strengths, and weaknesses. The platform creates customized study schedules, generates practice questions, and uses spaced repetition algorithms to optimize retention. Built with a focus on user experience, it features an engaging gamification system with achievements, streaks, and leaderboards to keep students motivated.",
      image: "/projects/neurablend/n1.png",
      gallery: [
        "/projects/neurablend/n1.png",
        "/projects/neurablend/n2.png",
        "/projects/neurablend/n3.png",
      ],
      category: "web",
      tags: ["React", "FastAPI", "SQLite"],
      features: [
        "AI-powered personalized study plan generation",
        "Adaptive quiz system that adjusts difficulty",
        "Spaced repetition algorithm for optimal retention",
        "Progress tracking with detailed analytics",
        "Achievement system with badges and rewards",
        "Study streak tracking and reminders",
        "Collaborative study groups and challenges",
      ],
      technologies: [
        {
          name: "React",
          reason: "Dynamic UI with real-time updates and smooth interactions",
        },
        {
          name: "FastAPI",
          reason: "High-performance Python backend with async support",
        },
        {
          name: "SQLite",
          reason: "Lightweight database perfect for MVP and local development",
        },
        {
          name: "OpenAI API",
          reason: "Generate personalized study content and explanations",
        },
        { name: "Chart.js", reason: "Beautiful progress visualizations" },
      ],
      role: "Lead Developer & Designer",
      teamSize: "Team of 2",
      duration: "1 week",
      github: "https://github.com/Stans-Gate/NeuraBlend",
      demo: null,
      date: "2025",
      videoUrl: null,
      isPrivate: false,
    },
    {
      id: 3,
      title: "PennOS",
      description:
        "Unix-like operating system with custom scheduler, file system, and shell interface.",
      fullDescription:
        "A fully functional Unix-like operating system kernel built from scratch in C. PennOS implements core OS concepts including process scheduling, memory management, a FAT-based file system, and a BASH-like shell. The project demonstrates deep understanding of low-level system programming, concurrent programming, and kernel design principles.",
      image: "/projects/pennos/p1.png",
      gallery: ["/projects/pennos/p1.png"],
      category: "class",
      tags: ["C", "Systems Programming", "OS"],
      features: [
        "Priority-based preemptive scheduler with multiple queues",
        "FAT-based file system with directories and metadata",
        "Shell supporting pipes, redirection, and job control",
        "Process synchronization with semaphores and mutexes",
        "System calls for file operations and process management",
        "Memory management with paging simulation",
      ],
      technologies: [
        {
          name: "C",
          reason: "Low-level control needed for OS implementation",
        },
        {
          name: "Make",
          reason: "Build automation for complex compilation dependencies",
        },
        {
          name: "GDB",
          reason: "Debugging kernel-level code and race conditions",
        },
        { name: "Valgrind", reason: "Memory leak detection and profiling" },
      ],
      role: "File System Developper (FAT & Inode)",
      teamSize: "Team of 4",
      duration: "1 month",
      github: null,
      demo: null,
      date: "2025",
      videoUrl: null,
      isPrivate: true,
    },
    {
      id: 4,
      title: "Mini-Minecraft",
      description:
        "Voxel-based game engine with procedural terrain generation and efficient rendering.",
      fullDescription:
        "A Minecraft-inspired voxel game engine built with C++ and OpenGL. Features infinite procedurally generated terrain using Perlin noise, chunk-based rendering for optimization, and realistic physics. Implements advanced graphics techniques including texture atlasing, frustum culling, and efficient mesh generation for smooth 60 FPS gameplay even with millions of blocks.",
      image: "/projects/minecraft/m1.png",
      gallery: [
        "/projects/minecraft/m2.png",
        "/projects/minecraft/m3.png",
        "/projects/minecraft/m1.png",
      ],
      category: "class",
      tags: ["C++", "OpenGL", "Game Dev"],
      features: [
        "Infinite terrain generation with biomes (forests, deserts, mountains)",
        "Chunk-based LOD system for rendering optimization",
        "Block placement and destruction with physics",
        "Day/night cycle with dynamic lighting",
        "Water simulation with transparency",
        "Player collision detection and movement physics",
        "Texture atlasing for efficient GPU usage",
      ],
      technologies: [
        {
          name: "C++",
          reason: "Performance critical for real-time 3D rendering",
        },
        { name: "OpenGL", reason: "Cross-platform graphics API" },
        { name: "GLSL", reason: "Custom shaders for lighting and effects" },
        { name: "GLM", reason: "Math library for 3D transformations" },
        {
          name: "Perlin Noise",
          reason: "Procedural terrain generation algorithm",
        },
      ],
      role: "Graphics & Engine Programmer",
      teamSize: "Team of 3",
      duration: "2 weeks",
      github: null,
      demo: null,
      date: "2025",
      videoUrl: "/projects/minecraft/minecraft.mp4",
      isPrivate: true,
    },
    {
      id: 5,
      title: "C++ Rasterizer & Custom GLSL Shaders",
      description:
        "A custom software rasterizer and collection of GLSL shaders implementing various rendering techniques and post-processing effects.",
      fullDescription:
        "A comprehensive graphics programming project featuring a custom C++ rasterizer built from scratch and an extensive collection of GLSL shaders. The rasterizer implements core graphics pipeline functionality including vertex transformation, rasterization, and fragment shading. The shader collection demonstrates advanced rendering techniques including Blinn-Phong lighting, matcap shading, procedural animations with Worley noise, edge detection using Sobel operators, and custom post-processing effects. The project showcases deep understanding of graphics algorithms, shader programming, and real-time rendering optimization.",
      image: "/projects/rasterizer/i3.png",
      gallery: [
        "/projects/rasterizer/i1.png",
        "/projects/rasterizer/i2.png",
        "/projects/rasterizer/i3.png",
      ],
      category: "class",
      tags: ["C++", "OpenGL", "GLSL", "Computer Graphics"],
      features: [
        "Custom software rasterizer with full graphics pipeline",
        "Blinn-Phong reflection model with specular highlights",
        "MatCap (material capture) shading for stylized rendering",
        "Procedural surface animation using time-based morphing",
        "Worley noise cellular patterns with animated refraction",
        "Sobel edge detection post-processing filter",
        "Gaussian blur with 11x11 weighted kernel",
        "Custom halftone dot pattern post-processing effect",
        "Real-time shader parameter manipulation",
      ],
      technologies: [
        {
          name: "C++",
          reason: "Low-level control for implementing rasterization algorithms",
        },
        {
          name: "OpenGL",
          reason:
            "Hardware-accelerated graphics rendering and shader execution",
        },
        {
          name: "GLSL",
          reason: "Vertex and fragment shaders for custom rendering effects",
        },
        {
          name: "GLM",
          reason: "Math library for vector and matrix operations",
        },
        {
          name: "Worley Noise",
          reason: "Procedural cellular pattern generation for organic effects",
        },
        {
          name: "Sobel Operator",
          reason: "Edge detection algorithm for image processing",
        },
      ],
      role: "Graphics Programmer",
      teamSize: "Solo Project",
      duration: "2 weeks",
      github: null,
      demo: null,
      date: "2025",
      videoUrl: "/projects/rasterizer/mario.mp4",
      isPrivate: true,
    },
    {
      id: 6,
      title: "Half-Edge Mesh Editor",
      description:
        "An interactive 3D mesh editor using the half-edge data structure with support for mesh manipulation, subdivision, and topology operations.",
      fullDescription:
        "A sophisticated mesh editing application built with C++ and OpenGL that implements the half-edge data structure for efficient mesh topology operations. The editor provides an intuitive Qt-based GUI for importing OBJ files, selecting and manipulating mesh components (vertices, edges, faces), and performing advanced geometric operations. Features include Catmull-Clark subdivision surfaces for smooth mesh refinement, face triangulation, edge splitting, and real-time visual feedback with ray-casting based component selection. The half-edge structure enables efficient mesh traversal and topological queries, making it ideal for geometric modeling applications.",
      image: "/projects/mesh/m1.png",
      gallery: ["/projects/mesh/m1.png"],
      category: "class",
      tags: ["C++", "OpenGL", "Qt", "Computational Geometry"],
      features: [
        "Half-edge data structure for efficient mesh representation",
        "OBJ file import with automatic mesh construction",
        "Interactive component selection (vertices, faces, half-edges)",
        "Real-time ray-casting for picking mesh components",
        "Catmull-Clark subdivision surface algorithm",
        "Half-edge splitting for mesh refinement",
        "Face triangulation for n-gon polygons",
        "Keyboard shortcuts for mesh navigation (N, M, F, V, H keys)",
        "Visual highlighting of selected components",
        "Real-time vertex position and face color editing",
        "Qt-based GUI with synchronized 3D viewport and list widgets",
      ],
      technologies: [
        {
          name: "C++",
          reason:
            "Performance-critical geometric algorithms and data structures",
        },
        {
          name: "OpenGL 3.2",
          reason: "Hardware-accelerated 3D rendering with modern pipeline",
        },
        {
          name: "Qt Framework",
          reason: "Cross-platform GUI and OpenGL integration",
        },
        {
          name: "GLM",
          reason: "OpenGL Mathematics library for vectors and matrices",
        },
        {
          name: "Half-Edge Data Structure",
          reason: "Enables efficient mesh traversal and topological operations",
        },
        {
          name: "Catmull-Clark Algorithm",
          reason: "Industry-standard subdivision surface technique",
        },
      ],
      role: "Graphics Programmer",
      teamSize: "Solo Project",
      duration: "2 Weeks",
      github: null,
      demo: null,
      date: "2025",
      videoUrl: "/projects/mesh/mesh.mp4",
      isPrivate: true,
    },
    {
      id: 7,
      title: "MedScanner - PennApps XXV",
      description:
        "Medical prescription scanner using OCR to identify medications and provide safety information.",
      fullDescription:
        "A mobile health application that uses computer vision to scan prescription labels, extract medication information, and provide comprehensive safety data including drug interactions, side effects, and proper usage instructions. Built during PennApps XXV hackathon with a focus on elderly users and those managing multiple medications.",
      image: "/projects/med/m1.png",
      gallery: ["/projects/med/m1.png"],
      category: "mobile",
      tags: ["React Native", "Flask", "OpenCV", "Tesseract OCR"],
      features: [
        "Real-time camera prescription scanning",
        "OCR text extraction with 95%+ accuracy",
        "Drug interaction checker for multiple medications",
        "Medication reminders and schedule tracking",
        "Side effects and contraindications database",
        "Emergency contact quick-dial feature",
        "Multi-language support for accessibility",
      ],
      technologies: [
        {
          name: "React Native",
          reason: "Cross-platform mobile development for iOS and Android",
        },
        {
          name: "Flask",
          reason: "Lightweight Python backend for API and OCR processing",
        },
        {
          name: "OpenCV",
          reason: "Image preprocessing to improve OCR accuracy",
        },
        {
          name: "Tesseract OCR",
          reason: "Open-source OCR engine for text extraction",
        },
        {
          name: "FDA API",
          reason: "Access official drug information database",
        },
      ],
      role: "Mobile Developer & Computer Vision Engineer",
      teamSize: "Team of 4",
      duration: "36 hours (Hackathon)",
      github: "https://github.com/charlesjin123/medicine-scanner",
      demo: "https://devpost.com/software/med-scanner",
      date: "2025",
      videoUrl: null,
      isPrivate: false,
    },
    {
      id: 8,
      title: "Game Hub",
      description:
        "A demo website showcasing a game library using the RAWG Video Games Database API with extensive filtering and search capabilities.",
      fullDescription:
        "Game Hub is a comprehensive game discovery platform built with React and TypeScript that leverages the RAWG Video Games Database API to provide users with an extensive, searchable collection of video games. The application features a modern, responsive interface built with ChakraUI, offering both dark and light modes for optimal user experience. Users can explore games through multiple filtering options including genre, platform, popularity, and release date, while accessing detailed information about each title including descriptions, release dates, and supported platforms.",
      image: "/projects/game/g1.png",
      gallery: ["/projects/game/g1.png"],
      category: "web",
      tags: ["React", "TypeScript", "Vite", "ChakraUI"],
      features: [
        "Dark/Light mode toggle for comfortable viewing",
        "Comprehensive game exploration with detailed information",
        "Advanced search functionality for finding specific titles",
        "Multiple filter options (genre, platform, popularity, release date)",
        "Detailed game pages with descriptions and metadata",
        "Responsive design optimized for all device sizes",
        "Fast performance with Vite build tool",
      ],
      technologies: [
        {
          name: "React",
          reason: "Component-based architecture for dynamic UI updates",
        },
        {
          name: "TypeScript",
          reason: "Type safety and better developer experience",
        },
        {
          name: "Vite",
          reason: "Fast build tool with hot module replacement",
        },
        {
          name: "ChakraUI",
          reason: "Modern, accessible component library with theming support",
        },
        {
          name: "Axios",
          reason: "HTTP client for API data fetching",
        },
        {
          name: "RAWG API",
          reason: "Comprehensive video games database with rich metadata",
        },
      ],
      role: "Full-stack Developer",
      teamSize: "Solo Project",
      duration: "5+ weeks",
      github: "https://github.com/Stans-Gate/game-hub",
      demo: "https://rawg-demo-three.vercel.app/",
      date: "2024",
      videoUrl: null,
      isPrivate: false,
    },
  ];

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "web", label: "Web Apps" },
    { id: "mobile", label: "Mobile Apps" },
    { id: "class", label: "Class Projects" },
  ];

  const filteredProjects =
    selectedCategory === "all"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (selectedProject) setSelectedProject(null);
        if (selectedVideo) setSelectedVideo(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedProject, selectedVideo]);

  // Navigate to next/previous project
  const navigateProject = (direction) => {
    const currentIndex = projects.findIndex((p) => p.id === selectedProject.id);
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % projects.length
        : (currentIndex - 1 + projects.length) % projects.length;
    setSelectedProject(projects[newIndex]);
    setCurrentImageIndex(0);
  };

  const VideoModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-[#393E46] rounded-xl max-w-5xl w-full overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-[#948979]/30">
            <div>
              <h3 className="text-2xl font-semibold text-[#DFD0B8]">
                {project.title}
              </h3>
              <p className="text-white/60 text-sm mt-1">
                {project.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#948979]/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-[#DFD0B8]" />
            </button>
          </div>

          <div className="aspect-video bg-black">
            {project.videoUrl ? (
              <iframe
                src={project.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title={project.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#DFD0B8]/50">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Demo video coming soon</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-[#222831]">
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#393E46] text-[#948979] text-sm rounded-full border border-[#948979]/30"
                >
                  {tag}
                </span>
              ))}
            </div>
            {project.isPrivate && (
              <div className="flex items-center gap-2 text-[#DFD0B8]/70 text-sm">
                <Lock className="w-4 h-4" />
                <span>Private repository - Demo only</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ProjectDetailModal = ({ project, onClose }) => {
    if (!project) return null;

    return (
      <div
        className="fixed inset-0 bg-black/90 z-50 overflow-y-auto backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="min-h-screen px-4 py-8">
          <div
            className="bg-[#393E46] rounded-2xl max-w-5xl mx-auto shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-[#393E46] border-b border-[#948979]/30 backdrop-blur-sm">
              <div className="flex items-center justify-between p-6">
                <div className="flex-1">
                  <h2
                    className="text-3xl font-bold text-[#DFD0B8] mb-2"
                    style={{ fontFamily: "Rock Salt, cursive" }}
                  >
                    {project.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#DFD0B8]/70">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.teamSize}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {project.duration}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-[#948979]/20 rounded-full transition-colors ml-4"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-[#DFD0B8]" />
                </button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="relative bg-black">
              <img
                src={project.gallery[currentImageIndex]}
                alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover"
              />
              {project.gallery.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        (currentImageIndex - 1 + project.gallery.length) %
                          project.gallery.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#222831]/80 p-3 rounded-full hover:bg-[#948979] transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#DFD0B8]" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex(
                        (currentImageIndex + 1) % project.gallery.length
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#222831]/80 p-3 rounded-full hover:bg-[#948979] transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-[#DFD0B8]" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {project.gallery.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentImageIndex
                            ? "bg-[#948979] w-8"
                            : "bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`View image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Content Sections */}
            <div className="p-8 space-y-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-[#222831] text-[#948979] text-sm rounded-full border border-[#948979]/30 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Overview Section */}
              <section>
                <h3 className="text-xl font-semibold text-[#DFD0B8] mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#948979]" />
                  Overview
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {project.fullDescription}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[#948979]">
                  <span className="font-semibold">Role:</span>
                  <span className="text-[#DFD0B8]">{project.role}</span>
                </div>
              </section>

              {/* Key Features */}
              <section>
                <h3 className="text-xl font-semibold text-[#DFD0B8] mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#948979]" />
                  Key Features
                </h3>
                <ul className="space-y-3">
                  {project.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-white/80"
                    >
                      <span className="text-[#948979] mt-1 flex-shrink-0">
                        ▸
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Tech Stack */}
              <section>
                <h3 className="text-xl font-semibold text-[#DFD0B8] mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#948979]" />
                  Technology Stack
                </h3>
                <div className="space-y-3">
                  {project.technologies.map((tech, idx) => (
                    <div
                      key={idx}
                      className="bg-[#222831] p-4 rounded-lg border border-[#948979]/20"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#948979]">
                          {tech.name}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm">{tech.reason}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Action Buttons */}
              <section className="flex flex-wrap gap-4 pt-4">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-[#222831] text-[#DFD0B8] rounded-lg hover:bg-[#948979] hover:text-white transition-colors font-medium border border-[#948979]/30"
                  >
                    <Github className="w-5 h-5" />
                    View Code
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-[#222831] text-[#DFD0B8] rounded-lg hover:bg-[#948979] hover:text-white transition-colors font-medium border border-[#948979]/30"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Live Demo
                  </a>
                )}
                {project.videoUrl && (
                  <button
                    onClick={() => setSelectedVideo(project)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#948979] text-white rounded-lg hover:bg-[#948979]/80 transition-colors font-medium"
                  >
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </button>
                )}
              </section>

              {project.isPrivate && (
                <div className="flex items-center gap-2 text-[#DFD0B8]/70 text-sm bg-[#222831] p-4 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span>
                    This is a private/class project. Code repository not
                    publicly available.
                  </span>
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="border-t border-[#948979]/30 p-6 flex justify-between items-center bg-[#222831]">
              <button
                onClick={() => navigateProject("prev")}
                className="flex items-center gap-2 px-4 py-2 bg-[#393E46] text-[#DFD0B8] rounded-lg hover:bg-[#948979] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous Project
              </button>
              <button
                onClick={() => navigateProject("next")}
                className="flex items-center gap-2 px-4 py-2 bg-[#393E46] text-[#DFD0B8] rounded-lg hover:bg-[#948979] hover:text-white transition-colors"
              >
                Next Project
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#222831]">
      {/* Pokemon Ball Navbar */}
      <nav className="fixed top-8 right-8 z-50">
        <div className="relative">
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
                  <div key={link.id} className="relative">
                    <a
                      href={link.href}
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
          {!navExpanded && (
            <button
              onClick={() => setNavExpanded(true)}
              className="w-20 h-20 rounded-full overflow-hidden hover:scale-110 transition-transform duration-200 shadow-lg"
            >
              <img
                src="/pokeball.png"
                alt="Pokeball"
                className="w-full h-full object-cover"
              />
            </button>
          )}
        </div>
      </nav>
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
      <link
        href="https://fonts.googleapis.com/css2?family=Rock+Salt&family=Racing+Sans+One&display=swap"
        rel="stylesheet"
      />
      {/* Header */}
      <header className="pt-20 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-white text-5xl mb-4"
            style={{ fontFamily: "Rock Salt, cursive" }}
          >
            My Projects
          </h1>
          <p className="text-[#DFD0B8] text-lg">
            A collection of my recent work and ideas
          </p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="bg-[#393E46] border-y border-[#948979]/30 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex gap-4 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-full whitespace-nowrap transition-all font-medium ${
                  selectedCategory === cat.id
                    ? "bg-[#948979] text-white shadow-lg"
                    : "bg-[#222831] text-[#DFD0B8] hover:bg-[#948979]/50 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedProject(project);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${project.title}`}
              className="bg-[#393E46] rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-[#948979]/30 group border-2 border-[#948979]/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#948979]"
            >
              {/* Project Image with Play Button Overlay */}
              <div className="relative overflow-hidden h-48 group/image">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#393E46] via-transparent opacity-60"></div>

                {/* View Details Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center">
                    <div className="bg-[#948979] rounded-full p-4 mb-2 inline-block">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white font-semibold">View Details</p>
                  </div>
                </div>

                {/* Private Badge */}
                {project.isPrivate && (
                  <div className="absolute top-4 left-4 bg-[#222831]/90 px-3 py-1 rounded-full flex items-center gap-2">
                    <Lock className="w-3 h-3 text-[#948979]" />
                    <span className="text-xs text-[#DFD0B8]">Private</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {project.github && (
                    <a
                      href={project.github}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#222831]/90 p-2 rounded-full hover:bg-[#948979] transition-colors"
                      aria-label="View GitHub repository"
                    >
                      <Github className="w-4 h-4 text-[#DFD0B8]" />
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#222831]/90 p-2 rounded-full hover:bg-[#948979] transition-colors"
                      aria-label="View live demo"
                    >
                      <ExternalLink className="w-4 h-4 text-[#DFD0B8]" />
                    </a>
                  )}
                  {project.videoUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVideo(project);
                      }}
                      className="bg-[#222831]/90 p-2 rounded-full hover:bg-[#948979] transition-colors"
                      aria-label="Watch demo video"
                    >
                      <Video className="w-4 h-4 text-[#DFD0B8]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[#948979]" />
                  <span className="text-sm text-[#DFD0B8]/70">
                    {project.date}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[#DFD0B8] mb-2">
                  {project.title}
                </h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#222831] text-[#948979] text-xs rounded-full border border-[#948979]/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Learn More Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(project);
                  }}
                  className="mt-4 w-full bg-[#948979] text-white py-2 rounded-lg hover:bg-[#948979]/80 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  Learn More
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[#DFD0B8]/50 text-lg">
              No projects found in this category
            </p>
          </div>
        )}
      </div>
      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => {
            setSelectedProject(null);
            setCurrentImageIndex(0);
          }}
        />
      )}
      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          project={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
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
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3
                  className="text-2xl font-bold text-[#393E46] mb-4"
                  style={{ fontFamily: "Rock Salt, cursive" }}
                >
                  Stan Chen
                </h3>
                <p className="text-[#393E46]/80">
                  Full-stack developer & robotics enthusiast
                </p>
              </div>
            </div>
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
