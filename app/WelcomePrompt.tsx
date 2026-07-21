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
      setShow(false);
    }
  }

  function close() {
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="z-[9998] fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-7 flex flex-col"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">GlassOS</span>
        </div>

        <h2 className="text-xl font-medium tracking-tight text-white mb-2">
          Welcome to GlassOS
        </h2>

        <p className="text-xs leading-relaxed text-neutral-400 mb-6">
          Open in fullscreen for the best desktop experience.
        </p>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openFullscreen}
            className="flex-1 bg-white text-zinc-950 hover:bg-neutral-200 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.98]"
          >
            Enter Fullscreen
          </button>

          <button
            onClick={close}
            className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg text-xs font-medium text-neutral-300 transition-all duration-150 active:scale-[0.98]"
          >
            Continue in Window
          </button>
        </div>
      </div>
    </div>
  );
}