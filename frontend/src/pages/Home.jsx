import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SocialFeed from "../components/Social/SocialFeed";
import Features from "../components/Features";
import About from "../components/About";
import Team from "../components/Team";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div style={{ 
      background: 'linear-gradient(to bottom right, #1e1b4b, #3730a3, #1e1b4b)', 
      color: 'white',
      minHeight: '100vh'
    }} 
    data-homepage="true">
      <Navbar />
      <Hero />
      <SocialFeed />
      <Features />
      <About />
      <Team />
      <CTA />
      <Footer />
    </div>
  );
}
