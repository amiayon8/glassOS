"use client";

import { useEffect, useState } from "react";

export default function MainClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) return <div className="h-20" />;

  return (
    <div className="flex flex-col items-center select-none">
      <h1 className="font-light text-6xl sm:text-7xl tracking-tighter text-white/90 drop-shadow-md">
        {time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </h1>
      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-white/50">
        {time.toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
