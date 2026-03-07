import { Router } from "express";
import { z } from "zod";
import {
  getDashboardStats,
  listCustomers,
  getCustomerById,
  createCustomer,
  findCustomerByEmail,
  updateCustomer,
  deleteCustomer,
} from "../services/customer.service.js";

export const dashboardRouter = Router();

// Dashboard stats
dashboardRouter.get("/dashboard/stats", async (_req, res) => {
  const stats = await getDashboardStats();
  res.json(stats);
});

// List customers (paginated, searchable)
dashboardRouter.get("/customers", async (req, res) => {
  const params = {
    search: req.query.search as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 25,
    sort: req.query.sort as string | undefined,
    order: (req.query.order as "asc" | "desc") || "desc",
  };

  const result = await listCustomers(params);
  res.json(result);
});

// Create customer (admin — no rate limit)
const customerCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  optInEmail: z.boolean().optional(),
  optInSms: z.boolean().optional(),
  source: z.string().max(50).optional(),
  notes: z.string().nullable().optional(),
});

dashboardRouter.post("/customers", async (req, res) => {
  const parsed = customerCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const existing = await findCustomerByEmail(parsed.data.email);
  if (existing) {
    res.status(409).json({ error: "A customer with this email already exists" });
    return;
  }

  const customer = await createCustomer({
    ...parsed.data,
    source: parsed.data.source || "admin",
  });

  // If notes were provided, update the customer (createCustomer doesn't accept notes)
  if (parsed.data.notes) {
    await updateCustomer(customer.id, { notes: parsed.data.notes });
  }

  res.status(201).json(customer);
});

// Get single customer
dashboardRouter.get("/customers/:id", async (req, res) => {
  const customer = await getCustomerById(req.params.id);
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(customer);
});

// Update customer
const customerUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).nullable().optional(),
  optInEmail: z.boolean().optional(),
  optInSms: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

dashboardRouter.patch("/customers/:id", async (req, res) => {
  const parsed = customerUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const updated = await updateCustomer(req.params.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(updated);
});

// Delete customer
dashboardRouter.delete("/customers/:id", async (req, res) => {
  const deleted = await deleteCustomer(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json({ message: "Customer deleted" });
});
