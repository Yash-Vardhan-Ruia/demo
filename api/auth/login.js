import { signIn } from "../../backend/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { email, password } = req.body;
    const { session, user } = await signIn(email, password);
    return res.status(200).json({ message: "Logged in", data: { session, user } });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
