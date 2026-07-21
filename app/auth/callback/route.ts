import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json(
            { status: "error", message: "Missing code" },
            { status: 400 }
        );
    }

    const tokenRes = await fetch(
        "https://hackatime.hackclub.com/oauth/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.NEXT_PUBLIC_HACKATIME_CLIENT_ID!,
                client_secret: process.env.HACKATIME_CLIENT_SECRET!,
                code,
                redirect_uri: process.env.NEXT_PUBLIC_HACKATIME_CALLBACK_URL!,
                grant_type: "authorization_code",
            }),
        }
    );

    if (!tokenRes.ok) {
        console.log(await tokenRes.text())
        return NextResponse.json(
            { status: "error", message: "OAuth failed" },
            { status: 400 }
        );
    }

    const token = await tokenRes.json();

    const userRes = await fetch(
        "https://hackatime.hackclub.com/api/v1/authenticated/me",
        {
            headers: {
                Authorization: `Bearer ${token.access_token}`,
            },
        }
    );

    if (!userRes.ok) {
        return NextResponse.json(
            { status: "error", message: "Failed to fetch user" },
            { status: 400 }
        );
    }

    const response = NextResponse.redirect(
        new URL("/", process.env.NEXT_PUBLIC_APP_URL!)
    );

    response.cookies.set("hackatime_token", token.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: token.expires_in ?? 60 * 60 * 24 * 30,
    });

    return response;
}