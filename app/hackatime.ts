"use server"

import { cookies } from "next/headers";

export async function hackaTimeCheck(timezone: string = "UTC") {
    const cookieStore = await cookies();
    const token = cookieStore.get("hackatime_token");

    if (!token) {
        return { success: false, error: 'Please connect your HackaTime Account' };
    }

    try {
        // 1. Fetch user info
        const meRes = await fetch(
            "https://hackatime.hackclub.com/api/v1/authenticated/me",
            {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
                cache: "no-store",
            }
        );
        if (meRes.status === 401) {
            return { success: false, error: 'Please connect your HackaTime Account' };
        }
        if (!meRes.ok) {
            return { success: false, error: 'Internal server error' };
        }
        const meData = await meRes.json();

        // 2. Fetch total hours (all time)
        const totalRes = await fetch(
            "https://hackatime.hackclub.com/api/v1/authenticated/hours?start_date=2015-01-01",
            {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
                cache: "no-store",
            }
        );
        let totalSeconds = 0;
        if (totalRes.ok) {
            const totalData = await totalRes.json();
            totalSeconds = totalData.total_seconds || 0;
        }

        // 3. Generate last 7 days in the user's timezone
        const dates: string[] = [];
        const now = new Date();
        
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const parts = formatter.formatToParts(d);
            const year = parts.find(p => p.type === "year")?.value;
            const month = parts.find(p => p.type === "month")?.value;
            const day = parts.find(p => p.type === "day")?.value;
            dates.push(`${year}-${month}-${day}`);
        }

        // 4. Fetch daily hours for the last 7 days in parallel
        const dailyPromises = dates.map(async (date) => {
            try {
                const res = await fetch(
                    `https://hackatime.hackclub.com/api/v1/authenticated/hours?start_date=${date}&end_date=${date}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token.value}`,
                        },
                        cache: "no-store",
                    }
                );
                if (!res.ok) {
                    return { date, total: 0 };
                }
                const data = await res.json();
                return { date, total: data.total_seconds || 0 };
            } catch (err) {
                return { date, total: 0 };
            }
        });

        const weeklyData = await Promise.all(dailyPromises);
        const todaySeconds = weeklyData[weeklyData.length - 1]?.total || 0;

        const username = meData.github_username || meData.slack_id || (meData.emails && meData.emails[0] ? meData.emails[0].split('@')[0] : "Coder");
        const avatar = meData.github_username ? `https://github.com/${meData.github_username}.png` : null;

        return {
            success: true,
            user: {
                username,
                avatar,
                emails: meData.emails,
                stats: {
                    total: totalSeconds,
                    today: todaySeconds,
                    week: weeklyData,
                }
            }
        };
    } catch (err) {
        console.error("HackaTime Check Error:", err);
        return { success: false, error: 'Internal server error' };
    }
}

export async function hackaTimeLogout() {
    const cookieStore = await cookies();
    const token = cookieStore.get("hackatime_token")

    if (!token) return { success: true, message: "Already Logged Out" }

    cookieStore.delete("hackatime_token");

    return { success: true, message: "Logged Out Successfully" }
}