import { Router } from "express";
import { z } from "zod";
import {
  createCustomer,
  findCustomerByEmail,
} from "../services/customer.service.js";
import { rateLimit } from "../middleware/rate-limit.js";

export const customersRouter = Router();

// 10 signups per IP per 15 minutes
customersRouter.use(rateLimit(10, 15 * 60 * 1000));

const customerCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  optInEmail: z.boolean().optional(),
  optInSms: z.boolean().optional(),
  source: z.string().max(50).optional(),
});

// Public signup endpoint
customersRouter.post("/", async (req, res) => {
  const parsed = customerCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const existing = await findCustomerByEmail(parsed.data.email);
  if (existing) {
    res.status(409).json({ error: "This email is already subscribed" });
    return;
  }

  const customer = await createCustomer(parsed.data);
  res.status(201).json({ message: "Thanks for signing up!", id: customer.id });
});
