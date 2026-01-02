import BentoGrid from '../components/BentoGrid'
import Hero from '../components/Hero'
import HomeCTA from '../components/HomeCTA'
import KeyHiglight from '../components/KeyHiglight'
import LandingNavbar from '../components/LandingNavbar'
import Footer from '../components/Footer'

const Landing = () => {
  return (
   <>
   <LandingNavbar/>
   <Hero/>
   <KeyHiglight/>
   <BentoGrid/>
   <HomeCTA/>
   <Footer/>
   </>
  )
}

export default Landing