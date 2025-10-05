"use client";
import React from "react";
import {
  FaJava,
  FaPython,
  FaJs,
  FaNodeJs,
  FaReact,
  FaGitAlt,
} from "react-icons/fa";
import {
  SiCplusplus,
  SiTypescript,
  SiSwift,
  SiSpring,
  SiDjango,
  SiPostgresql,
} from "react-icons/si";

const techStack = [
  // First row
  { icon: FaJava, name: "Java", color: "#007396" },
  { icon: FaPython, name: "Python", color: "#3776AB" },
  { icon: SiCplusplus, name: "C++", color: "#00599C" },
  { icon: FaJs, name: "JavaScript", color: "#F7DF1E" },
  { icon: SiTypescript, name: "TypeScript", color: "#3178C6" },
  { icon: SiSwift, name: "Swift", color: "#FA7343" },
  // Second row
  { icon: SiSpring, name: "Spring", color: "#6DB33F" },
  { icon: SiDjango, name: "Django", color: "#092E20" },
  { icon: FaNodeJs, name: "Node.js", color: "#339933" },
  { icon: FaReact, name: "React", color: "#61DAFB" },
  { icon: SiPostgresql, name: "PostgreSQL", color: "#4169E1" },
  { icon: FaGitAlt, name: "Git", color: "#F05032" },
];

export default function ToolList() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-12 md:gap-10">
        {techStack.map((tech, idx) => {
          const Icon = tech.icon;
          return (
            <div
              key={idx}
              className="flex flex-col items-center text-center hover:scale-110 transition-transform duration-200"
            >
              <Icon className="text-7xl text-white mb-4" />
              <span className="text-base font-medium text-white">
                {tech.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
