import { NextResponse } from "next/server";
import { signUp } from "../../../../backend/auth";

export async function POST(req) {
  try {
    const { email, password, firstName, lastName } = await req.json();
    const user = await signUp(email, password, firstName, lastName);
    return NextResponse.json({ message: "User registered", user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
