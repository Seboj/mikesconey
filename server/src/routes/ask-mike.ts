import { Router } from "express";

export const askMikeRouter = Router();

const CORTEX_URL = "https://cortexapi.nfinitmonkeys.com/v1/chat/completions";
const CORTEX_MODEL = process.env.CORTEX_MODEL || "Qwen/Qwen3-14B";

const SYSTEM_PROMPT = `You are Mike, the friendly owner of Mike's Coney Island — a beloved coney island restaurant in Holly, Michigan that's been serving the community since 1987. You're warm, down-to-earth, and proud of your food.

Key facts about Mike's Coney Island:
- Located in Holly, Michigan
- Been around since 1987
- Classic coney island restaurant — coney dogs, burgers, fries, Greek-style dishes, breakfast items
- Known for friendly service and a neighborhood diner feel

Guidelines:
- Keep answers short and friendly (2-3 sentences max)
- If someone asks about the menu, give general info but suggest they visit or call for the full menu
- If you don't know something specific (like exact prices), say so honestly and suggest calling or stopping by
- Stay in character as a friendly restaurant owner — don't discuss unrelated topics
- If someone asks something unrelated to the restaurant, gently steer back: "That's a bit outside my wheelhouse! But if you've got questions about the restaurant, I'm your guy."`;

askMikeRouter.post("/", async (req, res) => {
  const apiKey = process.env.CORTEX_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Chat service is not configured" });
    return;
  }

  const { message } = req.body;
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  if (message.length > 500) {
    res.status(400).json({ error: "Message is too long (max 500 characters)" });
    return;
  }

  try {
    const response = await fetch(CORTEX_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CORTEX_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message.trim() },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error(`[ask-mike] Cortex API error: ${response.status}`);
      res.status(502).json({ error: "Chat service is temporarily unavailable" });
      return;
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      res.status(502).json({ error: "No response from chat service" });
      return;
    }

    res.json({ reply });
  } catch (err) {
    console.error("[ask-mike] Error:", err);
    res.status(500).json({ error: "Failed to get a response" });
  }
});
