"use client"

import { useState, useEffect } from "react"
import { Icon } from "@iconify/react"
import { hackaTimeCheck, hackaTimeLogout } from "./hackatime"

export function HackaTimeWidget() {
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const checkUser = async () => {
        setIsLoading(true)
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
            const res = await hackaTimeCheck(tz)
            if (res.success && res.user) {
                setUser(res.user)
            } else {
                setUser(null)
            }
        } catch (err) {
            console.error("Failed to check HackaTime user status:", err)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        checkUser()
    }, [])

    function login() {
        const state = crypto.randomUUID()
        sessionStorage.setItem("oauth_state", state)

        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_HACKATIME_CLIENT_ID!,
            redirect_uri: process.env.NEXT_PUBLIC_HACKATIME_CALLBACK_URL!,
            response_type: "code",
            scope: "profile read",
            state,
        })

        window.location.href = `https://hackatime.hackclub.com/oauth/authorize?${params}`
    }

    const handleLogout = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsLoading(true)
        try {
            await hackaTimeLogout()
            setUser(null)
        } catch (err) {
            console.error("Failed to log out of HackaTime:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}h ${minutes}m`
    }

    if (isLoading) {
        return (
            <div className="group flex flex-col justify-between bg-white/5 shadow-xl backdrop-blur-md p-3.5 border border-white/10 rounded-3xl w-60 h-32 select-none">
                {/* Profile Row Shimmer */}
                <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="shimmer rounded-full size-7 shrink-0 animate-pulse" />
                        <div className="min-w-0 flex-1 flex flex-col gap-1">
                            <div className="shimmer rounded w-2/3 h-3 animate-pulse" />
                            <div className="shimmer rounded w-1/2 h-2 animate-pulse" />
                        </div>
                    </div>
                    <div className="shimmer rounded-full size-5 shrink-0 animate-pulse" />
                </div>

                {/* Stats Row Shimmer */}
                <div className="flex justify-between items-center mt-1">
                    <div className="flex flex-col gap-1 w-1/3">
                        <div className="shimmer rounded w-3/4 h-2.5 animate-pulse" />
                        <div className="shimmer rounded w-1/2 h-2 animate-pulse" />
                    </div>
                    <div className="flex flex-col gap-1 w-1/3 items-end">
                        <div className="shimmer rounded w-3/4 h-2.5 animate-pulse" />
                        <div className="shimmer rounded w-1/2 h-2 animate-pulse" />
                    </div>
                </div>

                {/* Bars Shimmer */}
                <div className="flex justify-around items-end gap-1.5 h-8 mt-1.5">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 w-full h-full justify-end">
                            <div className="shimmer rounded-t-[1.5px] w-full" style={{ height: `${[50, 75, 30, 90, 60, 45, 80][i]}%` }} />
                            <div className="shimmer rounded w-3 h-1.5" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (user) {
        const weeklyData = user.stats?.week || []
        const maxWeeklyTime = weeklyData.length > 0 ? Math.max(...weeklyData.map((d: any) => d.total)) : 1
        const days = ["S", "M", "T", "W", "T", "F", "S"]

        return (
            <div className="group flex flex-col justify-between bg-white/5 hover:bg-white/10 shadow-xl backdrop-blur-md p-3.5 border border-white/10 hover:border-white/20 rounded-3xl w-60 h-32 transition-all cursor-default select-none">
                {/* Header Row */}
                <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.username}
                                className="border border-white/20 rounded-full size-7 shrink-0"
                            />
                        ) : (
                            <div className="flex justify-center items-center bg-white/10 border border-white/20 rounded-full size-7 shrink-0 text-white/60">
                                <Icon icon="solar:user-bold" className="size-4" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-xs truncate leading-none">
                                {user.username}
                            </h3>
                            <p className="mt-0.5 text-[8.5px] text-white/40 truncate leading-none">
                                HackaTime Stats
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={handleLogout}
                            title="Disconnect HackaTime"
                            className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-all p-0.5 cursor-pointer"
                        >
                            <Icon icon="solar:logout-3-bold" className="size-3.5" />
                        </button>
                        <Icon icon="logos:hack-club" className="size-5" />
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between items-center mt-1">
                    <div>
                        <span className="block text-white/40 text-[9px] leading-none">Total Time</span>
                        <span className="font-semibold text-white text-xs mt-0.5 block leading-none">
                            {formatTime(user.stats?.total || 0)}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="block text-white/40 text-[9px] leading-none">Today</span>
                        <span className="font-semibold text-white text-xs mt-0.5 block leading-none">
                            {formatTime(user.stats?.today || 0)}
                        </span>
                    </div>
                </div>

                {/* Bar Chart (Vibrant Green Bars) */}
                <div className="flex justify-around items-end gap-1 h-9 mt-1">
                    {weeklyData.map((day: any, i: number) => {
                        const dateObj = new Date(day.date + 'T00:00:00') // Force local parsing of the date string
                        const dayLabel = days[dateObj.getDay()]
                        return (
                            <div key={i} className="flex flex-col items-center gap-0.5 w-full h-full justify-end group/bar">
                                <div
                                    className="bg-[#d7ff6a]/60 hover:bg-[#d7ff6a] rounded-t-[1.5px] w-full transition-all duration-200 cursor-help"
                                    style={{ height: `${maxWeeklyTime > 0 ? (day.total / maxWeeklyTime) * 100 : 0}%`, minHeight: day.total > 0 ? '2px' : '0px' }}
                                    title={`${formatTime(day.total)} on ${dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`}
                                />
                                <span className="font-bold text-[8px] text-white/30">{dayLabel}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div
            onClick={login}
            className="group flex flex-col justify-between bg-white/5 hover:bg-white/10 shadow-xl backdrop-blur-md p-4 border border-white/10 hover:border-white/20 rounded-3xl w-60 h-32 transition-all cursor-pointer select-none"
        >
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-xs">My HackaTime</h3>
                <Icon icon="logos:hack-club" className="size-5" />
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center px-1">
                <p className="text-[10px] text-white/50 leading-snug">
                    Connect your account to display your live coding stats.
                </p>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation()
                    login()
                }}
                className="bg-[#d7ff6a] py-1.5 rounded-2xl w-full font-bold text-black text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
                Connect Account
            </button>
        </div>
    )
}