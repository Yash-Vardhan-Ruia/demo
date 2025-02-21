import { NextResponse } from "next/server";
import { signInWithGitHub } from "../../../../backend/auth";

// Remove any default export; only export named HTTP methods.
export async function GET(req) {
  try {
    const data = await signInWithGitHub();
    if (data?.url) {
      return NextResponse.redirect(data.url);
    }
    return NextResponse.json({ error: "No redirect URL provided" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
