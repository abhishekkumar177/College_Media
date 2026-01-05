import { useEffect, useRef } from "react";
import gsap from "gsap";

const ScrollFloat = ({ children }) => {
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 }
    );
  }, []);

  return <div ref={ref}>{children}</div>;
};

export default ScrollFloat;
