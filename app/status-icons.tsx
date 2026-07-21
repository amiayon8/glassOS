"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

type Props = {
    battery: number;
    charging?: boolean;
    wifiStrength: 0 | 1 | 2 | 3 | 4;
    online: boolean;
};

export default function StatusIcons({
    battery,
    charging = false,
    wifiStrength,
    online,
}: Props) {
    const [showBattery, setShowBattery] = useState(false);
    const batteryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                batteryRef.current &&
                !batteryRef.current.contains(e.target as Node)
            ) {
                setShowBattery(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const rounded = Math.min(100, Math.max(10, Math.ceil(battery / 10) * 10));

    const batteryIcon = charging
        ? `mdi:battery-charging-${rounded}`
        : battery <= 5
            ? "mdi:battery-alert"
            : rounded === 100
                ? "mdi:battery"
                : `mdi:battery-${rounded}`;

    const wifiIcon = online
        ? `mdi:wifi-strength-${wifiStrength}`
        : "mdi:wifi-off";

    return (
        <div className="flex items-center gap-1">
            <button
                className="group relative hover:bg-white/[0.08] p-1.5 rounded-md active:scale-95 transition-all duration-150"
                title={online ? "Connected" : "Offline"}
            >
                <Icon
                    icon={wifiIcon}
                    width={17}
                    className="text-neutral-400 group-hover:text-white transition-colors"
                />
            </button>

            <div ref={batteryRef} className="relative">
                <button
                    onClick={() => setShowBattery((v) => !v)}
                    className="group hover:bg-white/[0.08] p-1.5 rounded-md active:scale-95 transition-all duration-150"
                >
                    <Icon
                        icon={batteryIcon}
                        width={17}
                        className={`transition-colors ${battery <= 15
                            ? "text-red-400"
                            : charging
                                ? "text-emerald-400"
                                : "text-neutral-400 group-hover:text-white"
                            }`}
                    />
                </button>

                <div
                    className={`
                        absolute right-0 top-full mt-2 w-64
                        rounded-xl border border-white/10
                        bg-zinc-950/90 backdrop-blur-xl shadow-2xl

                        origin-top-right
                        transition-all duration-180 ease-out

                        ${showBattery
                            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                        }
                    `}
                >
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                                Battery
                            </span>
                            <span className="font-mono text-neutral-200 text-xs">
                                {battery}%
                            </span>
                        </div>

                        <div className="bg-white/10 rounded-full h-1.5 overflow-hidden mb-4">
                            <div
                                className={`h-full transition-all duration-300 ${battery <= 15
                                    ? "bg-red-400"
                                    : charging
                                        ? "bg-emerald-400"
                                        : "bg-white"
                                    }`}
                                style={{ width: `${battery}%` }}
                            />
                        </div>

                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Power Source</span>
                                <span className="text-neutral-200 font-medium">
                                    {charging ? "Power Adapter" : "Battery"}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-neutral-400">Health</span>
                                <span className="text-emerald-400 font-medium">Normal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}