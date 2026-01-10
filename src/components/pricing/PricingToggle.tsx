interface Props {
  billing: "monthly" | "yearly"
  setBilling: (v: "monthly" | "yearly") => void
}

const PricingToggle = ({ billing, setBilling }: Props) => {
  return (
    <div className="relative mx-auto flex w-56 bg-gray-200 rounded-full p-1">
      <div
        className={`absolute top-1 left-1 h-10 w-1/2 bg-white rounded-full transition-all duration-300
        ${billing === "yearly" ? "translate-x-full" : ""}`}
      />
      <button
        className="relative z-10 w-1/2"
        onClick={() => setBilling("monthly")}
      >
        Monthly
      </button>
      <button
        className="relative z-10 w-1/2"
        onClick={() => setBilling("yearly")}
      >
        Yearly
      </button>
    </div>
  )
}

export default PricingToggle
