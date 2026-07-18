"use client"

import { useState, useEffect } from "react"

export default function DateTime() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <span className="font-semibold text-[15px] text-white tracking-[-0.01em]">
                {new Intl.DateTimeFormat(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                }).format(now)}
            </span>

            <span className="mt-0.5 font-medium text-[11px] text-white/60 tracking-wide">
                {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "short",
                }).format(now)}
            </span>
        </>
    )
}