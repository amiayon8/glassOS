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
                className="group relative hover:bg-white/10 p-1.5 rounded-lg active:scale-95 transition-all"
                title={online ? "Connected" : "Offline"}
            >
                <Icon
                    icon={wifiIcon}
                    width={19}
                    className="text-white/70 group-hover:text-white transition-colors"
                />
            </button>

            <div ref={batteryRef} className="relative">
                <button
                    onClick={() => setShowBattery((v) => !v)}
                    className="group hover:bg-white/10 p-1.5 rounded-lg active:scale-95 transition-all"
                >
                    <Icon
                        icon={batteryIcon}
                        width={19}
                        className={`transition-colors ${battery <= 15
                            ? "text-red-400"
                            : charging
                                ? "text-green-400"
                                : "text-white/70 group-hover:text-white"
                            }`}
                    />
                </button>

                <div
                    className={`
                        absolute right-0 top-full mt-2 w-72
                        rounded-2xl border border-white/15
                        bg-black/30 backdrop-blur-2xl shadow-2xl

                        origin-top-right
                        transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)]

                        ${showBattery
                            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                        }
                    `}
                >
                    <div className="p-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-white">
                                Battery
                            </span>

                            <span className="font-bold text-white text-xl">
                                {battery}%
                            </span>
                        </div>

                        <div className="bg-white/10 mt-3 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${battery <= 15
                                    ? "bg-red-400"
                                    : charging
                                        ? "bg-green-400"
                                        : "bg-white"
                                    }`}
                                style={{ width: `${battery}%` }}
                            />
                        </div>

                        <div className="space-y-2 mt-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-white/60">Status</span>
                                <span className="text-white">
                                    {charging ? "Charging" : "On battery"}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-white/60">Battery Level</span>
                                <span className="text-white">{battery}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}