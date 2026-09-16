import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.nextUrl.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", request.nextUrl.origin)
    );
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = new URL("/api/auth/google/callback", request.nextUrl.origin).toString();

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/login?error=missing_credentials", request.nextUrl.origin)
    );
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.id_token) {
      return NextResponse.redirect(
        new URL("/login?error=no_token", request.nextUrl.origin)
      );
    }

    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const userInfo = await userInfoResponse.json();

    if (!userInfo.email) {
      return NextResponse.redirect(
        new URL("/login?error=no_email", request.nextUrl.origin)
      );
    }

    const email = userInfo.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.redirect(
        new URL(
          `/login?error=user_not_found&email=${encodeURIComponent(email)}`,
          request.nextUrl.origin
        )
      );
    }

    if (!user.active) {
      return NextResponse.redirect(
        new URL("/login?error=user_inactive", request.nextUrl.origin)
      );
    }

    await createSession(user.id);

    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", request.nextUrl.origin)
    );
  }
}
