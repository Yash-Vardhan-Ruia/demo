import { NextResponse } from "next/server";
import { signIn } from "../../../../backend/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const { session, user } = await signIn(email, password);
    return NextResponse.json({ message: "Logged in", data: { session, user } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
