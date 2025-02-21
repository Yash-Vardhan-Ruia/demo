import { signUp } from "../../backend/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const { email, password, firstName, lastName } = req.body;
    const user = await signUp(email, password, firstName, lastName);
    return res.status(200).json({ message: "User registered", user });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
