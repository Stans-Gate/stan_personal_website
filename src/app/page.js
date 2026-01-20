"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import ToolList from "./ToolList";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

export default function Home() {
  const pathname = usePathname();

  const navLinks = [
    { id: "home", label: "Home", isSection: true },
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

  // Music player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const audioRef = useRef(null);

  // Music player functions
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
      }
    };
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("canplay", updateDuration);
    audio.addEventListener("ended", handleEnded);

    // Try to get duration immediately if already loaded
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("canplay", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isRepeat]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 10,
        0
      );
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#222831] relative">
      {/* Starry Background - Full Page */}
      <ShootingStars
        starColor="#DFD0B8"
        trailColor="#948979"
        starHeight={2}
        starWidth={20}
        minSpeed={5}
        maxSpeed={15}
        className="z-0 fixed inset-0"
      />
      <StarsBackground starDensity={0.01} className="opacity-50 z-0 fixed inset-0" />

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
                const isActive = link.isSection
                  ? pathname === "/" && link.id === "home" // Home link is active on home page
                  : pathname === link.href;
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

      {/* Music Player - Fixed Top Right */}
      <div className="fixed top-20 right-8 z-50">
        {/* CHANGE MUSIC FILE PATH HERE - Replace with your audio file path */}
        <audio ref={audioRef} src="/audio.mp3" />

        <div className="flex flex-col items-center group/he select-none">
          <div className="relative z-0 h-16 -mb-2 transition-all duration-200 group-hover/he:h-0">
            <svg
              width="128"
              height="128"
              viewBox="0 0 128 128"
              className={`duration-500 border-4 rounded-full shadow-md border-zinc-400 border-spacing-5 transition-all ${isPlaying ? "animate-[spin_3s_linear_infinite]" : ""
                }`}
            >
              <svg>
                <rect width="128" height="128" fill="black"></rect>
                <circle cx="20" cy="20" r="2" fill="white"></circle>
                <circle cx="40" cy="30" r="2" fill="white"></circle>
                <circle cx="60" cy="10" r="2" fill="white"></circle>
                <circle cx="80" cy="40" r="2" fill="white"></circle>
                <circle cx="100" cy="20" r="2" fill="white"></circle>
                <circle cx="120" cy="50" r="2" fill="white"></circle>
                <circle
                  cx="90"
                  cy="30"
                  r="10"
                  fill="white"
                  fillOpacity="0.5"
                ></circle>
                <circle cx="90" cy="30" r="8" fill="white"></circle>
                <path
                  d="M0 128 Q32 64 64 128 T128 128"
                  fill="purple"
                  stroke="black"
                  strokeWidth="1"
                ></path>
                <path
                  d="M0 128 Q32 48 64 128 T128 128"
                  fill="mediumpurple"
                  stroke="black"
                  strokeWidth="1"
                ></path>
                <path
                  d="M0 128 Q32 32 64 128 T128 128"
                  fill="rebeccapurple"
                  stroke="black"
                  strokeWidth="1"
                ></path>
                <path
                  d="M0 128 Q16 64 32 128 T64 128"
                  fill="purple"
                  stroke="black"
                  strokeWidth="1"
                ></path>
                <path
                  d="M64 128 Q80 64 96 128 T128 128"
                  fill="mediumpurple"
                  stroke="black"
                  strokeWidth="1"
                ></path>
              </svg>
            </svg>
            <div className="absolute z-10 w-8 h-8 bg-white border-4 rounded-full shadow-sm border-zinc-400 top-12 left-12"></div>
          </div>
          <div className="z-30 flex flex-col w-40 h-20 transition-all duration-300 bg-white shadow-md group-hover/he:h-40 group-hover/he:w-72 rounded-2xl shadow-zinc-400">
            <div className="flex flex-row w-full h-0 group-hover/he:h-20">
              <div
                className={`relative flex items-center justify-center w-24 h-24 group-hover/he:-top-6 group-hover/he:-left-4 opacity-0 group-hover/he:opacity-100 transition-all duration-100 ${isPlaying
                  ? "group-hover/he:animate-[spin_3s_linear_infinite]"
                  : ""
                  }`}
              >
                <svg
                  width="96"
                  height="96"
                  viewBox="0 0 128 128"
                  className="duration-500 border-4 rounded-full shadow-md border-zinc-400 border-spacing-5"
                >
                  <svg>
                    <rect width="128" height="128" fill="black"></rect>
                    <circle cx="20" cy="20" r="2" fill="white"></circle>
                    <circle cx="40" cy="30" r="2" fill="white"></circle>
                    <circle cx="60" cy="10" r="2" fill="white"></circle>
                    <circle cx="80" cy="40" r="2" fill="white"></circle>
                    <circle cx="100" cy="20" r="2" fill="white"></circle>
                    <circle cx="120" cy="50" r="2" fill="white"></circle>
                    <circle
                      cx="90"
                      cy="30"
                      r="10"
                      fill="white"
                      fillOpacity="0.5"
                    ></circle>
                    <circle cx="90" cy="30" r="8" fill="white"></circle>
                    <path
                      d="M0 128 Q32 64 64 128 T128 128"
                      fill="purple"
                      stroke="black"
                      strokeWidth="1"
                    ></path>
                    <path
                      d="M0 128 Q32 48 64 128 T128 128"
                      fill="mediumpurple"
                      stroke="black"
                      strokeWidth="1"
                    ></path>
                    <path
                      d="M0 128 Q32 32 64 128 T128 128"
                      fill="rebeccapurple"
                      stroke="black"
                      strokeWidth="1"
                    ></path>
                    <path
                      d="M0 128 Q16 64 32 128 T64 128"
                      fill="purple"
                      stroke="black"
                      strokeWidth="1"
                    ></path>
                    <path
                      d="M64 128 Q80 64 96 128 T128 128"
                      fill="mediumpurple"
                      stroke="black"
                      strokeWidth="1"
                    ></path>
                  </svg>
                </svg>
                <div className="absolute z-10 w-6 h-6 bg-white border-4 rounded-full shadow-sm border-zinc-400 top-9 left-9"></div>
              </div>
              <div className="flex flex-col justify-center w-full pl-3 -ml-24 overflow-hidden group-hover/he:-ml-3">
                <p className="text-xl text-black font-bold truncate">
                  The Great Gig In The Sky
                </p>
                <p className="text-zinc-600">Pink Floyd</p>
              </div>
            </div>
            <div className="flex flex-row mx-3 mt-3 bg-indigo-100 rounded-md min-h-4 group-hover/he:mt-0">
              <span className="hidden pl-3 text-sm text-zinc-600 group-hover/he:inline-block">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-24 group-hover/he:w-full flex-grow h-1 mx-2 my-auto bg-gray-300 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-zinc-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
              />
              <span className="hidden pr-3 text-sm text-zinc-600 group-hover/he:inline-block">
                {formatTime(duration)}
              </span>
            </div>
            <div className="flex flex-row items-center justify-center flex-grow mx-3 space-x-5">
              <label
                htmlFor="playMode"
                className="flex items-center justify-center w-0 h-full cursor-pointer group-hover/he:w-12"
              >
                <input
                  type="checkbox"
                  id="playMode"
                  className="hidden peer/playMode"
                  checked={isRepeat}
                  onChange={(e) => setIsRepeat(e.target.checked)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#777"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-repeat peer-checked/playMode:hidden"
                >
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="hidden feather feather-shuffle peer-checked/playMode:inline-block"
                >
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
              </label>
              <div
                className="flex items-center justify-center w-12 h-full cursor-pointer"
                onClick={skipBackward}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-skip-back"
                >
                  <polygon points="19 20 9 12 19 4 19 20"></polygon>
                  <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
              </div>
              <div
                onClick={togglePlay}
                className="flex items-center justify-center w-12 h-full cursor-pointer"
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-pause"
                  >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-play"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </div>
              <div
                className="flex items-center justify-center w-12 h-full cursor-pointer"
                onClick={skipForward}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-skip-forward"
                >
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
              </div>
              <div className="flex items-center justify-center w-12 h-full cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#777"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-0 feather feather-list group-hover/he:w-12"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
      {/* Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Rock+Salt&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Racing+Sans+One&display=swap"
        rel="stylesheet"
      ></link>

      {/* 2. Hero Section */}
      <section
        id="home"
        className="relative 90vh px-8 flex items-start pt-40 justify-center mb-20 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left Column - Image, Name, and Social Links */}
            <div className="flex flex-col items-center md:items-start relative z-10">
              {/* Profile Image */}
              <div className="mb-6">
                <div className="w-90 h-90 rounded-full overflow-hidden border-4 border-white/60 shadow-xl">
                  <img
                    src="/stan.png"
                    alt="Stan"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Name and Info */}
              <div className="mb-6 text-center md:text-left">
                <h1 className="text-white text-3xl font-bold mb-1">Stan Chen</h1>
                <p className="text-white/80 text-lg mb-1">CS & Robo @ Penn</p>
                <a
                  href="mailto:chenstan@seas.upenn.edu"
                  className="text-white/70 text-base hover:text-white transition-colors"
                >
                  chenstan@seas.upenn.edu
                </a>
              </div>

              {/* Social Links */}
              <ul className="flex justify-center gap-4 list-none p-0 m-0">
                <li className="icon-content relative group">
                  <a
                    data-social="linkedin"
                    aria-label="LinkedIn"
                    href="https://www.linkedin.com/in/stan-chen-87468a272/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative overflow-hidden flex justify-center items-center w-14 h-14 rounded-full text-gray-700 bg-white transition-all duration-300 ease-in-out hover:shadow-lg group-hover:text-white"
                  >
                    <div className="filled absolute bottom-0 left-0 w-full h-0 bg-[#0274b3] transition-all duration-300 ease-in-out group-hover:h-full rounded-full"></div>
                    <svg
                      xmlSpace="preserve"
                      viewBox="0 0 16 16"
                      className="bi bi-linkedin relative z-10 w-8 h-8"
                      fill="currentColor"
                      height="16"
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="currentColor"
                        d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"
                      ></path>
                    </svg>
                  </a>
                  <div className="tooltip absolute top-16 left-1/2 transform -translate-x-1/2 text-white px-2 py-1 rounded opacity-0 invisible text-sm transition-all duration-300 bg-[#0274b3] group-hover:opacity-100 group-hover:visible group-hover:top-[70px]">
                    LinkedIn
                  </div>
                </li>
                <li className="icon-content relative group">
                  <a
                    data-social="github"
                    aria-label="GitHub"
                    href="https://github.com/Stans-Gate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative overflow-hidden flex justify-center items-center w-14 h-14 rounded-full text-gray-700 bg-white transition-all duration-300 ease-in-out hover:shadow-lg group-hover:text-white"
                  >
                    <div className="filled absolute bottom-0 left-0 w-full h-0 bg-[#24262a] transition-all duration-300 ease-in-out group-hover:h-full rounded-full"></div>
                    <svg
                      xmlSpace="preserve"
                      viewBox="0 0 16 16"
                      className="bi bi-github relative z-10 w-8 h-8"
                      fill="currentColor"
                      height="16"
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="currentColor"
                        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
                      ></path>
                    </svg>
                  </a>
                  <div className="tooltip absolute top-16 left-1/2 transform -translate-x-1/2 text-white px-2 py-1 rounded opacity-0 invisible text-sm transition-all duration-300 bg-[#24262a] group-hover:opacity-100 group-hover:visible group-hover:top-[70px]">
                    GitHub
                  </div>
                </li>
                <li className="icon-content relative group">
                  <a
                    data-social="email"
                    aria-label="Email"
                    href="mailto:chenstan@seas.upenn.edu"
                    className="relative overflow-hidden flex justify-center items-center w-14 h-14 rounded-full text-gray-700 bg-white transition-all duration-300 ease-in-out hover:shadow-lg group-hover:text-white"
                  >
                    <div className="filled absolute bottom-0 left-0 w-full h-0 transition-all duration-300 ease-in-out group-hover:h-full rounded-full bg-[#D44638]"></div>
                    <svg
                      xmlSpace="preserve"
                      viewBox="0 0 16 16"
                      className="bi bi-envelope relative z-10 w-8 h-8"
                      fill="currentColor"
                      height="16"
                      width="16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="currentColor"
                        d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"
                      ></path>
                    </svg>
                  </a>
                  <div className="tooltip absolute top-16 left-1/2 transform -translate-x-1/2 text-white px-2 py-1 rounded opacity-0 invisible text-sm transition-all duration-300 bg-[#D44638] group-hover:opacity-100 group-hover:visible group-hover:top-[70px]">
                    Email
                  </div>
                </li>
              </ul>
            </div>

            {/* Right Column - Biography and Education */}
            <div className="flex items-center">
              <div className="space-y-8">
                {/* Biography Section */}
                <div>
                  <h2 className="text-white text-2xl font-semibold mb-3">
                    Biography
                  </h2>
                  <p className="text-white/90 text-base leading-relaxed">
                    I&apos;m a junior at University of Pennsylvania passionate about full-stack development, building reliable and scalable systems, and creative user interfaces. My academic interests lie in machine learning, computer vision, computer graphics, and optimization.
                  </p>
                </div>

                {/* Education Section */}
                <div>
                  <h2 className="text-white text-2xl font-semibold mb-6">
                    Education
                  </h2>
                  <div className="space-y-5">
                    {/* B.S.E. Degree */}
                    <div className="flex items-center gap-5">
                      <div className="flex-shrink-0 w-25 h-25 flex items-center justify-center bg-white rounded-lg p-2 shadow-lg">
                        <img
                          src="/pennengineering.png"
                          alt="Penn Engineering"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base mb-0.5">
                          B.S.E. in Computer and Information Science
                        </h3>
                        <p className="text-white text-sm">
                          University of Pennsylvania
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white my-4"></div>

                    {/* M.S.E. Degree */}
                    <div className="flex items-center gap-5">
                      <div className="flex-shrink-0 w-25 h-25 flex items-center justify-center bg-white rounded-lg p-2 shadow-lg">
                        <img
                          src="/grasp.png"
                          alt="GRASP Laboratory"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base mb-0.5">
                          M.S.E. in Robotics
                        </h3>
                        <p className="text-white text-sm">
                          University of Pennsylvania GRASP Laboratory
                        </p>
                      </div>
                    </div>

                    {/* Graduation Date */}
                    <div className="pt-3 mt-4 border-t border-white">
                      <p className="text-white text-sm">
                        Expected Graduation: <span className="font-medium text-white">May 2027</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tools Section */}
      <section id="tool" className="60vh px-8 pt-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-white text-5xl mb-14"
            style={{ fontFamily: "Racing Sans One" }}
          >
            My Toolkit
          </h1>
          <ToolList />
        </div>
      </section>

      {/* 4. Selected Projects Section */}
      <section className="px-8 py-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-white text-5xl mb-14"
            style={{ fontFamily: "Racing Sans One" }}
          >
            Selected Projects
          </h1>

          <div className="space-y-6 mb-12">
            {/* Digital Currency Platform */}
            <div className="group cursor-pointer" onClick={() => window.location.href = '/projects'}>
              <div className="flex flex-col md:flex-row gap-6 border-b border-white/10 pb-6 hover:border-white/30 transition-all duration-300">
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="aspect-video overflow-hidden bg-black rounded-lg">
                    <img
                      src="/projects/crypto/c1.png"
                      alt="Digital Currency Platform"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-white text-2xl font-semibold mb-3">
                    Digital Currency Platform
                  </h3>
                  <p className="text-white/70 text-base mb-4">
                    A RESTful cryptocurrency data platform providing real-time market data aggregation, portfolio tracking, and multi-exchange kline analysis.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded">
                      Spring Boot
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded">
                      MySQL
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded">
                      RESTful API
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Neurablend */}
            <div className="group cursor-pointer" onClick={() => window.location.href = '/projects'}>
              <div className="flex flex-col md:flex-row gap-6 border-b border-white/10 pb-6 hover:border-white/30 transition-all duration-300">
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="aspect-video overflow-hidden bg-black rounded-lg">
                    <img
                      src="/projects/neurablend/n1.png"
                      alt="Neurablend"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-white text-2xl font-semibold mb-3">
                    Neurablend
                  </h3>
                  <p className="text-white/70 text-base mb-4">
                    AI-powered learning platform designed to create personalized study plans and gamified study guide for students.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded">
                      React
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded">
                      FastAPI
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded">
                      AI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Hub */}
            <div className="group cursor-pointer" onClick={() => window.location.href = '/projects'}>
              <div className="flex flex-col md:flex-row gap-6 border-b border-white/10 pb-6 hover:border-white/30 transition-all duration-300">
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="aspect-video overflow-hidden bg-black rounded-lg">
                    <img
                      src="/projects/game/g1.png"
                      alt="Game Hub"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-white text-2xl font-semibold mb-3">
                    Game Hub
                  </h3>
                  <p className="text-white/70 text-base mb-4">
                    A demo website showcasing a game library using the RAWG Video Games Database API with extensive filtering and search capabilities.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded">
                      React
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded">
                      TypeScript
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded">
                      ChakraUI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View More Link */}
          <div className="text-center">
            <a
              href="/projects"
              className="inline-flex items-center gap-2 text-white text-lg font-medium hover:text-white/80 transition-colors group"
            >
              View All Projects
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
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
