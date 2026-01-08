/**
 * Premium Creative Footer Component
 *
 * Artistic footer with perfect alignment and creative UI elements
 * Compact version with enhanced hover effects and animations
 *
 * @component
 * @returns {React.ReactElement} Premium creative footer
 */
import React, { useState, useEffect } from "react";
import {
  FaApple,
  FaGooglePlay,
  FaHeart,
  FaArrowUp,
  FaEnvelope,
  FaGraduationCap,
  FaRocket,
  FaChartLine,
  FaUsers,
  FaCalendar,
  FaGlobeAmericas,
  FaCodeBranch,
  FaStar,
  FaCrown,
  FaCheckCircle,
  FaBolt,
} from "react-icons/fa";
import {
  RiTwitterXFill,
  RiFacebookFill,
  RiInstagramFill,
  RiLinkedinFill,
  RiYoutubeFill,
  RiGithubFill,
  RiDiscordFill,
} from "react-icons/ri";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  const socialMedia = [
    {
      icon: <RiTwitterXFill className="text-sm" />,
      name: "X (Twitter)",
      color: "bg-black",
      hover: "hover:shadow-black/40 hover:bg-black",
      textColor: "text-gray-800",
      hoverTextColor: "text-white",
    },
    {
      icon: <RiFacebookFill className="text-sm" />,
      name: "Facebook",
      color: "bg-blue-600",
      hover: "hover:shadow-blue-600/40 hover:bg-blue-600",
      textColor: "text-gray-800",
      hoverTextColor: "text-white",
    },
    {
      icon: <RiInstagramFill className="text-sm" />,
      name: "Instagram",
      color: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400",
      hover:
        "hover:shadow-purple-500/40 hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-orange-400",
      textColor: "text-gray-800",
      hoverTextColor: "text-white",
    },
    {
      icon: <RiLinkedinFill className="text-sm" />,
      name: "LinkedIn",
      color: "bg-blue-700",
      hover: "hover:shadow-blue-700/40 hover:bg-blue-700",
      textColor: "text-gray-800",
      hoverTextColor: "text-white",
    },
    {
      icon: <RiYoutubeFill className="text-sm" />,
      name: "YouTube",
      color: "bg-red-600",
      hover: "hover:shadow-red-600/40 hover:bg-red-600",
      textColor: "text-gray-800",
      hoverTextColor: "text-white",
    },
    {
      icon: <RiGithubFill className="text-sm" />,
      name: "GitHub",
      color: "bg-gray-800",
      hover: "hover:shadow-gray-800/40 hover:bg-gray-800",
      textColor: "text-gray-800",
      hoverTextColor: "text-white",
    },
    {
      icon: <RiDiscordFill className="text-sm" />,
      name: "Discord",
      color: "bg-indigo-500",
      hover: "hover:shadow-indigo-500/40 hover:bg-indigo-500",
      textColor: "text-gray-800",
      hoverTextColor: "text-white",
    },
  ];

  const footerLinks = [
    {
      title: "Platform",
      icon: (
        <FaRocket className="text-purple-500 group-hover:rotate-12 transition-transform duration-500" />
      ),
      links: [
        { text: "Campus Connect", tag: "Popular" },
        {
          text: "Study Hub",
          icon: (
            <FaUsers className="text-xs ml-1 text-blue-500 group-hover:scale-125 transition-transform duration-300" />
          ),
        },
        {
          text: "Career Portal",
          icon: (
            <FaChartLine className="text-xs ml-1 text-green-500 group-hover:scale-125 transition-transform duration-300" />
          ),
        },
        {
          text: "Event Calendar",
          icon: (
            <FaCalendar className="text-xs ml-1 text-orange-500 group-hover:scale-125 transition-transform duration-300" />
          ),
        },
      ],
    },
    {
      title: "Resources",
      icon: (
        <FaCodeBranch className="text-blue-500 group-hover:rotate-180 transition-transform duration-700" />
      ),
      links: [
        { text: "API Docs", tag: "Pro" },
        { text: "Tutorials" },
        {
          text: "Community Forum",
          icon: (
            <FaGlobeAmericas className="text-xs ml-1 text-cyan-500 group-hover:scale-125 transition-transform duration-300" />
          ),
        },
        { text: "Help Center" },
      ],
    },
    {
      title: "Company",
      icon: (
        <FaCrown className="text-amber-500 group-hover:scale-110 transition-transform duration-500" />
      ),
      links: [
        { text: "About Us", tag: "New" },
        { text: "Careers", tag: "Hiring" },
        { text: "Blog" },
        {
          text: "Partners",
          icon: (
            <FaStar className="text-xs ml-1 text-yellow-500 group-hover:scale-125 transition-transform duration-300" />
          ),
        },
      ],
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 via-white to-purple-50 border-t border-gray-200/70 py-2">
      {/* Background Container - Handles Overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Creative Background Elements with Animation */}
        <div className="absolute inset-0">
          {/* Gradient Orbs - Smaller with Animation */}
          <div className="absolute top-1/4 -left-8 w-24 h-24 bg-gradient-to-r from-purple-300/15 to-pink-300/15 rounded-full blur-2xl animate-float-slow"></div>
          <div className="absolute bottom-1/4 -right-8 w-24 h-24 bg-gradient-to-r from-blue-300/15 to-cyan-300/15 rounded-full blur-2xl animate-float"></div>

          {/* Animated Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(to right, #9333ea 1px, transparent 1px),
                                      linear-gradient(to bottom, #9333ea 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>

        {/* Animated Top Border */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        <div className="absolute top-0 left-0 w-1/3 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 animate-marquee"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Main Header Row - Compact with Enhanced Hover */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
          {/* Brand Section with Hover Effect */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:shadow-xl">
                <FaGraduationCap
                  size={18}
                  className="group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-ping group-hover:animate-none"></div>
            </div>
            <div className="transform group-hover:translate-x-1 transition-transform duration-300">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-700 group-hover:via-pink-600 group-hover:to-blue-600 transition-all duration-500">
                UniHub
              </h2>
              <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5 group-hover:text-gray-800 transition-colors duration-300">
                <FaCheckCircle className="text-green-500 text-xs group-hover:scale-125 transition-transform duration-500" />
                <span>Trusted by 50K+ Students</span>
              </p>
            </div>
          </div>

          {/* Social Media Row - FIXED Hover Effects */}
          <div className="w-full md:w-auto">
            <div className="flex justify-center md:justify-start gap-1.5">
              {socialMedia.map((social, index) => (
                <div
                  key={social.name}
                  className="relative"
                  onMouseEnter={() => setHoveredIcon(index)}
                  onMouseLeave={() => setHoveredIcon(null)}
                >
                  <a
                    href="#"
                    className={`w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center transition-all duration-300 ${social.hover} shadow-sm hover:shadow-xl hover:-translate-y-1 relative overflow-hidden`}
                  >
                    {/* Icon with proper color transition */}
                    <div
                      className={`relative z-10 transition-all duration-300 ${
                        hoveredIcon === index
                          ? social.hoverTextColor
                          : social.textColor
                      }`}
                    >
                      {social.icon}
                    </div>

                    {/* Background on Hover */}
                    <div
                      className={`absolute inset-0 rounded-lg ${
                        social.color
                      } opacity-0 ${
                        hoveredIcon === index ? "opacity-100" : "opacity-0"
                      } transition-all duration-300`}
                    ></div>
                  </a>

                  {/* Tooltip with Animation */}
                  {hoveredIcon === index && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-50">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-bounceIn relative">
                        {social.name}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* App Store Badges - Enhanced Hover */}
          <div className="flex gap-1.5">
            <a
              href="#"
              className="px-2 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-1.5 group hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <FaApple className="text-sm group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
              <div className="text-left">
                <div className="text-[7px] group-hover:tracking-wider transition-all duration-300">
                  App Store
                </div>
              </div>
            </a>
            <a
              href="#"
              className="px-2 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-1.5 group hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <FaGooglePlay className="text-sm group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
              <div className="text-left">
                <div className="text-[7px] group-hover:tracking-wider transition-all duration-300">
                  Play Store
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Main Content Grid - Enhanced Hover Effects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-2">
          {/* Description Column - Enhanced Hover */}
          <div
            className="bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-gray-200/50 hover:border-purple-300/50 hover:bg-white/70 hover:shadow-lg transition-all duration-500 group cursor-pointer"
            onMouseEnter={() => setHoveredLink("description")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center transition-all duration-500 group-hover:from-purple-200 group-hover:to-pink-200 ${
                  hoveredLink === "description" ? "animate-pulse" : ""
                }`}
              >
                <FaBolt
                  className="text-purple-600 group-hover:text-purple-700 group-hover:scale-110 transition-all duration-300"
                  size={12}
                />
              </div>
              <h3 className="text-xs font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                Why Choose UniHub?
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
              The ultimate platform connecting students worldwide with
              AI-powered tools.
            </p>
            {/* Hover Indicator */}
            <div className="h-0.5 w-0 bg-gradient-to-r from-purple-500 to-pink-500 mt-2 group-hover:w-full transition-all duration-700"></div>
          </div>

          {/* Links Columns - Enhanced Hover Effects */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {footerLinks.map((section, sectionIndex) => (
                <div
                  key={section.title}
                  className="bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-gray-200/50 hover:border-purple-200 hover:bg-white/70 hover:shadow-lg transition-all duration-500 group"
                >
                  <div className="flex items-center gap-2 mb-1.5 group-hover:gap-3 transition-all duration-500">
                    {section.icon}
                    <h4 className="text-xs font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                      {section.title}
                    </h4>
                  </div>
                  <ul className="space-y-0.5">
                    {section.links.map((link, linkIndex) => (
                      <li key={link.text}>
                        <a
                          href="#"
                          className="flex items-center justify-between text-xs text-gray-600 hover:text-purple-600 transition-all duration-300 group/link py-1"
                          onMouseEnter={() =>
                            setHoveredLink(`${sectionIndex}-${linkIndex}`)
                          }
                          onMouseLeave={() => setHoveredLink(null)}
                        >
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-1 h-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover/link:opacity-100 transition-all duration-300 ${
                                hoveredLink === `${sectionIndex}-${linkIndex}`
                                  ? "animate-pulse"
                                  : ""
                              }`}
                            ></div>
                            <span className="truncate group-hover/link:translate-x-1 transition-transform duration-300">
                              {link.text}
                            </span>
                            {link.icon}
                          </div>
                          <div className="flex items-center gap-1">
                            {link.tag && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-full text-white group-hover/link:scale-110 transition-transform duration-300 ${
                                  link.tag === "Popular"
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 group-hover/link:from-purple-600 group-hover/link:to-pink-600"
                                    : link.tag === "Pro"
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 group-hover/link:from-amber-600 group-hover/link:to-orange-600"
                                    : link.tag === "New"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 group-hover/link:from-green-600 group-hover/link:to-emerald-600"
                                    : "bg-gradient-to-r from-blue-500 to-cyan-500 group-hover/link:from-blue-600 group-hover/link:to-cyan-600"
                                }`}
                              >
                                {link.tag}
                              </span>
                            )}
                            {/* Arrow Indicator */}
                            <div className="opacity-0 group-hover/link:opacity-100 transform group-hover/link:translate-x-0.5 transition-all duration-300">
                              <div className="w-2 h-2 border-r border-t border-purple-500 rotate-45"></div>
                            </div>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section - Enhanced Hover and Animation */}
        <div className="relative mb-2 group/newsletter">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-pink-500/3 to-blue-500/3 rounded-xl blur-sm group-hover/newsletter:blur-md transition-all duration-500"></div>
          <div className="relative bg-gradient-to-r from-white to-purple-50/30 border border-purple-100 rounded-lg p-2 shadow-sm group-hover/newsletter:shadow-lg group-hover/newsletter:border-purple-300 transition-all duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 group/icon">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md group-hover/icon:shadow-lg group-hover/icon:scale-110 transition-all duration-500">
                    <FaEnvelope
                      size={14}
                      className="group-hover/icon:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {/* Pulsing Effect */}
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 opacity-0 group-hover/icon:opacity-100 group-hover/icon:animate-ping transition-opacity duration-500"></div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-900 group-hover/newsletter:text-purple-700 transition-colors duration-300">
                    Stay Updated
                  </h4>
                  <p className="text-[10px] text-gray-600 group-hover/newsletter:text-gray-800 transition-colors duration-300">
                    Weekly campus updates
                  </p>
                </div>
              </div>

              {subscribed ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded px-3 py-2 animate-bounceIn hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs group-hover:rotate-360 transition-transform duration-700">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-800 group-hover:font-bold transition-all duration-300">
                      Subscribed!
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="flex gap-2 w-full sm:w-auto group/form"
                >
                  <div className="relative flex-1 sm:w-48">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 outline-none transition-all duration-300 group-hover/form:border-purple-400"
                    />
                    {/* Focus/Hover Effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover/form:from-purple-500/5 group-hover/form:to-pink-500/5 transition-all duration-500 pointer-events-none"></div>
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 text-xs font-medium relative overflow-hidden group/btn"
                  >
                    {/* Button Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 group-hover/btn:tracking-wider transition-all duration-300">
                      Subscribe
                    </span>
                    {/* Button Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-0 group-hover/btn:opacity-30 transition-opacity duration-500"></div>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar - Enhanced Hover Effects */}
        <div className="border-t border-gray-200/50 pt-1 group/bottom">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Copyright with Hover Effect */}
            <div className="text-center sm:text-left group/copyright cursor-pointer">
              <div className="flex items-center gap-1.5 mb-0.5 justify-center sm:justify-start">
                <FaHeart className="text-red-500 text-xs group-hover/copyright:scale-125 group-hover/copyright:animate-pulse transition-all duration-300" />
                <p className="text-xs text-gray-700 group-hover/copyright:text-purple-700 transition-colors duration-300">
                  Crafted with passion
                </p>
              </div>
              <p className="text-[10px] text-gray-500 group-hover/copyright:text-gray-700 transition-colors duration-300">
                © {currentYear} UniHub. All rights reserved.
              </p>
            </div>

            {/* Legal Links with Enhanced Hover */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex gap-3">
                {["Privacy", "Terms", "Cookies", "Contact"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-[10px] text-gray-600 hover:text-purple-600 transition-all duration-300 relative group/link-item"
                  >
                    <span className="relative z-10 group-hover/link-item:font-medium">
                      {link}
                    </span>
                    {/* Animated Underline */}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover/link-item:w-full transition-all duration-500"></span>
                    {/* Hover Dot */}
                    <span className="absolute -left-1 top-1/2 w-1 h-1 rounded-full bg-purple-500 opacity-0 group-hover/link-item:opacity-100 -translate-y-1/2 transition-all duration-300"></span>
                  </a>
                ))}
              </div>
              <div className="h-3 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent group-hover/bottom:via-purple-300 transition-all duration-500"></div>
              <div className="flex gap-1">
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-[10px] rounded-full border border-purple-200 hover:from-purple-200 hover:to-pink-200 hover:border-purple-300 hover:scale-105 hover:shadow-sm transition-all duration-300 cursor-pointer">
                  🎓 Edu-Tech
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Back to Top Button with Animation */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-4 right-4 w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 z-50 group/backtop overflow-hidden ${
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        {/* Button Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover/backtop:opacity-100 transition-opacity duration-300"></div>

        {/* Arrow Icon with Animation */}
        <FaArrowUp
          size={14}
          className="relative z-10 group-hover/backtop:scale-110 group-hover/backtop:-translate-y-1 transition-transform duration-300"
        />

        {/* Glow Effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-0 group-hover/backtop:opacity-30 transition-opacity duration-500"></div>

        {/* Bounce Animation */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 group-hover/backtop:animate-ping opacity-0 group-hover/backtop:opacity-20 transition-opacity duration-300`}
        ></div>
      </button>

      {/* Custom Animations */}
      <style jsx>{`
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

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.8);
          }
          70% {
            opacity: 1;
            transform: translateY(-5px) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-5px) translateX(5px);
          }
          66% {
            transform: translateY(5px) translateX(-5px);
          }
        }

        @keyframes marquee {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes rotate360 {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-marquee {
          animation: marquee 3s linear infinite;
        }

        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .group-hover:rotate-360:hover {
          animation: rotate360 0.7s ease-out;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
