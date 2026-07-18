"use client";

import { useState } from "react";

export default function WelcomePrompt() {
  const [show, setShow] = useState(true);

  async function openFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      setShow(false);
    } catch (err) {
      console.error(err);
    }
  }

  function close() {
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="z-9998 fixed inset-0 flex justify-center items-center bg-black/20 backdrop-blur-md">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white/8 shadow-[0_20px_80px_rgba(0,0,0,.45)] backdrop-blur-3xl border border-white/15 rounded-[28px] w-120 max-w-[calc(100vw-2rem)] overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent" />
        </div>

        <div className="relative flex flex-col p-8 min-h-65">
          <h2 className="font-light text-white text-3xl">
            Welcome
          </h2>

          <p className="mt-4 text-white/70">
            This website is best experienced in fullscreen mode.
          </p>

          <div className="flex gap-3 mt-auto pt-8">
            <button
              onClick={openFullscreen}
              className="bg-white px-5 py-2 rounded-full font-medium text-black hover:scale-105 transition"
            >
              Enter Fullscreen
            </button>

            <button
              onClick={close}
              className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-white transition"
            >
              Continue Without Fullscreen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}