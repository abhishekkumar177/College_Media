interface Props {
  title: string
  price: number
  onBuy: () => void
}

const PricingCard = ({ title, price, onBuy }: Props) => {
  return (
    <div className="pricing-card bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-4xl font-bold my-4">${price}</p>

      <ul className="text-gray-600 space-y-2 mb-6">
        <li>✔ Full Access</li>
        <li>✔ Certificate</li>
        <li>✔ Community Support</li>
      </ul>

      <button
        onClick={onBuy}
        className="w-full py-2 rounded-lg bg-black text-white hover:opacity-90"
      >
        Buy Now
      </button>
    </div>
  )
}

export default PricingCard
