import BentoGrid from '../components/BentoGrid'
import Hero from '../components/Hero'
import HomeCTA from '../components/HomeCTA'
import KeyHiglight from '../components/KeyHiglight'
import LandingNavbar from '../components/LandingNavbar'
import Footer from '../components/Footer'
import SEO from '../components/Seo'

import { useEffect } from 'react'
import Lenis from 'lenis'
import EngineeredConnection from '../components/EngineeredConnection'

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

  return (
    <>
      <SEO 
        title="UniHub - Your Centralized College Platform"
        description="Join UniHub, the ultimate centralized hub for college students. Connect with peers, access resources, manage events, and grow your network all in one place."
        keywords="college platform, student community, campus hub, university network"
      />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
        <LandingNavbar />

        <main className="overflow-x-hidden">
          {/* ✅ COURSES-OPTIMIZED HERO */}
          <Hero variant="courses" />

          <KeyHiglight />
          <EngineeredConnection />

          {/* ✅ GSAP-ENHANCED BENTO GRID */}
          <BentoGrid />

          <HomeCTA />
        </main>

        <Footer />
      </div>
    </>
  )
}

export default Landing
