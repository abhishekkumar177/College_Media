// src/components/ProBackground.jsx
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const ProBackground = () => {
  const blob1 = useRef(null);
  const blob2 = useRef(null);

  useEffect(() => {
    if (!blob1.current || !blob2.current) return;

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { ease: "sine.inOut" },
    });

    tl.to(blob1.current, {
      x: 140,
      y: -100,
      backgroundColor: "rgba(94, 234, 212, 0.35)",      // teal‑neon
      duration: 36,
    }).to(
      blob2.current,
      {
        x: -120,
        y: 120,
        backgroundColor: "rgba(244, 114, 182, 0.35)",    // pink‑neon
        duration: 48,
      },
      0
    );

    return () => tl.kill();
  }, []);

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
      {/* TOP‑LEFT NEON BLOB */}
      <div
        ref={blob1}
        style={{ willChange: "transform" }}
        className="absolute -top-[25%] -left-[18%] w-[520px] h-[520px]
                   rounded-full bg-[#22d3ee]/30 blur-[180px] opacity-80
                   mix-blend-screen"
      />

      {/* BOTTOM‑RIGHT NEON BLOB */}
      <div
        ref={blob2}
        style={{ willChange: "transform" }}
        className="absolute -bottom-[25%] -right-[18%] w-[520px] h-[520px]
                   rounded-full bg-[#f97316]/30 blur-[180px] opacity-80
                   mix-blend-screen"
      />
    </div>
  );
};

export default ProBackground;
