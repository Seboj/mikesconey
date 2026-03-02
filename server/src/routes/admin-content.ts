import { Router } from "express";
import { z } from "zod";
import {
  getContent,
  updateContent,
} from "../services/content.service.js";

export const adminContentRouter = Router();

// Zod schemas per content key

const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.string().min(1),
  tags: z.array(z.string()),
});

const menuSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string(),
      items: z.array(menuItemSchema),
    })
  ),
});

const hoursSchema = z.array(
  z.object({
    day: z.string().min(1),
    open: z.string(),
    close: z.string(),
    closed: z.boolean().optional(),
  })
);

const faqSchema = z.array(
  z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })
);

const reviewsSchema = z.object({
  overallRating: z.number().min(0).max(5),
  reviewCount: z.number().int().min(0),
  reviews: z.array(
    z.object({
      text: z.string().min(1),
      author: z.string().min(1),
      rating: z.number().int().min(1).max(5),
    })
  ),
});

const siteInfoSchema = z.object({
  name: z.string().min(1),
  tagline: z.string(),
  since: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    full: z.string(),
  }),
  phone: z.object({
    display: z.string(),
    tel: z.string(),
  }),
  social: z.object({
    instagram: z.string(),
    facebook: z.string(),
  }),
  maps: z.object({
    embedUrl: z.string(),
    directionsUrl: z.string(),
  }),
  seo: z.object({
    titleTemplate: z.string(),
    description: z.string(),
    ogImage: z.string(),
  }),
});

const gallerySchema = z.array(
  z.object({
    id: z.string().min(1),
    src: z.string().min(1),
    alt: z.string(),
    caption: z.string().optional(),
    category: z.string(),
    isPlaceholder: z.boolean(),
  })
);

const specialsSchema = z.array(
  z.object({
    day: z.string().min(1),
    title: z.string(),
    description: z.string(),
    price: z.string().optional(),
    active: z.boolean(),
  })
);

const schemas: Record<string, z.ZodType> = {
  menu: menuSchema,
  hours: hoursSchema,
  faq: faqSchema,
  reviews: reviewsSchema,
  site_info: siteInfoSchema,
  gallery: gallerySchema,
  specials: specialsSchema,
};

// GET /api/admin/content/:key
adminContentRouter.get("/content/:key", async (req, res) => {
  const { key } = req.params;
  if (!schemas[key]) {
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

// PUT /api/admin/content/:key
adminContentRouter.put("/content/:key", async (req, res) => {
  const { key } = req.params;
  const schema = schemas[key];

  if (!schema) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid content", details: parsed.error.flatten() });
    return;
  }

  const updated = await updateContent(key, parsed.data);
  res.json(updated.value);
});
