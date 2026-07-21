"use client";

import { useState, useEffect } from "react";

export default function DateTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  return (
    <div className="flex items-center gap-2 font-mono text-xs text-neutral-300">
      <span className="font-semibold text-white">
        {new Intl.DateTimeFormat(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }).format(now)}
      </span>
      <span className="text-neutral-500">•</span>
      <span className="text-neutral-400">
        {new Intl.DateTimeFormat(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }).format(now)}
      </span>
    </div>
  );
}