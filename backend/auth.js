import { supabase } from "./supabaseClient";

// Sign up a new user
export async function signUp(email, password, firstName, lastName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { firstName, lastName, display_name: `${firstName} ${lastName}` } }
  });

  if (error) throw error;
  const user = data?.user;

  if (user) {
    // Insert profile data into api.profiles table
    const { error: profileError } = await supabase
      .from("api.profiles")
      .insert({ id: user.id, email, firstName, lastName });

    if (profileError) {
      console.warn("Profile insert error:", profileError);
    }
  }
  return user;
}

// Sign in an existing user.
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const { session, user } = data;
  if (!user) throw new Error("User not found.");

  // Check if email is verified
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  if (!userData?.user?.email_confirmed_at) {
    throw new Error("Please verify your email before logging in.");
  }

  return { session, user };
}

// Sign in with GitHub.
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL || "https://localhost:3000/dashboard"
    }
  });
  if (error) throw error;
  return data;
}

// Sign out the current user.
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session.
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data;
}

// Update user profile in api.profiles
export async function updateProfile(userId, { email, firstName, lastName }) {
  const { error } = await supabase
    .from("api.profiles")
    .update({ email, firstName, lastName })
    .eq("id", userId);

  if (error) throw error;
}
