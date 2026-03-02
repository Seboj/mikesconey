import { Router } from "express";
import { getContent } from "../services/content.service.js";

export const contentRouter = Router();

const VALID_KEYS = ["menu", "hours", "faq", "reviews", "site_info", "gallery", "specials"];

contentRouter.get("/:key", async (req, res) => {
  const { key } = req.params;

  if (!VALID_KEYS.includes(key)) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  const value = await getContent(key);
  if (value === null) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  res.json(value);
});
