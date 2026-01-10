import { useEffect } from "react"
import { gsap } from "gsap"
import * as confetti from "canvas-confetti"

const SuccessAnimation = () => {
  useEffect(() => {
    gsap.fromTo(
      ".success-box",
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "elastic.out(1,0.5)" }
    )

    confetti.default({
      particleCount: 150,
      spread: 80,
    })
  }, [])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="success-box bg-white rounded-2xl p-10 text-center">
        <h2 className="text-3xl font-bold mb-2">Payment Successful 🎉</h2>
        <p className="text-gray-600">Welcome to the course!</p>
      </div>
    </div>
  )
}

export default SuccessAnimation
