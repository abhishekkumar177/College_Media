import { useEffect, useState } from "react"
import { gsap } from "gsap"
import PricingToggle from "./PricingToggle"
import PricingCard from "./PricingCard"
import FeatureTable from "./FeatureTable"
import SuccessAnimation from "./SuccessAnimation"

const PricingSection = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    gsap.from(".pricing-card", {
      opacity: 0,
      scale: 0.85,
      y: 40,
      stagger: 0.2,
      duration: 0.6,
      ease: "back.out(1.7)",
    })
  }, [])

  return (
    <section className="py-16 text-center">
      <h2 className="text-3xl font-bold mb-6">Choose Your Plan</h2>

      <PricingToggle billing={billing} setBilling={setBilling} />

      <div className="grid md:grid-cols-3 gap-6 mt-10">
        <PricingCard
          title="Basic"
          price={billing === "monthly" ? 19 : 190}
          onBuy={() => setSuccess(true)}
        />
        <PricingCard
          title="Pro"
          price={billing === "monthly" ? 39 : 390}
          onBuy={() => setSuccess(true)}
        />
        <PricingCard
          title="Enterprise"
          price={billing === "monthly" ? 79 : 790}
          onBuy={() => setSuccess(true)}
        />
      </div>

      <FeatureTable />

      {success && <SuccessAnimation />}
    </section>
  )
}

export default PricingSection
