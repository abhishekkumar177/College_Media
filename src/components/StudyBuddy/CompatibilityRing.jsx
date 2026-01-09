import { useEffect, useState } from "react";

const CompatibilityRing = ({ value }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer = setInterval(() => {
      setProgress((p) => (p < value ? p + 1 : p));
    }, 10);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="ring">
      <span>{progress}%</span>
    </div>
  );
};

export default CompatibilityRing;
