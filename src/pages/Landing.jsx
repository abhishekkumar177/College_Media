import BentoGrid from '../components/BentoGrid'
import Hero from '../components/Hero'
import HomeCTA from '../components/HomeCTA'
import KeyHiglight from '../components/KeyHiglight'
import LandingNavbar from '../components/LandingNavbar'
import Footer from '../components/Footer'
import SEO from '../components/Seo'

import { useEffect } from 'react'

/**
 * Landing Page Component
 * 
 * Main entry point for non-authenticated users introducing UniHub
 * A centralized platform for everything college - beyond just social media
 * 
 * Structure:
 * - SEO: Meta tags for search engines and social media
 * - LandingNavbar: Navigation with logo and auth buttons
 * - Hero: Gradient-themed hero section with main value proposition
 * - KeyHiglight: Key features and benefits showcase
 * - BentoGrid: Feature grid layout (responsive card layout)
 * - HomeCTA: Call-to-action section to join the platform
 * - Footer: Links, social media, and copyright info
 * 
 * @component
 * @returns {React.ReactElement} Complete landing page layout
 */
const Landing = () => {
  // Enable smooth scrolling for anchor links
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);
  
  return (
   <>
   {/* SEO Meta Tags for Search Engines and Social Media */}
   <SEO 
     title="UniHub - Your Centralized College Platform"
     description="Join UniHub, the ultimate centralized hub for college students. Connect with peers, access resources, manage events, and grow your network all in one place."
     keywords="college platform, student community, campus hub, university network, student social media, college resources, academic platform"
   />
   
   <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50">
     {/* Navigation Bar - Sticky header with branding and auth options */}
     <LandingNavbar/>
     
     {/* Main Content Area */}
     <main className="overflow-x-hidden">
       {/* Hero Section - Primary value proposition with gradient theme */}
       <Hero/>
       
       {/* Key Highlights - Showcase platform features and benefits */}
       <KeyHiglight/>
       
       {/* Bento Grid - Feature cards in responsive grid layout */}
       <BentoGrid/>
       
       {/* Call to Action - Conversion section for user signup */}
       <HomeCTA/>
     </main>
     
     {/* Footer - Site links, social media, legal info */}
     <Footer/>
   </div>
   </>
  )
}

export default Landing