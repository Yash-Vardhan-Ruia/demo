import { signInWithGitHub } from "../../backend/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const data = await signInWithGitHub();
    // Supabase should return data.url to redirect the user.
    if (data?.url) {
      return res.redirect(data.url);
    }
    return res.status(400).json({ error: "No redirect URL provided" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
