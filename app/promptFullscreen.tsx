"use client";

import { useEffect, useState } from "react";

export default function WelcomePrompt() {
    const [show, setShow] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        if (localStorage.getItem("welcome-popup")) return;

        const timer = setTimeout(() => setShow(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    function close() {
        localStorage.setItem("welcome-popup", "1");
        setShow(false);
    }

    return (
        <>
            {fullscreen && (
                <div
                    className="z-9998 fixed inset-0 bg-white/10 backdrop-blur-3xl"
                    onClick={close}
                />
            )}

            <div
                className={[
                    "fixed z-9999 overflow-hidden",
                    "border border-white/20",
                    "bg-white/8",
                    "backdrop-blur-2xl",
                    "shadow-[0_25px_80px_rgba(0,0,0,0.45)]",
                    "transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]",

                    fullscreen
                        ? "left-1/2 top-1/2 h-[90vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-[42px]"
                        : "bottom-8 right-8 w-90 rounded-3xl",
                ].join(" ")}
            >
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-linear-to-br from-white/25 via-white/5 to-transparent" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
                </div>

                <div className="relative flex flex-col p-8 h-full">
                    <h2 className="font-light text-white text-3xl tracking-tight">
                        Welcome
                    </h2>

                    <p className="mt-4 max-w-xl text-white/75">
                        This website provides an immersive experience. You can continue
                        normally or open this prompt in fullscreen.
                    </p>

                    <div className="flex gap-3 mt-auto">
                        {!fullscreen && (
                            <button
                                onClick={() => setFullscreen(true)}
                                className="bg-white/15 hover:bg-white/20 backdrop-blur-xl px-5 py-2 rounded-full text-white transition"
                            >
                                Open Fullscreen
                            </button>
                        )}

                        <button
                            onClick={close}
                            className="bg-white px-5 py-2 rounded-full font-medium text-black hover:scale-105 transition"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
