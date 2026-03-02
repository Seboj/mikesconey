import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { uploadImage, deleteImage } from "../services/s3.service.js";
import { getContent, updateContent } from "../services/content.service.js";

export const adminGalleryRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category: string;
  isPlaceholder: boolean;
  s3Key?: string;
}

async function getGallery(): Promise<GalleryImage[]> {
  const data = await getContent("gallery");
  return (data as GalleryImage[]) || [];
}

// POST /api/admin/gallery/upload
adminGalleryRouter.post("/gallery/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No image file provided" });
    return;
  }

  const { alt = "", caption = "", category = "food" } = req.body;

  // Resize and convert to WebP
  const processed = await sharp(req.file.buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const { key, url } = await uploadImage(processed, "image/webp");

  const newImage: GalleryImage = {
    id: randomUUID(),
    src: url,
    alt,
    caption: caption || undefined,
    category,
    isPlaceholder: false,
    s3Key: key,
  };

  const gallery = await getGallery();
  gallery.push(newImage);
  await updateContent("gallery", gallery);

  res.status(201).json(newImage);
});

// DELETE /api/admin/gallery/:id
adminGalleryRouter.delete("/gallery/:id", async (req, res) => {
  const gallery = await getGallery();
  const index = gallery.findIndex((img) => img.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  const image = gallery[index];

  // Delete from S3 if it's a real upload (not a placeholder)
  if (!image.isPlaceholder && image.s3Key) {
    await deleteImage(image.s3Key);
  }

  gallery.splice(index, 1);
  await updateContent("gallery", gallery);

  res.json({ success: true });
});

// PATCH /api/admin/gallery/:id
adminGalleryRouter.patch("/gallery/:id", async (req, res) => {
  const gallery = await getGallery();
  const image = gallery.find((img) => img.id === req.params.id);

  if (!image) {
    res.status(404).json({ error: "Image not found" });
    return;
  }

  const { alt, caption, category } = req.body;
  if (alt !== undefined) image.alt = alt;
  if (caption !== undefined) image.caption = caption || undefined;
  if (category !== undefined) image.category = category;

  await updateContent("gallery", gallery);

  res.json(image);
});
