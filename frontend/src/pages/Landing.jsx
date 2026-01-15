import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  MessageCircle,
  Video,
  TrendingUp,
  BookOpen,
  Calendar,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import ScrollFloat from "../components/ScrollFloat";

// Testimonial Carousel Component
const TestimonialCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      college: "BITS Pilani",
      name: "Aryan Patel",
      role: "Computer Science Senior",
      quote: "College Media transformed how I connect with my campus community. From organizing study groups to discovering campus events, everything feels seamless. The platform helped me find my people and made my college experience truly memorable. It's not just an app it's where my college life happens.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=face"
    },
    {
      college: "UIET Panjab University",
      name: "Himat",
      role: "Engineering Student",
      quote: "As an international student, College Media helped me feel at home from day one. I found study partners, joined clubs, and made lifelong friends all through one platform. The real-time updates about campus events mean I never miss out on what's happening. It's the best tool for staying connected.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&crop=face"
    },
    {
      college: "CCET",
      name: "Nazia",
      role: "Business Major",
      quote: "College Media isn't just about social networking it's about building a genuine community. I've collaborated on projects, attended amazing events, and shared unforgettable moments. The messaging feature keeps me connected with friends across different colleges too. Absolutely love this platform!",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=face"
    }
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[activeIndex];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex justify-center gap-12 mb-12">
        {testimonials.map((test, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`text-gray-600 hover:text-gray-900 transition relative pb-2 ${
              idx === activeIndex ? 'text-gray-900 font-medium' : ''
            }`}
          >
            {test.college}
            {idx === activeIndex && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e8684a]" />
            )}
          </button>
        ))}
      </div>

      {/* Testimonial Card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-5 gap-0">
          {/* Image Section */}
          <div className="md:col-span-2 h-full">
            <img
              src={currentTestimonial.image}
              alt={currentTestimonial.name}
              className="w-full h-full object-cover min-h-[400px]"
            />
          </div>

          {/* Content Section */}
          <div className="md:col-span-3 p-10 md:p-12 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {currentTestimonial.college}
              </h3>
              <blockquote className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8">
                "{currentTestimonial.quote}"
              </blockquote>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="font-semibold text-gray-900 text-lg">
                {currentTestimonial.name}
              </div>
              <div className="text-gray-500 mt-1">
                {currentTestimonial.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={prevTestimonial}
          className="w-12 h-12 rounded-full bg-[#e8684a] hover:bg-[#d65a3d] flex items-center justify-center text-white transition shadow-md"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextTestimonial}
          className="w-12 h-12 rounded-full bg-[#e8684a] hover:bg-[#d65a3d] flex items-center justify-center text-white transition shadow-md"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

/**
 * Landing Page Component
 */
