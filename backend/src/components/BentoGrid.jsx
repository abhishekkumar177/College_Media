/**
 * BentoGrid Component
 *
 * Feature showcase grid for UniHub's centralized platform
 * Enhanced with GSAP ScrollTrigger animations for Courses Landing
 */

import React, { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const BentoGrid = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".bento-item", {
        opacity: 0,
        y: 60,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background Blobs */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-60" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            More Than Just Social Media
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            UniHub brings all your college needs together in one powerful,
            intuitive platform
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          
          {/* Feature 1 */}
          <div className="bento-item md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 flex flex-col justify-between overflow-hidden group transition-all hover:scale-[1.015]">
            <div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                📚
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">
                Academic Excellence Hub
              </h3>
              <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                Access study groups, course materials, tutoring services, and
                academic calendars. Collaborate with classmates and share notes
                in one centralized space.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bento-item bg-white rounded-2xl p-8 border border-slate-200 flex flex-col transition-all hover:scale-[1.03]">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-4">
              📅
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Event Manager
            </h3>
            <p className="text-xs text-slate-500 mt-auto">
              Discover campus events, manage RSVPs, and never miss club meetings.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bento-item bg-white rounded-2xl p-8 border border-slate-200 flex flex-col transition-all hover:scale-[1.03]">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              💼
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Career Network
            </h3>
            <p className="text-xs text-slate-500 mt-auto">
              Connect with alumni, explore internships, and access career
              services.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bento-item md:col-span-2 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 border border-pink-100 flex flex-col md:flex-row justify-between items-center transition-all hover:scale-[1.02]">
            <div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                👥
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Verified Student Profiles
              </h3>
              <p className="text-sm text-slate-600">
                Showcase your achievements, skills, and portfolio in a verified
                student community.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bento-item bg-white rounded-2xl p-8 border border-slate-200 flex flex-col transition-all hover:scale-[1.03]">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              🏆
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Track Achievements
            </h3>
            <p className="text-xs text-slate-500 mt-auto">
              Earn badges, track milestones, and get recognized.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bento-item md:col-span-3 bg-slate-900 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center transition-all hover:scale-[1.01]">
            <div className="max-w-lg">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Icon icon="lucide:zap" className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Lightning Fast & Secure
              </h3>
              <p className="text-sm text-slate-300">
                Real-time notifications and secure communication built with
                modern tech.
              </p>
            </div>

            <div className="flex gap-4 mt-6 md:mt-0">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
                  <Icon
                    icon="lucide:shield-check"
                    className="w-7 h-7 text-green-400"
                  />
                </div>
                <span className="text-xs text-slate-400">Secure</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center">
                  <Icon
                    icon="lucide:rocket"
                    className="w-7 h-7 text-blue-400"
                  />
                </div>
                <span className="text-xs text-slate-400">Fast</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
