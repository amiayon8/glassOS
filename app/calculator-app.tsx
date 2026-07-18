"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { evaluate } from "mathjs";

const MAX_DISPLAY = 12;

function formatResult(val: any): string {
  if (typeof val === "number" || typeof val === "bigint") {
    const n = Number(val);
    if (!isFinite(n)) return "Error";
    // Round to avoid floating point noise (e.g., 0.1 + 0.2)
    const rounded = parseFloat(n.toPrecision(10));
    const s = String(rounded);
    if (s.replace(".", "").replace("-", "").length > MAX_DISPLAY) {
      return rounded.toExponential(4);
    }
    return s;
  }
  return String(val);
}

function autoCloseParens(expr: string): string {
  let open = 0;
  for (const ch of expr) {
    if (ch === "(") open++;
    else if (ch === ")") open--;
  }
  return expr + ")".repeat(Math.max(0, open));
}

function fixExpression(expr: string, isDeg: boolean): string {
  let e = expr;

  // Replace display symbols
  e = e.replace(/×/g, "*");
  e = e.replace(/÷/g, "/");
  e = e.replace(/π/g, "pi");
  e = e.replace(/√\(/g, "sqrt(");
  e = e.replace(/∛\(/g, "cbrt(");
  e = e.replace(/\^2/g, "^2");

  // Factorial: convert "5!" to "factorial(5)"
  e = e.replace(/([0-9.]+)!/g, "factorial($1)");

  // ln -> log, log -> log10 (mathjs conventions)
  e = e.replace(/\bln\(/g, "log(");
  e = e.replace(/\blog\(/g, "log10(");

  // Degree conversion for trig arguments
  if (isDeg) {
    // Forward trig wrap
    e = e.replace(/\bsin\(/g, "sin((pi/180)*");
    e = e.replace(/\bcos\(/g, "cos((pi/180)*");
    e = e.replace(/\btan\(/g, "tan((pi/180)*");

    // Inverse trig wrap
    e = e.replace(/\basin\(/g, "(180/pi)*asin(");
    e = e.replace(/\bacos\(/g, "(180/pi)*acos(");
    e = e.replace(/\batan\(/g, "(180/pi)*atan(");
  }

  // Auto-close open parentheses
  e = autoCloseParens(e);

  return e;
}

interface ButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const CalcButton: React.FC<ButtonProps> = ({ label, onClick, className = "" }) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.pointerEvents = "none";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.style.background = "rgba(255, 255, 255, 0.25)";
    ripple.style.transform = "scale(0)";
    ripple.style.opacity = "1";
    ripple.style.transition = "transform 0.4s ease-out, opacity 0.4s ease-out";

    btn.appendChild(ripple);

    requestAnimationFrame(() => {
      ripple.style.transform = "scale(2.5)";
      ripple.style.opacity = "0";
    });

    setTimeout(() => {
      ripple.remove();
    }, 400);
  };

  return (
    <button
      className={`calc-btn relative overflow-hidden select-none outline-none ${className}`}
      onClick={onClick}
      onMouseDown={handleMouseDown}
    >
      {label}
    </button>
  );
};

export default function CalculatorApp() {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState("");
  const [memory, setMemory] = useState(0);
  const [isDeg, setIsDeg] = useState(true);
  const [isError, setIsError] = useState(false);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [gridMode, setGridMode] = useState<"standard" | "scientific" | "both">("standard");

  const clear = useCallback(() => {
    setExpr("");
    setDisplay("0");
    setHistory("");
    setIsError(false);
    setJustEvaluated(false);
  }, []);

  const backspace = useCallback(() => {
    if (justEvaluated) {
      clear();
      return;
    }
    setExpr((e) => {
      const next = e.slice(0, -1);
      setDisplay(next || "0");
      return next;
    });
    setIsError(false);
  }, [justEvaluated, clear]);

  const input = useCallback(
    (val: string) => {
      setIsError(false);
      setExpr((prev) => {
        let next = prev;
        if (justEvaluated) {
          const isOp = ["+", "-", "×", "÷", "^"].includes(val);
          next = isOp ? display : "";
          setJustEvaluated(false);
        }
        next = next + val;
        setDisplay(next);
        return next;
      });
    },
    [justEvaluated, display]
  );

  const negate = useCallback(() => {
    setExpr((prev) => {
      if (!prev || prev === "0") return prev;
      const next = prev.startsWith("-") ? prev.slice(1) : "-" + prev;
      setDisplay(next);
      return next;
    });
  }, []);

  const percent = useCallback(() => {
    setExpr((prev) => {
      try {
        const val = Number(evaluate(fixExpression(prev, isDeg))) / 100;
        const s = formatResult(val);
        setDisplay(s);
        return s;
      } catch {
        return prev;
      }
    });
  }, [isDeg]);

  const calculate = useCallback(() => {
    if (!expr) return;
    try {
      const fixed = fixExpression(expr, isDeg);
      const result = evaluate(fixed);
      const formatted = formatResult(result);
      if (formatted === "Error") throw new Error();
      setHistory(expr + " =");
      setDisplay(formatted);
      setExpr(formatted);
      setJustEvaluated(true);
      setIsError(false);
    } catch {
      setDisplay("Error");
      setIsError(true);
      setJustEvaluated(false);
    }
  }, [expr, isDeg]);

  const memAdd = useCallback(() => {
    try {
      setMemory((m) => m + (parseFloat(display) || 0));
    } catch {}
  }, [display]);

  const memSub = useCallback(() => {
    try {
      setMemory((m) => m - (parseFloat(display) || 0));
    } catch {}
  }, [display]);

  const memRecall = useCallback(() => {
    const s = formatResult(memory);
    setDisplay(s);
    setExpr(s);
    setJustEvaluated(false);
  }, [memory]);

  const memClear = useCallback(() => setMemory(0), []);

  // Standard Button configuration
  const stdRows = [
    [
      { l: "AC", cls: "accent", fn: clear },
      { l: "+/-", cls: "accent", fn: negate },
      { l: "%", cls: "accent", fn: percent },
      { l: "÷", cls: "operator", fn: () => input("÷") },
    ],
    [
      { l: "7", fn: () => input("7") },
      { l: "8", fn: () => input("8") },
      { l: "9", fn: () => input("9") },
      { l: "×", cls: "operator", fn: () => input("×") },
    ],
    [
      { l: "4", fn: () => input("4") },
      { l: "5", fn: () => input("5") },
      { l: "6", fn: () => input("6") },
      { l: "-", cls: "operator", fn: () => input("-") },
    ],
    [
      { l: "1", fn: () => input("1") },
      { l: "2", fn: () => input("2") },
      { l: "3", fn: () => input("3") },
      { l: "+", cls: "operator", fn: () => input("+") },
    ],
    [
      { l: "0", cls: "wide", fn: () => input("0") },
      { l: ".", fn: () => input(".") },
      { l: "⌫", fn: backspace },
      { l: "=", cls: "equals", fn: calculate },
    ],
  ];

  // Scientific Button configuration
  const sciRows = [
    [
      { l: "sin", cls: "sci", fn: () => input("sin(") },
      { l: "cos", cls: "sci", fn: () => input("cos(") },
      { l: "tan", cls: "sci", fn: () => input("tan(") },
      { l: isDeg ? "DEG" : "RAD", cls: "sci accent active-toggle", fn: () => setIsDeg((d) => !d) },
    ],
    [
      { l: "asin", cls: "sci", fn: () => input("asin(") },
      { l: "acos", cls: "sci", fn: () => input("acos(") },
      { l: "atan", cls: "sci", fn: () => input("atan(") },
      { l: "n!", cls: "sci", fn: () => input("!") },
    ],
    [
      { l: "log", cls: "sci", fn: () => input("log(") },
      { l: "ln", cls: "sci", fn: () => input("ln(") },
      { l: "x²", cls: "sci", fn: () => input("^2") },
      { l: "√", cls: "sci", fn: () => input("√(") },
    ],
    [
      { l: "xⁿ", cls: "sci", fn: () => input("^") },
      { l: "∛", cls: "sci", fn: () => input("∛(") },
      { l: "π", cls: "sci", fn: () => input("π") },
      { l: "e", cls: "sci", fn: () => input("e") },
    ],
    [
      { l: "(", cls: "sci", fn: () => input("(") },
      { l: ")", cls: "sci", fn: () => input(")") },
      { l: "MR", cls: "sci", fn: memRecall },
      { l: "MC", cls: "sci", fn: memClear },
    ],
    [
      { l: "M+", cls: "sci", fn: memAdd },
      { l: "M-", cls: "sci", fn: memSub },
      { l: "AC", cls: "sci accent", fn: clear },
      { l: "⌫", cls: "sci", fn: backspace },
    ],
  ];

  // Adjust calculator width/state in host OS based on mode
  useEffect(() => {
    const event = new CustomEvent("calculatorModeChange", { detail: { mode: gridMode } });
    window.dispatchEvent(event);
  }, [gridMode]);

  return (
    <div className={`calculator-container h-full flex flex-col p-4 text-white overflow-y-auto no-scrollbar`}>
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap shrink-0">
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full p-1 text-xs font-semibold">
          <span className="px-2 py-0.5 text-zinc-300">Memory:</span>
          <span className="px-2 py-0.5 bg-white/10 text-white rounded-full font-mono">
            {formatResult(memory)}
          </span>
        </div>
        <div className="mode-tabs flex bg-black/30 border border-white/5 p-1 rounded-xl">
          {(["standard", "scientific", "both"] as const).map((m) => (
            <button
              key={m}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize select-none cursor-pointer ${
                gridMode === m
                  ? "bg-white/10 text-white shadow-sm border border-white/10"
                  : "text-zinc-400 hover:text-zinc-200"
              } ${m === "both" ? "hidden md:inline-block" : ""}`}
              onClick={() => setGridMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Display Panel */}
      <div className={`display-panel flex flex-col justify-end items-end p-4 mb-4 min-h-[96px] bg-black/25 border border-white/10 rounded-2xl shadow-inner relative overflow-hidden select-all shrink-0 ${isError ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : ""}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
        <div className="display-expr text-sm text-zinc-400 min-h-[20px] select-none break-all text-right w-full">
          {history}
        </div>
        <div className="display-value text-3xl sm:text-4xl font-light text-zinc-100 mt-1 tracking-tight break-all text-right w-full">
          {display}
        </div>
      </div>

      {/* Button Layouts */}
      <div className="flex-1 flex flex-col justify-center">
        {gridMode === "both" ? (
          <div className="flex flex-row gap-4 items-stretch h-full w-full">
            {/* Scientific Section */}
            <div className="grid grid-cols-4 gap-2 flex-1 items-center">
              {sciRows.flat().map((b, i) => (
                <CalcButton
                  key={`sci-${i}`}
                  label={b.l}
                  onClick={b.fn}
                  className={b.cls || ""}
                />
              ))}
            </div>
            {/* Divider */}
            <div className="w-px bg-white/10 self-stretch rounded-full" />
            {/* Standard Section */}
            <div className="grid grid-cols-4 gap-2 flex-1 items-center">
              {stdRows.flat().map((b, i) => (
                <CalcButton
                  key={`std-${i}`}
                  label={b.l}
                  onClick={b.fn}
                  className={`${b.cls || ""} ${b.l === "=" ? "equals-btn" : ""}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-4 gap-2 h-full items-center ${gridMode === "scientific" ? "scientific-grid" : ""}`}>
            {(gridMode === "scientific" ? sciRows.flat() : stdRows.flat()).map((b, i) => (
              <CalcButton
                key={`btn-${i}`}
                label={b.l}
                onClick={b.fn}
                className={`${b.cls || ""} ${b.l === "=" ? "equals-btn" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
