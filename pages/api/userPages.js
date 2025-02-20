import { supabase } from "../../backend/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }
    const { data, error } = await supabase
      .from("api.user_pages")
      .select("pages")
      .eq("user_id", user_id)
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
      return res.status(200).json({ pages: [] });
    }
    return res.status(200).json({ pages: data.pages });
  } else if (req.method === "POST" || req.method === "PUT") {
    const { user_id, pages } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id" });
    }
    const { data, error } = await supabase
      .from("api.user_pages")
      .upsert({ user_id, pages });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ message: "User pages saved", data });
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