const Landing = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const videos = [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=600&fit=crop",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=600&fit=crop",
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 w-full z-50 px-2 md:px-4 py-2 md:py-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg px-3 md:px-6 py-2 md:py-3 flex justify-between items-center border border-gray-200">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-base md:text-lg font-bold text-black">College Media</span>
            </div>

            <div className="hidden lg:flex gap-6 text-gray-700 text-sm font-medium">
              <a href="#features" className="hover:text-gray-900 transition">Features</a>
              <a href="#community" className="hover:text-gray-900 transition">Community</a>
              <a href="#testimonials" className="hover:text-gray-900 transition">Stories</a>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Link to="/login" className="px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-[#e8684a] text-white text-xs md:text-sm font-medium hover:bg-[#d65a3d] transition">
                Log In
              </Link>
              <Link to="/signup" className="px-3 md:px-5 py-1.5 md:py-2 rounded-full bg-gray-900 text-white text-xs md:text-sm font-medium hover:bg-black transition">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20" style={{ background: "#faf6ee" }}>
        <div className="max-w-6xl mx-auto px-6 text-center">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#fde7d9] text-sm mb-6 text-gray-800">
            <span className="text-lg">💡</span>
            Built for college communities - 10,000+ students sharing daily
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
            Turn Everyday College Moments
            <br className="hidden md:block" />
            into Stories Everyone Feels
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            A private social network built for college communities 
            share, connect, and belong.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-block px-8 py-3.5 rounded-full bg-[#e8684a] text-white font-medium hover:bg-[#d65a3d] transition shadow-sm"
            >
              Join Your College Network
            </Link>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-block px-8 py-3.5 rounded-full bg-white/80 text-gray-700 font-medium hover:bg-white transition shadow-sm"
            >
              Explore Campus Feed
            </button>
          </div>

          {/* MEDIA STRIP */}
          <div className="relative mt-16 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10"
              style={{ background: "linear-gradient(to right, #faf6ee, transparent)" }}
            />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10"
              style={{ background: "linear-gradient(to left, #faf6ee, transparent)" }}
            />

            <div className="flex gap-6 animate-marquee px-6">
              {[...videos, ...videos].map((src, i) => (
                <div
                  key={i}
                  className="w-[240px] h-[340px] rounded-2xl overflow-hidden bg-white shadow-md flex-shrink-0 hover:scale-[1.03] transition"
                >
                  <img src={src} alt={`Campus moment ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-black ">
            Built for College Life
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {/* Share Moments - Large */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 flex flex-col justify-between border-2 border-black">
              <div>
                <Video className="w-12 h-12 mb-4 text-blue-600" />
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Share Moments</h3>
                <p className="text-gray-600 text-lg">Post photos & videos from campus life</p>
              </div>
            </div>

            {/* Campus Network */}
            <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8 flex items-start justify-between border-2 border-black">
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Campus Network</h3>
                <p className="text-gray-600">Connect with students from your college</p>
              </div>
              <Users className="w-10 h-10 text-purple-600" />
            </div>

            {/* Messaging */}
            <div className="md:col-span-1 bg-[#e8684a] rounded-3xl p-6 flex flex-col items-center justify-center text-white text-center border-2 border-black">
              <MessageCircle className="w-12 h-12 mb-3" />
              <h3 className="text-lg font-bold">Messaging</h3>
              <p className="text-sm mt-2 text-white/90">Chat privately or in groups</p>
            </div>

            {/* Events */}
            <div className="md:col-span-1 bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 flex flex-col border-2 border-black">
              <Calendar className="w-10 h-10 mb-3 text-amber-600" />
              <h3 className="text-lg font-bold text-gray-900">Events</h3>
              <p className="text-sm text-gray-600 mt-2">Never miss college fests & workshops</p>
            </div>

            {/* Study Groups - Large */}
            <div className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 flex items-center justify-between border-2 border-black">
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">Study Groups</h3>
                <p className="text-gray-600">Collaborate and share notes</p>
              </div>
              <BookOpen className="w-12 h-12 text-green-600" />
            </div>

            {/* Trending */}
            <div className="md:col-span-2 bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-8 flex flex-col justify-center border-2 border-black">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Trending</h3>
                  <p className="text-gray-600">See what's popular on campus</p>
                </div>
                <TrendingUp className="w-10 h-10 text-pink-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #fef5f3 0%, #fde7d9 50%, #fee5d5 100%)" }}>
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
            Loved by Students Everywhere
          </h2>

          <TestimonialCarousel />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black text-white text-center">
        <h2 className="text-4xl font-bold mb-6">
          Join Your Campus Today
        </h2>
        <Link
          to="/explore-hub"
          className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition"
        >
          Get Started Free <ArrowRight />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-gradient-to-br from-[#e8684a] via-[#d65a3d] to-[#c44d2c] text-white py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Left Section - Contact Form */}
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
                Drop us a line
              </h2>
              <div className="flex gap-4">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 outline-none focus:bg-white/30 transition"
                />
                <Link
                  to="/contact"
                  className="px-8 py-4 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold hover:bg-white/30 transition flex items-center gap-2 whitespace-nowrap"
                >
                  Contact
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Right Section - CTA & Social Links */}
            <div className="flex flex-col justify-between">
              <p className="text-lg text-white/90 mb-6 leading-relaxed">
                Join the conversation or share your feedback. We're ready to embark on this journey with you. Are you?
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a href="#" className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-mono hover:bg-white/20 transition">
                  [ INSTAGRAM ]
                </a>
                <a href="#" className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-mono hover:bg-white/20 transition">
                  [ TWITTER ]
                </a>
                <a href="#" className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-mono hover:bg-white/20 transition">
                  [ LINKEDIN ]
                </a>
                <a href="#" className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-mono hover:bg-white/20 transition">
                  [ FACEBOOK ]
                </a>
              </div>
            </div>
          </div>

          {/* Large Text Logo */}
          <div className="relative mt-12">
            <div className="flex flex-col items-center gap-0">
              <ScrollFloat
                animationDuration={1}
                ease="back.inOut(2)"
                scrollStart="center bottom+=50%"
                scrollEnd="bottom bottom-=40%"
                stagger={0.03}
                containerClassName=""
                textClassName="text-black"
              >
                COLLEGE
              </ScrollFloat>
              <ScrollFloat
                animationDuration={1}
                ease="back.inOut(2)"
                scrollStart="center bottom+=50%"
                scrollEnd="bottom bottom-=40%"
                stagger={0.03}
                containerClassName=""
                textClassName="text-black"
              >
                MEDIA
              </ScrollFloat>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm">© 2026 College Media. All rights reserved.</p>
            <div className="flex gap-6 text-white/70">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* MARQUEE CSS */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
          width: max-content;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Landing;
