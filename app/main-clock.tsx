"use client";

import { useEffect, useState } from "react";

export default function MainClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="text-shadow-lg text-8xl text-white leading-none">
      {time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </h1>
  );
}
