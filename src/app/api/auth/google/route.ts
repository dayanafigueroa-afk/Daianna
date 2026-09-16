import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const redirectUri = new URL("/api/auth/google/callback", request.nextUrl.origin).toString();
  const scope = encodeURIComponent("openid profile email");
  const state = Buffer.from(JSON.stringify({ nonce: Date.now() })).toString("base64");

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.append("client_id", clientId || "");
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("scope", scope);
  authUrl.searchParams.append("state", state);

  return NextResponse.redirect(authUrl);
}
