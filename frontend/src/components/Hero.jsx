import { useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DashboardPreview from "./DashboardPreview";

gsap.registerPlugin(ScrollTrigger);

import ScrollFloat from "./ScrollFloat";

const Hero = ({ variant = "home" }) => {
  const navigate = useNavigate();

  const heroRef = useRef(null);
  const blob1 = useRef(null);
  const blob2 = useRef(null);
  const blob3 = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation (no blink)
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 120,
        duration: 1.4,
        ease: "power4.out",
      });

      // Subtle parallax blobs
      gsap.to(blob1.current, {
        y: -80,
        scrollTrigger: { scrub: true },
      });
      gsap.to(blob2.current, {
        y: -120,
        scrollTrigger: { scrub: true },
      });
      gsap.to(blob3.current, {
        y: -60,
        scrollTrigger: { scrub: true },
      });
    });

    return () => ctx.revert(); // 👈 CLEANUP (IMPORTANT)
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Background Blobs */}
      <div
        ref={blob1}
        className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900/30 rounded-full filter blur-2xl opacity-20 animate-blob"
      />
      <div
        ref={blob2}
        className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-200 dark:bg-yellow-900/30 rounded-full filter blur-2xl opacity-20 animate-blob animation-delay-2000"
      />
      <div
        ref={blob3}
        className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-200 dark:bg-pink-900/30 rounded-full filter blur-2xl opacity-20 animate-blob animation-delay-4000"
      />

      {/* Hero Content */}
      <div
        ref={heroRef}
        className="max-w-7xl mx-auto px-6 relative z-20 text-center"
      >
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 mb-8 badge-pulse">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {variant === "courses"
            ? "Skill-focused, project-first learning"
            : "Now live on 50+ Campuses"}
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6 max-w-4xl mx-auto leading-[1.1]">
          {variant === "courses" ? (
            <>
              Learn{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                Industry-Ready Skills
              </span>
            </>
          ) : (
            <>
              The Social Network Built for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                College Life
              </span>
            </>
          )}
        </h1>

        {/* ScrollFloat (Courses only) */}
        {variant === "courses" && (
          <div className="mb-6">
            <ScrollFloat text="Build • Deploy • Get Hired" />
          </div>
        )}

        {/* Description */}
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
          {variant === "courses"
            ? "Hands-on, project-based courses designed to make you job-ready — not just certificate-ready."
            : "Connect with classmates, share campus moments, and build your network in a clean, distraction-free environment designed for the next generation."}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button
            onClick={() =>
              navigate(variant === "courses" ? "/courses" : "/home")
            }
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            {variant === "courses" ? "Explore Courses →" : "Join Your Campus →"}
          </button>

          <button className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all active:scale-95">
            View Demo
          </button>
        </div>

        {/* UI Mockup (Home only) */}
        {variant === "home" && (
          <div className="relative max-w-5xl mx-auto perspective-1000">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden transform rotate-x-12 hover:rotate-0 transition-transform duration-700 p-1">
              {variant === "home" && (
                <div className="relative max-w-5xl mx-auto">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden p-2">
                    <DashboardPreview />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
